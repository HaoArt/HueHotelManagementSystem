const mysql = require("mysql2/promise");
require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// Kiểm tra môi trường
const isLocal =
  process.env.DB_HOST === "localhost" || process.env.DB_HOST === "127.0.0.1";
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  port: process.env.DB_PORT || 3306,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
});

module.exports = pool;
