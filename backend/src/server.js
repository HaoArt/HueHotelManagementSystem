const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("./cron/holdRoomCron");
require("./cron/reminderCron");
require("./cron/cleanupOtpCron");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const roomTypeRoutes = require("./routes/roomTypeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const folioRoutes = require("./routes/folioRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const contactRoutes = require("./routes/contactRoutes");
const UserRoutes = require("./routes/userRoutes");
const couponRoutes = require("./routes/couponRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const auditRoutes = require("./routes/auditRoutes");
const surchargeRoutes = require("./routes/surchargeRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const configRoutes = require("./routes/configRoutes");

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hue-hotel-management-system.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

// Route Health Check để kiểm tra server có hoạt động không (Rất hữu ích khi test deploy)
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Hue Hotel API! Server is running fine." });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/room-types", roomTypeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/folios", folioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/surcharges", surchargeRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/configs", configRoutes);

app.use((err, req, res, next) => {
  console.error("Lỗi Middleware/Hệ thống:", err.message || err);
  res.status(500).json({
    status: "error",
    message: err.message || "Lỗi máy chủ nội bộ. Vui lòng thử lại sau!",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`👉 Bấm vào đây để test API: http://localhost:${PORT}/api`);
});

// Export app để hỗ trợ deploy dạng Serverless Functions (Ví dụ: deploy backend lên Vercel)
module.exports = app;
