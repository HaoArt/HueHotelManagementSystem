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
