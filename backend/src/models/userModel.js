const db = require("../config/db");

const User = {
  findByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },
  create: async (userData) => {
    const { full_name, email, phone, password_hash } = userData;
    const [result] = await db.query(
      "INSERT INTO users (full_name,email,phone,password_hash) VALUE (?,?,?,?)",
      [full_name, email, phone, password_hash],
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
  updateProfile: async (id, full_name, phone) => {
    return await db.query(
      "UPDATE users SET full_name = ?, phone = ? WHERE id = ?",
      [full_name, phone, id],
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
};

module.exports = User;
