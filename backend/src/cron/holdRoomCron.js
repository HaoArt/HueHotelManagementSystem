const cron = require("node-cron");
const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Audit = require("../models/auditModel");

cron.schedule("* * * * *", async () => {
  try {
    const expiredBookings = await Booking.getExpiredPendingBookings();
    const noShowBookings = await Booking.getNoShowBookings();
    if (expiredBookings.length > 0) {
      for (const booking of expiredBookings) {
        await Booking.updateStatus(booking.id, "Cancelled");
        await Room.updateStatus(booking.room_id, "Available");
        await User.updateTrustScore(booking.user_id, -20);

        await Audit.logAction(
          null,
          "AUTO_CANCEL_EXPIRED",
          booking.id,
          { status: "Pending" },
          { status: "Cancelled", penalty: "Trust Score -20" },
          "SYSTEM_Cron",
        );
        console.log(
          `Cron Đã tự động hủy đơn ${booking.id} do quá 15 phút không cọc.`,
        );
      }
    }

    //Xử lý khách ko đến
    if (noShowBookings.length > 0) {
      for (const booking of noShowBookings) {
        await Booking.updateStatus(booking.id, "Cancelled");
        await Room.updateStatus(booking.room_id, "Available");
        await User.updateTrustScore(booking.user_id, -50);

        await Audit.logAction(
          null,
          "AUTO_CANCEL_NOSHOW",
          booking.id,
          { status: "Confirmed" },
          { status: "Cancelled", penalty: "Trust Score -50" },
          "SYSTEM_Cron",
        );
        console.log(`Cron Đã tự động hủy đơn ${booking.id} do khách No-show.`);
      }
    }
  } catch (error) {
    console.error("Cron Lỗi khi chạy Job tự động hủy phòng:", error);
  }
});

module.exports = cron;
