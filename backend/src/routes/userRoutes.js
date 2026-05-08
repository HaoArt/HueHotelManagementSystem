const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
router.get(
  "/admin/customers",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  userController.getAllCustomers,
);
router.patch(
  "/admin/customers/:id/status",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  userController.updateCustomerStatus,
);
router.post(
  "/admin/reset-password/:id",
  verifyToken,
  authorizeRoles("Admin"),
  userController.adminResetPassword,
);
router.get("/profile", verifyToken, userController.getProfile);
router.put("/profile", verifyToken, userController.updateProfile);

module.exports = router;
