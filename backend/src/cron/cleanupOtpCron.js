const cron = require("node-cron");
const User = require("../models/userModel");

cron.schedule("* * * * *", async () => {
  try {
    const deletedCount = await User.cleanupExpiredOTPs();

    if (deletedCount > 0) {
      console.log(
        `Cron Job Đã dọn dẹp thành công ${deletedCount} yêu cầu đăng ký bị quá hạn OTP.`,
      );
    }
  } catch (error) {
    console.error("Cron Job Lỗi khi dọn dẹp bảng pending_users:", error);
  }
});

module.exports = cron;
