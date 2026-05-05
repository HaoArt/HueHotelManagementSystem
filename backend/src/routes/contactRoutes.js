const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

// 1. Khách hàng gửi thư liên hệ
router.post("/", contactController.submitContact);

// 2. Admin lấy danh sách toàn bộ thư
router.get(
  "/",
  verifyToken,
  authorizeRoles("Admin"),
  contactController.getAllContacts,
);


router.put(
  "/:id/read",
  verifyToken,
  authorizeRoles("Admin"),
  contactController.markAsRead,
);


router.post(
  "/:id/reply",
  verifyToken,
  authorizeRoles("Admin"),
  contactController.replyContact,
);


router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  contactController.deleteContact,
);

module.exports = router;
