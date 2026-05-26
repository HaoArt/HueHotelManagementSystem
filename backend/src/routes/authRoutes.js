const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.post("/pre-register", authController.preRegister);
router.post("/verify-register", authController.verifyAndCreate);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-forgot-password", authController.verifyForgotPassword);
router.post("/change-password", verifyToken, authController.changePassword);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;
