const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.post("/create", verifyToken, bookingController.createBooking);
router.post(
  "/walk-in",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  bookingController.createWalkInBooking,
);
router.patch(
  "/check-in/:id",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  bookingController.checkIn,
);
router.patch(
  "/check-out/:id",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  bookingController.checkOut,
);
router.put(
  "/change-room/:id",
  verifyToken,
  authorizeRoles("Admin", "Receptionist"),
  bookingController.changeRoom,
);
router.get("/my-bookings", verifyToken, bookingController.getUserBookings);
router.post("/:id/review", verifyToken, bookingController.addReview);
router.get(
  "/current/room/:roomId",
  bookingController.getCurrentBookingByRoomId,
);
router.put("/:id/checkin", verifyToken, bookingController.checkIn);
router.put("/:id/confirm", verifyToken, bookingController.confirmDeposit);
router.patch("/:id/cancel", verifyToken, bookingController.cancelBooking);
router.get("/admin/all", verifyToken, bookingController.getAllBookingsAdmin);

module.exports = router;
