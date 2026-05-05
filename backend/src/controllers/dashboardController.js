const Dashboard = require("../models/dashboardModel");

exports.getDashboardData = async (req, res) => { 
  try {
    const year = req.query.year || new Date().getFullYear();
    const monthlyRevenue = await Dashboard.getMonthlyRevenue(year);
    const overviewStats = await Dashboard.getOverviewStats();
    const formattedRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
    }));
    monthlyRevenue.forEach((item) => {
      formattedRevenue[item.month - 1].revenue = parseFloat(item.total_revenue);
    });
    return res.status(200).json({
      status: "OK",
      data: {
        year: year,
        overview: overviewStats,
        revenue_chart: formattedRevenue,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};
exports.getStats = async (req, res) => {
  try {
    const stats = await Dashboard.getOverviewStats();
    res.status(200).json({ status: "OK", data: stats });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Lỗi tải thống kê Dashboard" });
  }
};
