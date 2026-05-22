const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const PendingUser = require("../models/pendingUserModel");
const User = require("../models/userModel");
const emailService = require("../utils/emailService");

exports.preRegister = async (req, res) => {
  try {
    const { full_name, email, phone, password, cccd_number } = req.body;
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "Error", message: "Email đã tồn tại" });
    }
    const existingPhone = await User.findByPhone(phone);
    if (existingPhone) {
      return res
        .status(400)
        .json({ status: "Error", message: "Số điện thoại đã tồn tại" });
    }
    const existingCccd = await User.findByCccd(cccd_number);
    if (existingCccd) {
      return res
        .status(400)
        .json({ status: "Error", message: "Căn cước công dân đã tồn tại" });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expiry = new Date(Date.now() + 5 * 60000);
    await PendingUser.create({
      full_name,
      email,
      phone,
      password_hash,
      otp_code,
      otp_expiry,
      cccd_number,
    });

    await emailService.sendEmailOtp(email, otp_code);
    return res
      .status(201)
      .json({ status: "OK", message: "Mã đã được gửi đén email của bạn" });
  } catch (error) {
    console.error("===== LỖI ĐĂNG KÝ BƯỚC 1 =====", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.verifyAndCreate = async (req, res) => {
  try {
    const { email, otp_code } = req.body;
    const pendingUser = await PendingUser.findByEmail(email);
    if (!pendingUser) {
      return res
        .status(400)
        .json({ status: "Error", message: "Yêu cầu không hợp lệ" });
    }
    if (String(pendingUser.otp_code) !== String(otp_code)) {
      return res
        .status(400)
        .json({ status: "Error", message: "Mã OTP không hợp lệ " });
    }
    if (pendingUser.otp_expiry < new Date()) {
      return res
        .status(400)
        .json({ status: "Error", message: "Mã OTP đã hết hạn" });
    }
    const UserId = await User.create({
      full_name: pendingUser.full_name,
      email: pendingUser.email,
      phone: pendingUser.phone,
      password_hash: pendingUser.password_hash,
      cccd_number: pendingUser.cccd_number,
    });
    await PendingUser.delete(email);
    return res
      .status(201)
      .json({ status: "OK", message: "Tạo tài khoản thành công" });
  } catch (error) {
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
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
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
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "Email không tồn tại" });
    }
    await PendingUser.delete(email);
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expiry = new Date(Date.now() + 5 * 60000);
    await PendingUser.create({ email, otp_code, otp_expiry });
    await emailService.sendEmailOtp(email, otp_code);
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
    const pendingUser = await PendingUser.findByEmail(email);
    if (!pendingUser) {
      return res
        .status(400)
        .json({ status: "error", message: "Yêu cầu không hợp lệ" });
    }
    if (pendingUser.otp_code !== otp_code) {
      return res
        .status(400)
        .json({ status: "error", message: "Mã OTP không hợp lệ" });
    }
    if (pendingUser.otp_expiry < new Date()) {
      return res
        .status(400)
        .json({ status: "error", message: "Mã OTP đã hết hạn" });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);
    await User.updatePassword(email, password_hash);
    await PendingUser.delete(email);
    return res
      .status(200)
      .json({ status: "ok", message: "Mật khẩu đã thay đổi thành công" });
  } catch (error) {
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
