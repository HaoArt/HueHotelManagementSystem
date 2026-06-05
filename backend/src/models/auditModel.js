const db = require("../config/db");

const Audit = {
  logAction: async (
    user_id,
    action,
    target_id,
    old_value,
    new_value,
    ip_address,
  ) => {
    const [result] = await db.query(
      `INSERT INTO audit_logs (user_id, action, target_id, old_value, new_value, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        action,
        target_id,
        old_value ? JSON.stringify(old_value) : null,
        new_value ? JSON.stringify(new_value) : null,
        ip_address,
      ],
    );
    return result.insertId;
  },
  getLogs: async (limit, offset, search) => {
    let query = `
      SELECT a.*, u.full_name, u.email 
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(a.id) as total 
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    let params = [];
    if (search) {
      query += ` AND (u.full_name LIKE ? OR a.action LIKE ? OR a.ip_address LIKE ?)`;
      countQuery += ` AND (u.full_name LIKE ? OR a.action LIKE ? OR a.ip_address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;

    const countParams = [...params];
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    const [countRows] = await db.query(countQuery, countParams);

    return {
      data: rows,
      totalRecords: countRows[0].total,
    };
  },
};

module.exports = Audit;
