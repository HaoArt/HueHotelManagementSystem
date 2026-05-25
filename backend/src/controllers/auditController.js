const Audit = require("../models/auditModel");

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await Audit.getLogs();
    return res.status(200).json({ status: "OK", data: logs });
  } catch (error) {
    console.error("Lỗi lấy nhật ký hệ thống:", error);
    return res
      .status(500)
      .json({
        status: "error",
        message: "Lỗi server khi tải nhật ký hoạt động",
      });
  }
};
