// backend/src/routes/auditRoutes.js
const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

// Route lấy danh sách log, chỉ cho phép Admin truy cập
router.get(
  "/",
  verifyToken,
  authorizeRoles("Admin"),
  auditController.getAuditLogs,
);

module.exports = router;
