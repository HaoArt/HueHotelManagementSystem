const Service = require("../models/serviceModel");

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.getAll();
    res.status(200).json({ status: "OK", data: services });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.addService = async (req, res) => {
  try {
    const serviceId = await Service.create(req.body);
    res
      .status(201)
      .json({
        status: "OK",
        message: "Thêm dịch vụ thành công!",
        id: serviceId,
      });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Lỗi thêm dịch vụ" });
  }
};

exports.updateService = async (req, res) => {
  try {
    await Service.update(req.params.id, req.body);
    res.status(200).json({ status: "OK", message: "Cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Lỗi cập nhật dịch vụ" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    await Service.delete(req.params.id);
    res.status(200).json({ status: "OK", message: "Xóa dịch vụ thành công!" });
  } catch (error) {
    // Nếu lỗi dính khóa ngoại (đã có khách dùng DV này thì không cho xóa)
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Không thể xóa dịch vụ đã được khách hàng sử dụng!",
        });
    }
    res.status(500).json({ status: "error", message: "Lỗi xóa dịch vụ" });
  }
};
