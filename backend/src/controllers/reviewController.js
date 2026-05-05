// controllers/reviewController.js
const Review = require("../models/reviewModel");

exports.getReviewsByRoomType = async (req, res) => {
  try {
    const { id } = req.params; // room_type_id
    const reviews = await Review.getByRoomTypeId(id);
    res.status(200).json({ status: "OK", data: reviews });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Lỗi khi tải đánh giá" });
  }
};

exports.getTopReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const data = await Review.getTop(limit);
    res.status(200).json({ status: "OK", data });
  } catch (error) {
    console.error("Lỗi tải top đánh giá:", error);
    res.status(500).json({ status: "error", message: "Lỗi tải đánh giá" });
  }
};