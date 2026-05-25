
const Review = require("../models/reviewModel");

exports.getReviewsByRoomType = async (req, res) => {
  try {
    const { id } = req.params; 
    const reviews = await Review.getByRoomTypeId(id);
    return res.status(200).json({ status: "OK", data: reviews });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi khi tải đánh giá" });
  }
};

exports.getTopReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const data = await Review.getTop(limit);
    return res.status(200).json({ status: "OK", data });
  } catch (error) {
    console.error("Lỗi tải top đánh giá:", error);
    return res.status(500).json({ status: "error", message: "Lỗi tải đánh giá" });
  }
};