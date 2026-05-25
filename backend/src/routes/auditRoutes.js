
const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");


router.get(
  "/",
  verifyToken,
  authorizeRoles("Admin"),
  auditController.getAuditLogs,
);

module.exports = router;
