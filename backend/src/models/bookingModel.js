const db = require("../config/db");

const Booking = {
  findAvailableRooms: async (room_type_id, check_in, check_out) => {
    const [rows] = await db.query(
      `
      SELECT r.* FROM rooms r
      WHERE r.room_type_id = ? 
      AND r.status != 'Maintenance'
      AND r.id NOT IN (
        SELECT room_id FROM bookings 
        WHERE status NOT IN ('Cancelled', 'Checked_out')
        AND (check_in_date < ? AND check_out_date > ?)
      )
    `,
      [room_type_id, check_out, check_in],
    );
    return rows;
  },

  create: async (data) => {
    const {
      user_id,
      room_type_id,
      room_id,
      check_in,
      check_out,
      total_amount,
      deposit_amount,
      coupon_id,
      discount_amount,
      status,
      hold_until,
      note,
      payment_method,
      payment_status,
    } = data;

    const [result] = await db.query(
      `INSERT INTO bookings 
      (user_id, room_type_id, room_id, check_in_date, check_out_date, total_amount, deposit_amount, coupon_id, discount_amount, status, hold_until, note, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        room_type_id,
        room_id,
        check_in,
        check_out,
        total_amount,
        deposit_amount || 0,
        coupon_id || null,
        discount_amount || 0,
        status,
        hold_until,
        note || null,
        payment_method,
        payment_status || "Unpaid",
      ],
    );
    return result.insertId;
  },
  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT b.*, r.room_number, rt.base_price, rt.type_name, u.full_name, u.phone, u.email 
       FROM bookings b 
       LEFT JOIN rooms r ON b.room_id = r.id 
       JOIN room_types rt ON b.room_type_id = rt.id 
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [id],
    );
    return rows[0];
  },
  updateStatus: async (id, status) => {
    return await db.query("UPDATE bookings SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
  },
  updatePaymentStatus: async (id, payment_status) => {
    return await db.query(
      "UPDATE bookings SET payment_status = ? WHERE id = ?",
      [payment_status, id],
    );
  },
  changeRoom: async (idNewRoom, booking_id, total_amount) => {
    return await db.query(
      "UPDATE bookings SET room_id = ?, total_amount = ? WHERE id = ?",
      [idNewRoom, total_amount, booking_id],
    );
  },
  updateCheckoutDateAndAmount: async (
    id,
    new_check_out_date,
    new_total_amount,
  ) => {
    return await db.query(
      "UPDATE bookings SET check_out_date = ?, total_amount = ? WHERE id = ?",
      [new_check_out_date, new_total_amount, id],
    );
  },
  lockRoomOptimistic: async (roomId, currentVersion) => {
    const [result] = await db.query(
      `UPDATE rooms 
       SET status = 'Occupied', version = version + 1 
       WHERE id = ? AND version = ?`,
      [roomId, currentVersion],
    );
    return result.affectedRows > 0;
  },
  getByUserId: async (user_id) => {
    const [rows] = await db.query(
      `SELECT b.*, r.room_number, rt.type_name,
        (SELECT image_url FROM room_images WHERE room_type_id = b.room_type_id LIMIT 1) as image_url,
        (b.total_amount + COALESCE((SELECT SUM(total_price) FROM booking_services WHERE booking_id = b.id), 0)) AS grand_total
       FROM bookings b
       LEFT JOIN rooms r ON b.room_id = r.id
       LEFT JOIN room_types rt ON b.room_type_id = rt.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [user_id],
    );
    return rows;
  },
  countPendingBookingsByUserId: async (user_id) => {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND status = 'Pending'",
      [user_id],
    );
    return rows[0].count;
  },
  getCurrentBookingByRoom: async (room_id) => {
    const [rows] = await db.query(
      `SELECT b.*, u.full_name as user_full_name, u.phone 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       WHERE b.room_id = ? AND b.status = 'Checked_in' LIMIT 1`,
      [room_id],
    );
    return rows[0];
  },
  getAllForAdmin: async () => {
    const [rows] = await db.query(
      `SELECT b.*, rt.type_name, r.room_number, u.full_name as user_name, u.phone as user_phone
       FROM bookings b 
       JOIN room_types rt ON b.room_type_id = rt.id
       LEFT JOIN rooms r ON b.room_id = r.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`,
    );
    return rows;
  },
  createWalkIn: async (data) => {
    const {
      user_id,
      room_type_id,
      room_id,
      check_in,
      check_out,
      total_amount,
      deposit_amount,
      status,
      payment_method,
      payment_status,
      note,
    } = data;

    const [result] = await db.query(
      `INSERT INTO bookings 
      (user_id, room_type_id, room_id, check_in_date, check_out_date, total_amount, deposit_amount, status, payment_method, payment_status, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        room_type_id,
        room_id,
        check_in,
        check_out,
        total_amount,
        deposit_amount || 0,
        status || "Checked_in",
        payment_method || "PayAtDesk",
        payment_status || "Unpaid",
        note,
      ],
    );
    return result.insertId;
  },
  updateRoomId: async (booking_id, new_room_id) => {
    return await db.query("UPDATE bookings SET room_id = ? WHERE id = ?", [
      new_room_id,
      booking_id,
    ]);
  },
  upgradeRoomFree: async (bookingId, newRoomId) => {
    return await db.query(
      `UPDATE bookings 
       SET room_id = ?, 
           note = CONCAT(IFNULL(note, ''), ' [Hệ thống: Khách được Free Upgrade do sự cố]') 
       WHERE id = ?`,
      [newRoomId, bookingId],
    );
  },
  getExpiredPendingBookings: async () => {
    const [rows] = await db.query(`
      SELECT id, room_id, user_id 
      FROM bookings 
      WHERE status = 'Pending' 
      AND created_at <= NOW() - INTERVAL 15 MINUTE
    `);
    return rows;
  },
  getNoShowBookings: async () => {
    const [rows] = await db.query(`
      SELECT id, room_id, user_id 
      FROM bookings 
      WHERE status = 'Confirmed' AND hold_until <= NOW()
    `);
    return rows;
  },
  getUpcomingBookingsForReminder: async () => {
    const [rows] = await db.query(`
      SELECT b.id, b.check_in_date, b.hold_until, u.email, u.full_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'Confirmed' 
      AND DATE(b.check_in_date) = DATE(DATE_ADD(NOW(), INTERVAL 1 DAY))
    `);
    return rows;
  },
};

module.exports = Booking;
