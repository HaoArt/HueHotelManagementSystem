const cron = require("node-cron");
const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Audit = require("../models/auditModel");
const emailService = require("../utils/emailService");

cron.schedule("* * * * *", async () => {
  try {
    const expiredBookings = await Booking.getExpiredPendingBookings();
    const noShowBookings = await Booking.getNoShowBookings();
    if (expiredBookings.length > 0) {
      for (const booking of expiredBookings) {
        await Booking.updateStatus(booking.id, "Cancelled");

        // Chỉ giải phóng phòng nếu không có khách nào đang lưu trú và phòng đang thực sự bị khóa (Occupied)
        const currentOccupant = await Booking.getCurrentBookingByRoom(
          booking.room_id,
        );
        const room = await Room.getById(booking.room_id);
        if (!currentOccupant && room && room.status === "Occupied") {
          await Room.updateStatus(booking.room_id, "Available");
        }

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

        // Gửi email thông báo hủy do không thanh toán
        const user = await User.findById(booking.user_id);
        if (user && user.email) {
          await emailService
            .sendCancellationEmail(user.email, user.full_name, booking.id, 0)
            .catch((err) => {
              console.error("Cron lỗi gửi email hủy Pending:", err);
            });
        }
      }
    }

    //Xử lý khách ko đến
    if (noShowBookings.length > 0) {
      for (const booking of noShowBookings) {
        await Booking.updateStatus(booking.id, "Cancelled");

        // Chỉ giải phóng phòng nếu không có khách nào đang lưu trú và phòng đang thực sự bị khóa (Occupied)
        const currentOccupant = await Booking.getCurrentBookingByRoom(
          booking.room_id,
        );
        const room = await Room.getById(booking.room_id);
        if (!currentOccupant && room && room.status === "Occupied") {
          await Room.updateStatus(booking.room_id, "Available");
        }

        await User.updateTrustScore(booking.user_id, -30);

        await Audit.logAction(
          null,
          "AUTO_CANCEL_NOSHOW",
          booking.id,
          { status: "Confirmed" },
          { status: "Cancelled", penalty: "Trust Score -30" },
          "SYSTEM_Cron",
        );
        console.log(`Cron Đã tự động hủy đơn ${booking.id} do khách No-show.`);

        // Gửi email thông báo hủy và báo cáo tịch thu cọc (nếu có)
        const fullBooking = await Booking.getById(booking.id);
        const user = await User.findById(booking.user_id);
        if (user && user.email && fullBooking) {
          await emailService
            .sendCancellationEmail(
              user.email,
              user.full_name,
              booking.id,
              parseFloat(fullBooking.deposit_amount || 0),
            )
            .catch((err) => {
              console.error("Cron lỗi gửi email hủy No-show:", err);
            });
        }
      }
    }
  } catch (error) {
    console.error("Cron Lỗi khi chạy Job tự động hủy phòng:", error);
  }
});

module.exports = cron;
