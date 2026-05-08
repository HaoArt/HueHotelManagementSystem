// d:\HueHotelManagementSystem\backend\src\controllers\promotionController.js (File mới)
const Coupon = require("../models/couponModel");

exports.getActiveCoupons = async (req, res) => {
  try {
    // Hàm findActive trong model sẽ lấy các khuyến mãi có is_active = 1
    // và ngày hết hạn > ngày hiện tại (hoặc null)
    const data = await Coupon.findActive();
    res.status(200).json({ status: "OK", data });
  } catch (error) {
    console.error("Lỗi tải khuyến mãi:", error);
    res.status(500).json({ status: "error", message: "Lỗi tải khuyến mãi" });
  }
};
exports.getActiveCouponsForUser = async (req, res) => {
  try {
    const user_id = req.user.id || req.user.userId;
    const data = await Coupon.findActiveForUser(user_id);
    res.status(200).json({ status: "OK", data });
  } catch (error) {
    console.error("Lỗi tải khuyến mãi cho user:", error);
    res.status(500).json({ status: "error", message: "Lỗi tải khuyến mãi" });
  }
};
exports.getAllCoupons = async (req, res) => {
  try {
    const data = await Coupon.findAll();
    res.status(200).json({ status: "OK", data });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi tải khuyến mãi" });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const existingCoupon = await Coupon.findByCode(code);
    if (existingCoupon) {
      return res
        .status(400)
        .json({ status: "error", message: "Mã giảm giá này đã tồn tại!" });
    }

    await Coupon.create(req.body);
    return res
      .status(201)
      .json({ status: "OK", message: "Tạo mã giảm giá thành công!" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi server khi tạo mã" });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await Coupon.update(id, req.body);
    return res
      .status(200)
      .json({ status: "OK", message: "Cập nhật mã giảm giá thành công!" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi server khi cập nhật mã" });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await Coupon.delete(id);
    return res
      .status(200)
      .json({ status: "OK", message: "Xóa mã giảm giá thành công!" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi server khi xóa mã" });
  }
};
