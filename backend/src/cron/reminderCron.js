const cron = require('node-cron');
const db = require('../config/db');
const { sendReminderEmail } = require('../utils/emailService');


cron.schedule('0 8 * * *', async () => {
  try {
    console.log("[CRON] Đang quét hệ thống để gửi Email nhắc nhở Check-in...");
    const [upcomingBookings] = await db.query(`
      SELECT b.id, b.check_in_date, b.hold_until, u.email, u.full_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'Confirmed' 
      AND DATE(b.check_in_date) = DATE(DATE_ADD(NOW(), INTERVAL 1 DAY))
    `);

    if (upcomingBookings.length > 0) {
      for (const booking of upcomingBookings) {
        await sendReminderEmail(
          booking.email, 
          booking.full_name, 
          booking
        );
        console.log(`[EMAIL SENT] Đã gửi nhắc nhở cho khách ${booking.full_name} (${booking.email})`);
      }
    } else {
      console.log("[CRON] Không có khách nào nhận phòng vào ngày mai.");
    }
  } catch (error) {
    console.error("Lỗi Cron Job gửi mail nhắc nhở:", error);
  }
});