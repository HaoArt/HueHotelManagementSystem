const db = require("../config/db");
const Dashboard = {
  getMonthlyRevenue: async (year) => {
    const [rows] = await db.query(
      `
      SELECT MONTH(check_out_date) as month, SUM(total_amount) as total_revenue
      FROM bookings 
      WHERE YEAR(check_out_date) = ? AND status = 'Checked_out' AND payment_status = 'Paid'
      GROUP BY MONTH(check_out_date)
      ORDER BY month ASC
    `,
      [year],
    );
    return rows;
  },

  getYearlyRevenue: async () => {
    const [rows] = await db.query(
      `SELECT YEAR(check_out_date) as year, SUM(total_amount) as revenue 
       FROM bookings 
       WHERE status = 'Checked_out' AND payment_status = 'Paid'
       GROUP BY YEAR(check_out_date) 
       ORDER BY year ASC`,
    );
    return rows;
  },
  getOverviewStats: async () => {
    const [roomStats] = await db.query(
      "SELECT status, COUNT(*) as count FROM rooms GROUP BY status",
    );
    const today = new Date().toISOString().split("T")[0];
    const [bookingStats] = await db.query(
      `SELECT 
        SUM(CASE WHEN check_in_date = ? THEN 1 ELSE 0 END) as arrivals_today,
        SUM(CASE WHEN check_out_date = ? THEN 1 ELSE 0 END) as departures_today,
        COUNT(*) as total_active_bookings
       FROM bookings WHERE status NOT IN ('Cancelled', 'Checked_out')`,
      [today, today],
    );

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();


    const [roomRev] = await db.query(
      "SELECT SUM(total_amount) as monthly_revenue FROM bookings WHERE status = 'Checked_out' AND MONTH(check_out_date) = ? AND YEAR(check_out_date) = ?",
      [currentMonth, currentYear],
    );

    const [serviceRev] = await db.query(
      `SELECT SUM(bs.total_price) as service_revenue 
       FROM booking_services bs
       JOIN bookings b ON bs.booking_id = b.id
       WHERE b.status = 'Checked_out' 
       AND bs.status != 'Cancelled'
       AND MONTH(b.check_out_date) = ? 
       AND YEAR(b.check_out_date) = ?`,
      [currentMonth, currentYear],
    );


    const roomRevenue = parseFloat(roomRev[0]?.monthly_revenue || 0);
    const serviceRevenue = parseFloat(serviceRev[0]?.service_revenue || 0);

    return {
      rooms: roomStats,
      bookings: bookingStats[0],
      room_revenue: roomRevenue, 
      service_revenue: serviceRevenue, 
      revenue: roomRevenue + serviceRevenue,
    };
  },
};
module.exports = Dashboard;
