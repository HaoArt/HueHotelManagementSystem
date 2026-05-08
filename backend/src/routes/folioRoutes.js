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
  authorizeRoles("Admin", "Receptionist", "Customer"),
  folioController.orderService,
);

router.get(
  "/checkout/:booking_id",
  verifyToken,
  authorizeRoles("Admin", "Receptionist", "Customer"),
  folioController.getCheckoutFolio,
);

router.delete(
  "/item/:id",
  verifyToken,
  authorizeRoles("Admin", "Receptionist", "Customer"),
  folioController.deleteFolioItem,
);

router.put(
  "/item/:id/deliver",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  folioController.markItemDelivered,
);
router.get(
  "/pending",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  folioController.getAllPendingOrders,
);

module.exports = router;
