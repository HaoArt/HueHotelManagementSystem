const db = require("../config/db");

const User = {
  findByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },
  create: async (userData) => {
    const { full_name, email, phone, password_hash, identity_number } =
      userData;
    const [result] = await db.query(
      "INSERT INTO users (full_name,email,phone,password_hash,identity_number) VALUE (?,?,?,?,?)",
      [full_name, email, phone, password_hash, identity_number],
    );
    return result.insertId;
  },
  updatePassword: async (email, password_hash) => {
    return await db.query("UPDATE users SET password_hash=? WHERE email=?", [
      password_hash,
      email,
    ]);
  },
  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },
  findByPhone: async (phone) => {
    const [rows] = await db.query("SELECT * FROM users WHERE phone = ?", [
      phone,
    ]);
    return rows[0];
  },
  createGuestUser: async (full_name, phone, email) => {
    const [result] = await db.query(
      "INSERT INTO users (full_name, phone, email, password_hash, role) VALUES (?, ?, ?, 'walkin_dummy_pass', 'Customer')",
      [full_name, phone, email],
    );
    return result.insertId;
  },

  updateTrustScore: async (userId, pointsToAdd) => {
    const [rows] = await db.query(
      "SELECT trust_score FROM users WHERE id = ?",
      [userId],
    );
    if (rows.length === 0) return;
    let currentScore = rows[0].trust_score;
    let newScore = currentScore + pointsToAdd;
    if (newScore > 100) newScore = 100;
    if (newScore < 0) newScore = 0;
    await db.query("UPDATE users SET trust_score = ? WHERE id = ?", [
      newScore,
      userId,
    ]);
    return newScore;
  },
  updateProfile: async (id, full_name, phone, avatar_url, identity_number) => {
    return await db.query(
      "UPDATE users SET full_name = ?, phone = ?, avatar_url = ?, identity_number = ? WHERE id = ?",
      [full_name, phone, avatar_url, identity_number, id],
    );
  },
  getAllCustomers: async () => {
    const [rows] = await db.query(
      "SELECT id, full_name, email, phone, trust_score, status, created_at FROM users WHERE role = 'Customer' ORDER BY created_at DESC",
    );
    return rows;
  },
  updateStatus: async (id, status) => {
    return await db.query("UPDATE users SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
  },
  getRankBySpending: async (spentAmount) => {
    const [rows] = await db.query(
      "SELECT * FROM user_ranks WHERE min_spend <= ? ORDER BY min_spend DESC LIMIT 1",
      [spentAmount],
    );
    return rows[0];
  },
  updateSpending: async (userId, amount) => {
    return await db.query(
      "UPDATE users SET total_spent = total_spent + ? WHERE id = ?",
      [amount, userId],
    );
  },
  getAllAccounts: async () => {
    const [rows] = await db.query(
      "SELECT id, full_name, email, phone, role, trust_score, status, created_at FROM users ORDER BY CASE role WHEN 'Admin' THEN 1 WHEN 'Receptionist' THEN 2 ELSE 3 END, created_at DESC",
    );
    return rows;
  },
  createInternalAccount: async (userData) => {
    const { full_name, email, phone, password_hash, role } = userData;
    const [result] = await db.query(
      "INSERT INTO users (full_name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, ?, 'Active')",
      [full_name, email, phone, password_hash, role],
    );
    return result.insertId;
  },
  findByIdentity: async (identity_number) => {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE identity_number = ?",
      [identity_number],
    );
    return rows[0];
  },
  cleanupExpiredOTPs: async () => {
    const [result] = await db.query(
      "DELETE FROM pending_users WHERE otp_expiry < NOW()",
    );
    return result.affectedRows;
  },
  getPaginatedAccounts: async (limit, offset, search, role) => {
    let query = `
      SELECT id, full_name, email, phone, role, trust_score, status, created_at 
      FROM users 
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(id) as total 
      FROM users 
      WHERE 1=1
    `;
    let params = [];
    if (role && role !== "All") {
      query += ` AND role = ?`;
      countQuery += ` AND role = ?`;
      params.push(role);
    }
    if (search) {
      query += ` AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      countQuery += ` AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ` ORDER BY CASE role WHEN 'Admin' THEN 1 WHEN 'Receptionist' THEN 2 ELSE 3 END, created_at DESC LIMIT ? OFFSET ?`;

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

module.exports = User;
