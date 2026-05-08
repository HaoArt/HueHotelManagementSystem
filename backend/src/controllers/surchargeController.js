const Surcharge = require("../models/surchargeModel");
const Audit = require("../models/auditModel");

exports.getAllRules = async (req, res) => {
  try {
    const rules = await Surcharge.getAll();
    res.status(200).json({ status: "OK", data: rules });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải dữ liệu giá" });
  }
};

exports.createRule = async (req, res) => {
  try {
    const adminId = req.user.id || req.user.userId;
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const newId = await Surcharge.create(req.body);

    // GHI AUDIT LOG
    await Audit.logAction(
      adminId,
      "CREATE_SEASONAL_PRICE",
      newId,
      null,
      req.body,
      clientIp,
    );

    res
      .status(201)
      .json({ status: "OK", message: "Đã thiết lập cấu hình giá thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo cấu hình giá" });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id || req.user.userId;
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const oldData = await Surcharge.getById(id);
    if (!oldData)
      return res.status(404).json({ message: "Không tìm thấy cấu hình này" });

    await Surcharge.update(id, req.body);

    await Audit.logAction(
      adminId,
      "UPDATE_SEASONAL_PRICE",
      id,
      oldData,
      req.body,
      clientIp,
    );

    res.status(200).json({ status: "OK", message: "Cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật cấu hình" });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id || req.user.userId;
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const oldData = await Surcharge.getById(id);
    if (!oldData)
      return res.status(404).json({ message: "Không tìm thấy cấu hình này" });

    await Surcharge.delete(id);

    await Audit.logAction(
      adminId,
      "DELETE_SEASONAL_PRICE",
      id,
      oldData,
      null,
      clientIp,
    );

    res.status(200).json({ status: "OK", message: "Đã xóa cấu hình giá!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa cấu hình" });
  }
};
