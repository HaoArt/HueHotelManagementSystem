const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.post("/", contactController.submitContact);

router.get(
  "/",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  contactController.getAllContacts,
);

router.put(
  "/:id/read",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  contactController.markAsRead,
);

router.post(
  "/:id/reply",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  contactController.replyContact,
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  contactController.deleteContact,
);

module.exports = router;
