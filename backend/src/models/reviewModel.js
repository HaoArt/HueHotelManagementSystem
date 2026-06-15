const db = require("../config/db");

const Review = {
  create: async (data) => {
    const { user_id, booking_id, room_type_id, rating, comment } = data;
    const [result] = await db.query(
      "INSERT INTO reviews (user_id, booking_id, room_type_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [user_id, booking_id, room_type_id, rating, comment],
    );
    return result.insertId;
  },

  findByBookingId: async (bookingId) => {
    const [rows] = await db.query(
      "SELECT * FROM reviews WHERE booking_id = ?",
      [bookingId],
    );
    return rows[0];
  },

  getByRoomTypeId: async (roomTypeId) => {
    const [rows] = await db.query(
      `SELECT r.*, u.full_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.room_type_id = ? 
       ORDER BY r.created_at DESC`,
      [roomTypeId],
    );
    return rows;
  },

  getTop: async (limit, rating) => {
    const [rows] = await db.query(
      `SELECT r.*, u.full_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.rating = ? 
       ORDER BY r.created_at DESC 
       LIMIT ?`,
      [rating, limit],
    );
    return rows;
  },
};

module.exports = Review;
