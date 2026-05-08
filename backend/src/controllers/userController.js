const User = require("../models/userModel");

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.getAllCustomers();
    res.status(200).json({ status: "OK", data: customers });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Lỗi tải danh sách khách hàng" });
  }
};

exports.updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Active' hoặc 'Blacklisted'

    await User.updateStatus(id, status);
    res.status(200).json({
      status: "OK",
      message:
        status === "Blacklisted"
          ? "Đã đưa khách hàng vào Danh sách đen!"
          : "Đã mở khóa tài khoản khách hàng!",
    });
  } catch (error) {
    res
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
    const { full_name, phone } = req.body;
    await User.updateProfile(userId, full_name, phone);
    return res
      .status(200)
      .json({ status: "OK", message: "Cập nhật thông tin thành công!" });
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
      return res.status(404).json({ message: "Không tìm thấy khách hàng!" });
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
