const Audit = require("../models/auditModel");

exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; 
    const search = req.query.search || "";

    const offset = (page - 1) * limit;

    const result = await Audit.getLogs(limit, offset, search);


    if (result && result.data && Array.isArray(result.data)) {
      result.data = result.data.map((log) => {
        if (!log.user_id && log.ip_address === "SYSTEM_Cron") {
          return {
            ...log,
            full_name: "Hệ thống Tự động (Cron)",
            user_name: "Hệ thống Tự động (Cron)",
          };
        }
        return log;
      });
    }

    return res.status(200).json({
      status: "OK",
      data: result.data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.totalRecords / limit),
        totalRecords: result.totalRecords,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy nhật ký hệ thống:", error);
    return res.status(500).json({
      status: "error",
      message: "Lỗi server khi tải nhật ký hoạt động",
    });
  }
};
