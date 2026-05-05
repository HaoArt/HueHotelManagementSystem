const db = require('../config/db');

const Audit = {
  logAction: async (user_id, action, target_id, old_value, new_value, ip_address) => {
    const [result] = await db.query(
      `INSERT INTO audit_logs (user_id, action, target_id, old_value, new_value, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user_id, 
        action, 
        target_id, 
        old_value ? JSON.stringify(old_value) : null, 
        new_value ? JSON.stringify(new_value) : null, 
        ip_address
      ]
    );
    return result.insertId;
  },
  getLogs: async () => {
    const [rows] = await db.query(`
      SELECT a.*, u.full_name, u.email 
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100 -- Chỉ lấy 100 thao tác gần nhất để tránh lag
    `);
    return rows;
  }
};

module.exports = Audit;