const db = require("../config/db");

const Folio = {
  addServiceToBooking: async (
    booking_id,
    service_id,
    quantity,
    total_price,
    usage_time,
    note,
    conn = db,
  ) => {
    const [result] = await conn.query(
      "INSERT INTO booking_services (booking_id, service_id, quantity, total_price, usage_time, note) VALUES (?, ?, ?, ?, ?, ?)",
      [
        booking_id,
        service_id,
        quantity,
        total_price,
        usage_time || null,
        note || null,
      ],
    );
    return result.insertId;
  },
  cancelItemWithFee: async (id, feeAmount) => {
    return await db.query(
      "UPDATE booking_services SET status = 'Cancelled', cancellation_fee = ? WHERE id = ?",
      [feeAmount, id],
    );
  },

  getFolioDetails: async (booking_id) => {
    const [bookingData] = await db.query(
      `SELECT b.*, rt.base_price 
       FROM bookings b 
       JOIN room_types rt ON b.room_type_id = rt.id 
       WHERE b.id = ?`,
      [booking_id],
    );
    if (bookingData.length === 0) {
      throw new Error("Không tìm thấy thông tin đơn đặt phòng!");
    }
    let roomTotal = parseFloat(bookingData[0].total_amount) || 0;

    // Đã xóa bỏ đoạn code tính toán lại roomTotal cũ vì nó làm mất các khoản phụ thu
    // Lễ/Tết, Check-in sớm, Check-out trễ, Đổi phòng đã được cập nhật chuẩn xác trong Database.

    const [servicesData] = await db.query(
      `SELECT bs.id, bs.status, bs.quantity, bs.total_price, bs.cancellation_fee, bs.created_at, bs.usage_time, bs.note, s.name as services_name, s.price as unit_price, s.service_type 
      FROM booking_services bs 
      JOIN services s ON bs.service_id = s.id
      WHERE bs.booking_id=?
      ORDER BY bs.created_at DESC`,
      [booking_id],
    );

    let totalServicesPrice = 0;
    servicesData.forEach((item) => {
      if (item.status === "Cancelled") {
        totalServicesPrice += parseFloat(item.cancellation_fee || 0);
      } else {
        totalServicesPrice += parseFloat(item.total_price || 0);
      }
    });

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

  getItemById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM booking_services WHERE id = ?",
      [id],
    );
    return rows[0];
  },

  deleteItem: async (id) => {
    return await db.query("DELETE FROM booking_services WHERE id = ?", [id]);
  },
  updateItemStatus: async (id, status) => {
    return await db.query(
      "UPDATE booking_services SET status = ? WHERE id = ?",
      [status, id],
    );
  },
  getPendingOrders: async () => {
    const [rows] = await db.query(
      `SELECT bs.id, bs.quantity, bs.created_at, s.name as service_name, r.room_number, b.id as booking_id
       FROM booking_services bs
       JOIN bookings b ON bs.booking_id = b.id
       JOIN rooms r ON b.room_id = r.id
       JOIN services s ON bs.service_id = s.id
       WHERE bs.status = 'Pending' AND b.status = 'Checked_in'
       ORDER BY bs.created_at ASC`,
    );
    return rows;
  },
  getServicesByBookingId: async (booking_id) => {
    const [rows] = await db.query(
      `SELECT s.name as service_name, bs.quantity, s.price, bs.total_price as total 
       FROM booking_services bs
       JOIN services s ON bs.service_id = s.id
       WHERE bs.booking_id = ?`,
      [booking_id],
    );
    return rows;
  },
};

module.exports = Folio;
