const db = require("../config/db");

const Surcharge = {
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
    return await db.query(
      "INSERT INTO surcharge_rules (event_name, start_date, end_date, surcharge_percent, is_non_refundable) VALUES (?, ?, ?, ?, ?)",
      [event_name, start_date, end_date, surcharge_percent, is_non_refundable],
    );
  },
};

module.exports = Surcharge;
