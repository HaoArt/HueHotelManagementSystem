const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Lấy danh sách đánh giá nổi bật cho trang chủ (public)
router.get("/top", reviewController.getTopReviews);

module.exports = router;
