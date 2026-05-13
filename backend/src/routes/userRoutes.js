const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const uploadCloud = require("../config/cloudinary");

router.get(
  "/admin/accounts",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  userController.getAllAccounts,
);
router.post(
  "/admin/accounts",
  verifyToken,
  authorizeRoles("Admin"),
  userController.createAccount,
);
router.patch(
  "/admin/customers/:id/status",
  verifyToken,
  authorizeRoles("Admin"),
  userController.updateCustomerStatus,
);
router.post(
  "/admin/reset-password/:id",
  verifyToken,
  authorizeRoles("Admin"),
  userController.adminResetPassword,
);
router.get(
  "/admin/search-phone",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  userController.getUserByPhone,
);
router.get("/profile", verifyToken, userController.getProfile);
router.put(
  "/profile",
  verifyToken,
  uploadCloud.fields([{ name: "avatar", maxCount: 1 }]),
  userController.updateProfile,
);
module.exports = router;
