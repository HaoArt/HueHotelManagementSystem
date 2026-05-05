const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.get(
  "/",
  verifyToken,
  authorizeRoles("Admin"),
  dashboardController.getDashboardData,
);
router.get(
  "/stats",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  dashboardController.getStats,
);

module.exports = router;
