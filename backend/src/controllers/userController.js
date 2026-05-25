const User = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await User.getAllAccounts();
    return res.status(200).json({ status: "OK", data: accounts });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi tải danh sách tài khoản" });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email này đã được sử dụng trên hệ thống!" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await User.createInternalAccount({
      full_name,
      email,
      phone,
      password_hash,
      role,
    });
    return res
      .status(201)
      .json({ status: "OK", message: "Đã tạo tài khoản thành công!" });
  } catch (error) {
    console.error("Lỗi tạo tài khoản:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi server khi tạo tài khoản" });
  }
};

exports.updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Không cho phép tự khóa chính mình hoặc khóa Admin khác
    const targetUser = await User.findById(id);
    if (targetUser.role === "Admin" && req.user.id !== 1) {
      return res
        .status(403)
        .json({ message: "Không thể khóa tài khoản Quản trị viên tối cao!" });
    }

    await User.updateStatus(id, status);
    return res.status(200).json({
      status: "OK",
      message:
        status === "Blacklisted"
          ? "Đã khóa tài khoản!"
          : "Đã mở khóa tài khoản!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi cập nhật trạng thái" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const user = await User.findById(userId);
    const rankInfo = await User.getRankBySpending(user.total_spent);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy người dùng" });
    }
    const { password_hash, ...userInfo } = user;
    return res
      .status(200)
      .json({ status: "OK", data: { userInfo, rank: rankInfo } });
  } catch (error) {
    console.error("Lỗi lấy profile:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    let { full_name, phone, identity_number } = req.body;
    let avatar_url = req.body.avatar_url;
    if (req.files) {
      if (req.files.avatar) avatar_url = req.files.avatar[0].path;
    }
    const currentUser = await User.findById(userId);
    const finalIdentityNumber = currentUser.identity_number
      ? currentUser.identity_number
      : identity_number;
    await User.updateProfile(
      userId,
      full_name,
      phone,
      avatar_url,
      finalIdentityNumber,
    );
    const updatedUser = await User.findById(userId);
    return res.status(200).json({
      status: "OK",
      message: "Cập nhật thông tin thành công!",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.adminResetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const defaultPassword = "Huehotel@123";

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(defaultPassword, salt);

    await User.updatePassword(user.email, password_hash);

    return res.status(200).json({
      status: "OK",
      message: `Đã cấp lại mật khẩu! Mật khẩu mới là: ${defaultPassword}`,
    });
  } catch (error) {
    console.error("Lỗi reset password:", error);
    return res.status(500).json({ message: "Lỗi server khi cấp lại mật khẩu" });
  }
};
exports.getUserByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp số điện thoại" });
    }
    const user = await User.findByPhone(phone);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    return res.status(200).json({ status: "OK", data: user });
  } catch (error) {
    console.error("Lỗi tìm user bằng SĐT:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};
