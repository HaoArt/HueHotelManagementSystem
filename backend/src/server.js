const express = require("express");
const cors = require("cors");
const db = require("./config/db");
import dns from "dns";
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

dns.setDefaultResultOrder("ipv4first");

const app = express();
app.use(cors());
app.use(express.json());
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
    message:
      "Lỗi xử lý luồng dữ liệu (Kiểm tra lại định dạng file hoặc API Key Cloudinary)",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`👉 Bấm vào đây để test API: http://localhost:${PORT}/api`);
});
