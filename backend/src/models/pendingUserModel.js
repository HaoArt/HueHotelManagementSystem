const db = require("../config/db");
const { create } = require("./userModel");

const PendingUser = {
  findByEmail: async (email) => {
    const [row] = await db.query(
      "SELECT * FROM pending_users WHERE email =? ",
      [email],
    );
    return row[0];
  },
  create: async (userData) => {
    const {
      full_name,
      email,
      phone,
      password_hash,
      otp_code,
      otp_expiry,
      identity_number,
    } = userData;
    const [result] = await db.query(
      "INSERT INTO pending_users (full_name,email,phone,password_hash,otp_code,otp_expiry, identity_number) VALUE (?,?,?,?,?,?,?)",
      [
        full_name || null,
        email,
        phone || null,
        password_hash || null,
        otp_code,
        otp_expiry,
        identity_number,
      ],
    );
    return result.insertId;
  },
  delete: async (email) => {
    return await db.query("DELETE FROM pending_users WHERE email=?", [email]);
  },
};

module.exports = PendingUser;
