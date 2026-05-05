const db = require("../config/db");

const Service = {
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM services ORDER BY created_at DESC",
    );
    return rows;
  },
  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM services WHERE id = ?", [id]);
    return rows[0];
  },
  getPriceById: async (id) => {
    const [rows] = await db.query("SELECT price FROM services WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },
  create: async (data) => {
    const { name, price, description } = data;
    const [result] = await db.query(
      "INSERT INTO services (name, price, description) VALUES (?, ?, ?)",
      [name, price, description],
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const { name, price, description } = data;
    return await db.query(
      "UPDATE services SET name = ?, price = ?, description = ? WHERE id = ?",
      [name, price, description, id],
    );
  },
  delete: async (id) => {
    return await db.query("DELETE FROM services WHERE id = ?", [id]);
  },
};

module.exports = Service;
