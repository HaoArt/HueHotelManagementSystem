const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.get("/top", reviewController.getTopReviews);

module.exports = router;
