const db = require("../config/db");

const Coupon = {
  findByCode: async (code) => {
    const [rows] = await db.query(
      'SELECT * FROM Coupons WHERE code = ? AND status = "Active"',
      [code],
    );
    return rows[0];
  },

  incrementUsage: async (id) => {
    return await db.query(
      "UPDATE Coupons SET used_count = used_count + 1 WHERE id = ?",
      [id],
    );
  },
  findActive: async () => {
    const [rows] = await db.query(
      `
      SELECT * 
      FROM coupons 
      WHERE status = 'Active' 
      AND (expiry_date IS NULL OR expiry_date >= NOW())
      AND used_count < usage_limit
    `,
    );
    return rows;
  },
  findAll: async () => {
    const [rows] = await db.query("SELECT * FROM coupons");
    return rows;
  },
};

module.exports = Coupon;
