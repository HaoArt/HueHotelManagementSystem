const cron = require("node-cron");
const db = require("../config/db");
const { sendReminderEmail } = require("../utils/emailService");

cron.schedule("0 8 * * *", async () => {
  try {
    console.log("[CRON] Đang quét hệ thống để gửi Email nhắc nhở Check-in...");

    // Gọi qua Model
    const upcomingBookings = await Booking.getUpcomingBookingsForReminder();

    if (upcomingBookings.length > 0) {
      for (const booking of upcomingBookings) {
        // BAO BỌC TRY-CATCH CHO TỪNG EMAIL
        // Mục đích: Nếu 1 email gửi thất bại, vòng lặp vẫn chạy tiếp cho người khác
        try {
          await sendReminderEmail(booking.email, booking.full_name, booking);
          console.log(
            `[EMAIL SENT] Đã gửi nhắc nhở cho khách ${booking.full_name} (${booking.email})`,
          );
        } catch (mailErr) {
          console.error(
            `[EMAIL ERROR] Bỏ qua lỗi gửi mail cho ${booking.email}:`,
            mailErr.message,
          );
        }
      }
    } else {
      console.log("[CRON] Không có khách nào nhận phòng vào ngày mai.");
    }
  } catch (error) {
    console.error(
      "[CRON] Lỗi nghiêm trọng khi chạy Job gửi mail nhắc nhở:",
      error,
    );
  }
});
module.exports = cron;
