const mysql = require("mysql2/promise");
require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
