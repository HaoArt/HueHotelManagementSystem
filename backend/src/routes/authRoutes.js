const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  otpLimiter,
  loginLimiter,
} = require("../middlewares/rateLimitMiddleware");

router.post("/pre-register", otpLimiter, authController.preRegister);
router.post("/verify-register", authController.verifyAndCreate);
router.post("/login", loginLimiter, authController.login);
router.post("/forgot-password", otpLimiter, authController.forgotPassword);
router.post("/verify-forgot-password", authController.verifyForgotPassword);
router.post("/change-password", verifyToken, authController.changePassword);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;
