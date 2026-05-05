const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.get("/", verifyToken, roomController.getRooms);
router.post("/", verifyToken, authorizeRoles("Admin"), roomController.addRoom);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  roomController.updateRoom,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  roomController.deleteRoom,
);
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  roomController.updateStatus,
);

module.exports = router;
