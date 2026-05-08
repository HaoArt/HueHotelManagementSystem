const db = require("../config/db");

const Surcharge = {
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM surcharge_rules ORDER BY start_date DESC",
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM surcharge_rules WHERE id = ?",
      [id],
    );
    return rows[0];
  },

  getAppliedRules: async (check_in, check_out) => {
    const [rows] = await db.query(
      `
      SELECT * FROM surcharge_rules 
      WHERE (start_date <= ? AND end_date >= ?) -- Ngày khách ở nằm trong vùng lễ
      `,
      [check_out, check_in],
    );
    return rows;
  },

  create: async (data) => {
    const {
      event_name,
      start_date,
      end_date,
      surcharge_percent,
      is_non_refundable,
    } = data;
    const nonRefundable =
      is_non_refundable !== undefined ? is_non_refundable : 1;

    const [result] = await db.query(
      "INSERT INTO surcharge_rules (event_name, start_date, end_date, surcharge_percent, is_non_refundable) VALUES (?, ?, ?, ?, ?)",
      [event_name, start_date, end_date, surcharge_percent, nonRefundable],
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const {
      event_name,
      start_date,
      end_date,
      surcharge_percent,
      is_non_refundable,
    } = data;

    const nonRefundable =
      is_non_refundable !== undefined ? is_non_refundable : 1;

    return await db.query(
      "UPDATE surcharge_rules SET event_name=?, start_date=?, end_date=?, surcharge_percent=?, is_non_refundable=? WHERE id=?",
      [event_name, start_date, end_date, surcharge_percent, nonRefundable, id],
    );
  },

  delete: async (id) => {
    return await db.query("DELETE FROM surcharge_rules WHERE id=?", [id]);
  },
};

module.exports = Surcharge;
