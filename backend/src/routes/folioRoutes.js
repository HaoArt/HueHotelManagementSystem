const express = require("express");
const router = express.Router();
const folioController = require("../controllers/folioController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.post(
  "/add-service",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  folioController.orderService,
);
router.get(
  "/checkout/:booking_id",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  folioController.getCheckoutFolio,
);

module.exports = router;
