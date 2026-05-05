const db = require("../config/db");

const Contact = {
  create: async (data) => {
    const { name, email, subject, message } = data;
    const [result] = await db.query(
      "INSERT INTO contacts (name, email, subject, message, status) VALUES (?, ?, ?, ?, 'New')",
      [name, email, subject, message],
    );
    return result.insertId;
  },
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM contacts ORDER BY created_at DESC",
    );
    return rows;
  },
  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM contacts WHERE id = ?", [id]);
    return rows[0];
  },
  updateStatus: async (id, status) => {
    const [result] = await db.query(
      "UPDATE contacts SET status = ? WHERE id = ?",
      [status, id],
    );
    return result.affectedRows;
  },
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM contacts WHERE id = ?", [id]);
    return result.affectedRows;
  },
};

module.exports = Contact;
