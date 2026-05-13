const SystemConfig = require("../models/configModel");

exports.getConfigs = async (req, res) => {
  try {
    const configs = await SystemConfig.getAll();
    res.status(200).json({ status: "OK", data: configs });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải cấu hình hệ thống" });
  }
};

exports.updateConfigs = async (req, res) => {
  try {
    const { settings } = req.body; // Mảng [ {key: '...', value: '...'}, ... ]
    for (const item of settings) {
      await SystemConfig.update(item.key, item.value);
    }
    res
      .status(200)
      .json({ status: "OK", message: "Đã lưu thay đổi cấu hình!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật cấu hình" });
  }
};
