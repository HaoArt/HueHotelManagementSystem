const cron = require("node-cron");
const db = require("../config/db"); 

cron.schedule("* * * * *", async () => {
  try {
    const query = "DELETE FROM pending_users WHERE otp_expiry < NOW()";
    const [result] = await db.query(query);
    if (result.affectedRows > 0) {
      console.log(
        `[Cron Job] 🧹 Đã dọn dẹp thành công ${result.affectedRows} yêu cầu đăng ký bị quá hạn OTP.`,
      );
    }
  } catch (error) {
    console.error("[Cron Job] ❌ Lỗi khi dọn dẹp bảng pending_users:", error);
  }
});

module.exports = cron;
