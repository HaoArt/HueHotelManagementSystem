const cron = require("node-cron");
const db = require("../config/db");
const User = require("../models/userModel");
const Audit = require("../models/auditModel");
cron.schedule("* * * * *", async () => {
  try {
    // Tìm các đơn đặt phòng trạng thái Pending đã tạo quá 15 phút
    const [expiredBookings] = await db.query(`
      SELECT id, room_id 
      FROM bookings 
      WHERE status = 'Pending' 
      AND created_at <= NOW() - INTERVAL 15 MINUTE
    `);

    const [noShowBookings] = await db.query(`
      SELECT b.id, b.room_id, b.user_id 
      FROM bookings b
      WHERE b.status = 'Confirmed' AND b.hold_until <= NOW()
    `);

    if (expiredBookings.length > 0) {
      for (const booking of expiredBookings) {
        await db.query(
          "UPDATE bookings SET status = 'Cancelled' WHERE id = ?",
          [booking.id],
        );
        await db.query("UPDATE rooms SET status = 'Available' WHERE id = ?", [
          booking.room_id,
        ]);
        await User.updateTrustScore(booking.user_id, -20);
        await Audit.logAction(
          null,
          "AUTO_CANCEL_NOSHOW",
          booking.id,
          { status: "Confirmed" },
          { status: "Cancelled", penalty: "Trust Score -20" },
          "SYSTEM_CRON",
        );
        console.log(
          `[CRON] Đã tự động hủy đơn ${booking.id} và giải phóng phòng ${booking.room_id} do quá 15 phút không thanh toán.`,
        );
      }
    }
    if (noShowBookings.length > 0) {
      for (const booking of noShowBookings) {
        // Hủy đơn
        await db.query(
          "UPDATE bookings SET status = 'Cancelled' WHERE id = ?",
          [booking.id],
        );
        // Giải phóng phòng
        await db.query("UPDATE rooms SET status = 'Available' WHERE id = ?", [
          booking.room_id,
        ]);
        // Phạt nặng điểm tín nhiệm vì đã giữ phòng nhưng không đến
        await User.updateTrustScore(booking.user_id, -20);

        await Audit.logAction(
          null,
          "AUTO_CANCEL_NOSHOW",
          booking.id,
          { status: "Confirmed" },
          { status: "Cancelled", penalty: "Trust Score -50" },
          "SYSTEM_CRON",
        );
        console.log(
          `[CRON] Đã hủy đơn No-Show ${booking.id} và giải phóng phòng ${booking.room_id}.`,
        );
      }
    }
  } catch (error) {
    console.error("Lỗi khi chạy Cron Job giải phóng phòng:", error);
  }
});
