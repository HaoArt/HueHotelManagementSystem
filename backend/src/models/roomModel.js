const db = require("../config/db");
const { findById } = require("./userModel");

const Room = {
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM rooms ORDER BY room_number ASC",
    );
    return rows;
  },
  getAllWithType: async () => {
    const [rows] = await db.query(
      `SELECT rooms.*, room_types.type_name, room_types.base_price 
      FROM rooms 
      JOIN room_types ON rooms.room_type_id = room_types.id 
      ORDER BY rooms.room_number ASC`,
    );
    return rows;
  },
  updateStatus: async (roomId, status) => {
    return await db.query("UPDATE rooms SET status = ? WHERE id = ?", [
      status,
      roomId,
    ]);
  },
  findByNumber: async (room_number) => {
    const [rows] = await db.query("SELECT * FROM rooms WHERE room_number = ?", [
      room_number,
    ]);
    return rows[0];
  },
  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM rooms WHERE id = ?", [id]);
    return rows[0];
  },
  create: async (data) => {
    const { room_number, room_type_id, status } = data;
    const [result] = await db.query(
      "INSERT INTO rooms (room_number, room_type_id, status) VALUES (?, ?, ? )",
      [room_number, room_type_id, status || "Available"],
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const { room_number, room_type_id } = data;
    return await db.query(
      "UPDATE rooms SET room_number = ?, room_type_id = ? WHERE id = ?",
      [room_number, room_type_id, id],
    );
  },
  delete: async (id) => {
    return await db.query("DELETE FROM rooms WHERE id = ?", [id]);
  },
};

module.exports = Room;
