const Folio = require("../models/folioModel");
const db = require("../config/db");
exports.orderService = async (req, res) => {
  try {
    const { booking_id, service_id, quantity } = req.body;
    const [serviceRows] = await db.query(
      "SELECT price FROM Services WHERE id = ?",
      [service_id],
    );
    if (serviceRows.length === 0) {
      return res.status(404).json({ message: "Dịch vụ không tồn tại!" });
    }
    const unit_price = serviceRows[0].price;
    const total_price = unit_price * quantity;
    await Folio.addServiceToBooking(
      booking_id,
      service_id,
      quantity,
      total_price,
    );

    return res.status(201).json({
      status: "OK",
      message: "Thêm dịch vụ thành công!",
      added_cost: total_price,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getCheckoutFolio = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const folioDetails = await Folio.getFolioDetails(booking_id);
    return res.status(200).json({
      status: "OK",
      data: folioDetails,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.deleteFolioItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Folio.getItemById(id);
    if (!item) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy dịch vụ đã yêu cầu!" });
    }
    if (item.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Lễ tân đã phục vụ dịch vụ này, không thể hủy!" });
    }
    await Folio.deleteItem(id);
    return res
      .status(200)
      .json({ status: "OK", message: "Hủy dịch vụ thành công!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.markItemDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    await Folio.updateItemStatus(id, "Delivered");
    return res
      .status(200)
      .json({ status: "OK", message: "Đã đánh dấu phục vụ thành công!" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi cập nhật trạng thái dịch vụ" });
  }
};

exports.getAllPendingOrders = async (req, res) => {
  try {
    const data = await Folio.getPendingOrders();
    return res.status(200).json({ status: "OK", data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
