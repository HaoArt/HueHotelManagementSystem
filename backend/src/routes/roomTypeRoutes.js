const express = require("express");
const router = express.Router();
const roomTypeController = require("../controllers/roomTypeController");
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.get("/", roomTypeController.getAllRoomTypes);
router.get("/top", roomTypeController.getTopRoomTypes);
router.get("/search", roomTypeController.searchRoomTypes);
router.get("/:id", roomTypeController.getRoomTypeById);
router.post(
  "/",
  verifyToken,
  authorizeRoles("Admin"),
  uploadMiddleware,
  roomTypeController.createRoomType,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  uploadMiddleware,
  roomTypeController.updateRoomType,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  roomTypeController.deleteRoomType,
);
router.get("/:id/reviews", roomTypeController.getReviewsByRoomType);

module.exports = router;
