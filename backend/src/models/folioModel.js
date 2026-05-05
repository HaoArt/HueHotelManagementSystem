const db = require("../config/db");
const { create } = require("./bookingModel");

const Folio = {
  addServiceToBooking: async (
    booking_id,
    service_id,
    quantity,
    total_price,
  ) => {
    const [result] = await db.query(
      "INSERT INTO booking_services (booking_id, service_id, quantity, total_price) VALUES (?, ?, ?, ?)",
      [booking_id, service_id, quantity, total_price],
    );
    return result.insertId;
  },
  getFolioDetails: async (booking_id) => {
    const [bookingData] = await db.query(
      "SELECT * FROM bookings WHERE id = ?",
      [booking_id],
    );
    if (bookingData.length === 0) {
      throw new Error("Không tìm thấy thông tin đơn đặt phòng!");
    }
    const [servicesData] = await db.query(
      `SELECT bs.quantity, bs.total_price, bs.created_at, s.name as services_name, s.price as unit_price 
      FROM booking_services bs 
      JOIN services s ON bs.service_id = s.id
      WHERE bs.booking_id=?`,
      [booking_id],
    );
    let totalServicesPrice = 0;
    servicesData.forEach((services) => {
      totalServicesPrice += parseFloat(services.total_price);
    });
    const roomTotal = parseFloat(bookingData[0].total_amount) || 0;
    const deposit = parseFloat(bookingData[0].deposit_amount) || 0;
    return {
      booking_info: bookingData[0],
      services: servicesData,
      roomTotal: roomTotal,
      services_total: totalServicesPrice,
      deposit_amount: deposit,
      grand_total: roomTotal + totalServicesPrice - deposit,
    };
  },
};

module.exports = Folio;
