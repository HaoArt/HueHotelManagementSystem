const cron = require("node-cron");
const Audit = require("../models/auditModel");

// Chạy vào lúc 02:00 sáng mỗi ngày: "0 2 * * *"
cron.schedule("0 2 * * *", async () => {
  try {
    // Tự động xóa các log cũ hơn 6 tháng để giữ database nhẹ nhàng
    const deletedCount = await Audit.cleanupOldLogs(6);

    if (deletedCount > 0) {
      console.log(
        `[CRON] Đã dọn dẹp thành công ${deletedCount} nhật ký hệ thống (Audit Logs) cũ hơn 6 tháng.`,
      );
    }
  } catch (error) {
    console.error("[CRON] Lỗi khi dọn dẹp bảng audit_logs:", error);
  }
});

module.exports = cron;
