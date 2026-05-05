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
