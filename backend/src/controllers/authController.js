const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const PendingUser = require("../models/pendingUserModel");
const User = require("../models/userModel");
const emailService = require("../utils/emailService");

const MAX_OTP_ATTEMPTS = 5;

exports.preRegister = async (req, res) => {
  try {
    const { full_name, email, phone, password, identity_number } = req.body;
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "Error", message: "Email đã tồn tại trên hệ thống." });
    }
    const existingPhone = await User.findByPhone(phone);
    if (existingPhone) {
      return res
        .status(400)
        .json({ status: "Error", message: "Số điện thoại đã tồn tại." });
    }
    const existingIdentity = await User.findByIdentity(identity_number);
    if (existingIdentity) {
      return res
        .status(400)
        .json({ status: "Error", message: "Căn cước công dân đã tồn tại." });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expiry = new Date(Date.now() + 5 * 60000);
    await PendingUser.delete(email);
    await PendingUser.create({
      full_name,
      email,
      phone,
      password_hash,
      otp_code,
      otp_expiry,
      identity_number,
    });

    // 5. Gửi Email (Có thể bọc trong try-catch riêng để không crash app nếu Email server lỗi)
    try {
      await emailService.sendEmailOtp(email, otp_code);
    } catch (emailError) {
      console.error("Lỗi gửi Email (SendGrid/SMTP):", emailError);
      await PendingUser.delete(email);
      return res.status(503).json({
        status: "error",
        message: "Hệ thống email đang bận, vui lòng thử lại sau ít phút.",
      });
    }

    return res.status(201).json({
      status: "OK",
      message:
        "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra (cả hộp thư rác).",
    });
  } catch (error) {
    console.error("===== LỖI ĐĂNG KÝ BƯỚC 1 =====", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.verifyAndCreate = async (req, res) => {
  try {
    const { email, otp_code } = req.body;
    const safeEmail = String(email).trim();
    const safeOtp = String(otp_code).trim();

    const pendingUser = await PendingUser.findByEmail(safeEmail);
    if (!pendingUser) {
      return res.status(400).json({
        status: "Error",
        message: "Yêu cầu không hợp lệ hoặc đã hết hạn.",
      });
    }
    if (new Date(pendingUser.otp_expiry) < new Date()) {
      await PendingUser.delete(safeEmail);
      return res.status(400).json({
        status: "Error",
        message: "Mã OTP đã hết hạn. Vui lòng đăng ký lại.",
      });
    }
    if (pendingUser.failed_attempts >= MAX_OTP_ATTEMPTS) {
      await PendingUser.delete(safeEmail);
      return res.status(403).json({
        status: "Error",
        message:
          "Bạn đã nhập sai quá nhiều lần. Yêu cầu đăng ký bị hủy bỏ để bảo mật.",
      });
    }
    if (String(pendingUser.otp_code) !== safeOtp) {
      const newAttempts = (pendingUser.failed_attempts || 0) + 1;

      await PendingUser.incrementFailedAttempts(safeEmail, newAttempts);

      const attemptsLeft = MAX_OTP_ATTEMPTS - newAttempts;
      if (attemptsLeft === 0) {
        await PendingUser.delete(safeEmail);
        return res.status(403).json({
          status: "Error",
          message: "Nhập sai quá 3 lần. Yêu cầu bị hủy bỏ.",
        });
      }

      return res.status(400).json({
        status: "Error",
        message: `Mã OTP không đúng. Bạn còn ${attemptsLeft} lần thử.`,
      });
    }
    await User.create({
      full_name: pendingUser.full_name,
      email: pendingUser.email,
      phone: pendingUser.phone,
      password_hash: pendingUser.password_hash,
      identity_number: pendingUser.identity_number,
    });

    await PendingUser.delete(safeEmail);

    return res.status(201).json({
      status: "OK",
      message: "Xác thực thành công. Tài khoản đã được tạo!",
    });
  } catch (error) {
    console.error("===== LỖI XÁC THỰC BƯỚC 2 =====", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "Email không tồn tại!" });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "error", message: "Mật khẩu của bạn không đúng" });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      status: "OK",
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Phiên làm việc hết hạn, vui lòng đăng nhập lại!",
      });
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ status: "error", message: "Quyền truy cập không hợp lệ!" });
        }

        // SỬA LỖI 1: Lấy đúng biến userId từ payload thay vì id
        const userId = decoded.userId || decoded.id;
        const user = await User.findById(userId);

        if (!user) {
          return res
            .status(404)
            .json({ status: "error", message: "Người dùng không tồn tại!" });
        }
        // SỬA LỖI 2: Chặn gia hạn Token nếu tài khoản đã bị Admin khóa
        if (user.status !== "Active") {
          return res
            .status(403)
            .json({
              status: "error",
              message: "Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa!",
            });
        }

        const newAccessToken = jwt.sign(
          { userId: user.id, role: user.role }, // Đồng bộ payload với hàm login
          process.env.JWT_SECRET,
          { expiresIn: "15m" },
        );
        return res.status(200).json({ status: "ok", token: newAccessToken });
      },
    );
  } catch (error) {
    console.error("Lỗi Refresh Token:", error);
    return res.status(500).json({ status: "error", message: "Lỗi hệ thống" });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res
    .status(200)
    .json({ status: "ok", message: "Đã đăng xuất hệ thống an toàn!" });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Email không tồn tại trên hệ thống",
      });
    }
    await PendingUser.delete(email);
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expiry = new Date(Date.now() + 5 * 60000);
    await PendingUser.create({ email, otp_code, otp_expiry });
    try {
      await emailService.sendEmailOtp(email, otp_code);
    } catch (e) {
      await PendingUser.delete(email);
      return res
        .status(503)
        .json({ status: "error", message: "Không thể gửi email OTP lúc này." });
    }
    return res
      .status(200)
      .json({ status: "OK", message: "Mã OTP đã được gửi đến email của bạn" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.verifyForgotPassword = async (req, res) => {
  try {
    const { email, otp_code, new_password } = req.body;
    const safeEmail = String(email).trim();
    const safeOtp = String(otp_code).trim();

    const pendingUser = await PendingUser.findByEmail(safeEmail);
    if (!pendingUser) {
      return res.status(400).json({
        status: "error",
        message: "Yêu cầu không hợp lệ hoặc đã hết hạn",
      });
    }
    if (new Date(pendingUser.otp_expiry) < new Date()) {
      await PendingUser.delete(safeEmail);
      return res.status(400).json({
        status: "error",
        message: "Mã OTP đã hết hạn. Vui lòng yêu cầu lại.",
      });
    }
    if (pendingUser.failed_attempts >= MAX_OTP_ATTEMPTS) {
      await PendingUser.delete(safeEmail);
      return res.status(403).json({
        status: "error",
        message: "Bạn đã nhập sai quá 3 lần. Yêu cầu khôi phục bị hủy bỏ.",
      });
    }
    if (String(pendingUser.otp_code) !== safeOtp) {
      const newAttempts = (pendingUser.failed_attempts || 0) + 1;
      await PendingUser.incrementFailedAttempts(safeEmail, newAttempts);

      const attemptsLeft = MAX_OTP_ATTEMPTS - newAttempts;
      if (attemptsLeft === 0) {
        await PendingUser.delete(safeEmail);
        return res.status(403).json({
          status: "error",
          message: "Nhập sai quá 3 lần. Yêu cầu bị khóa.",
        });
      }
      return res.status(400).json({
        status: "error",
        message: `Mã OTP không đúng. Bạn còn ${attemptsLeft} lần thử.`,
      });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);
    await User.updatePassword(safeEmail, password_hash);
    await PendingUser.delete(safeEmail);

    return res
      .status(200)
      .json({ status: "ok", message: "Mật khẩu đã được thay đổi thành công!" });
  } catch (error) {
    console.error("Lỗi xác thực Quên mật khẩu:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Bạn cần đăng nhập lại để thực hiện chức năng này!",
      });
    }
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "error", message: "Mật khẩu hiện tại không đúng" });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);
    await User.updatePassword(user.email, password_hash);
    return res
      .status(200)
      .json({ status: "OK", message: "Mật khẩu đã được thay đổi thành công" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};
