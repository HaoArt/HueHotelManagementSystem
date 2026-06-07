/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Card,
  Button,
  IconButton,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Badge,
  Tooltip as MuiTooltip,
} from "@mui/material";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import ApartmentIcon from "@mui/icons-material/Apartment";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MailIcon from "@mui/icons-material/Mail";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import GroupsIcon from "@mui/icons-material/Groups";

import DashboardService from "../../services/dashboardService";
import FolioService from "../../services/folioService";
import ContactService from "../../services/contactService";

const COLORS = {
  primary: "#5e35b1",
  teal: "#009688",
  navy: "#0b1b3f",
  orange: "#ed6c02",
  error: "#d32f2f",
  border: "#e0e0e0",
  bgLight: "#f4f6f8",
  textMain: "#1a1a1a",
  status: {
    Available: "#009688",
    Occupied: "#5e35b1",
    Dirty: "#ed6c02",
    Maintenance: "#d32f2f",
  },
};

const glassCardSx = {
  p: { xs: 2.25, sm: 2.75, md: 3 },
  borderRadius: 1,
  border: "1px solid rgba(255,255,255,0.4)",
  bgcolor: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 12px 30px rgba(11, 27, 63, 0.1)",
  transition:
    "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 18px 36px rgba(11, 27, 63, 0.15)",
    borderColor: "rgba(0, 150, 136, 0.35)",
  },
};

const sectionTitleSx = {
  fontWeight: 700,
  color: COLORS.textMain,
  letterSpacing: "-0.02em",
};

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [newContactsCount, setNewContactsCount] = useState(0);

  // State điều khiển dữ liệu biểu đồ
  const [chartView, setChartView] = useState("monthly"); // "monthly" hoặc "yearly"
  const [chartType, setChartType] = useState("area"); // "area" hoặc "bar"

  const currentDate = new Date().toLocaleDateString("vi-VN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ✨ GỌI ĐÚNG HÀM GỐC getStats() CỦA EM
        const res = await DashboardService.getStats();
        setStats(res.data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    const fetchPendingOrders = async () => {
      try {
        const res = await FolioService.getPendingOrders();
        setPendingOrdersCount(res.data?.length || 0);
      } catch (err) {
        console.error("Lỗi lấy thông báo dịch vụ:", err);
      }
    };

    const fetchNewContacts = async () => {
      try {
        const res = await ContactService.getAllContacts();
        const newCount =
          res.data?.filter((c) => c.status === "New").length || 0;
        setNewContactsCount(newCount);
      } catch (err) {
        console.error("Lỗi lấy thông báo liên hệ:", err);
      }
    };

    fetchStats();
    fetchPendingOrders();
    fetchNewContacts();
    const intervalId = setInterval(() => {
      fetchPendingOrders();
      fetchNewContacts();
    }, 30000); // Tự động làm mới thông báo mỗi 30 giây
    return () => clearInterval(intervalId);
  }, []);

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress sx={{ color: COLORS.teal }} />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ m: 4, borderRadius: "4px" }}>
        {error}
      </Alert>
    );

  const totalRooms =
    stats?.rooms?.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const dirtyRooms =
    stats?.rooms?.find((r) => r.status === "Dirty")?.count || 0;

  const summaryCards = [
    {
      title: "Tổng số phòng",
      value: totalRooms,
      icon: <ApartmentIcon />,
      iconBg: "rgba(94, 53, 177, 0.1)",
      iconColor: COLORS.primary,
      trendText: "Toàn hệ thống",
    },
    {
      title: "Khách đến hôm nay",
      value: stats?.bookings?.arrivals_today || 0,
      icon: <FlightLandIcon />,
      iconBg: "rgba(0, 150, 136, 0.1)",
      iconColor: COLORS.teal,
      trendText: "Lịch Check-in",
    },
    {
      title: "Khách đi hôm nay",
      value: stats?.bookings?.departures_today || 0,
      icon: <FlightTakeoffIcon />,
      iconBg: "rgba(237, 108, 2, 0.1)",
      iconColor: COLORS.orange,
      trendText: "Lịch Check-out",
    },
    {
      title: "Doanh thu tháng này",
      value: `${parseFloat(stats?.revenue || 0).toLocaleString("vi-VN")}đ`,
      icon: <RequestQuoteIcon />,
      iconBg: "rgba(94, 53, 177, 0.1)",
      iconColor: COLORS.primary,
      trendText: "Thực tế thu được",
    },
  ];

  // Lấy dữ liệu biểu đồ dựa trên state chartView
  const currentChartData =
    chartView === "monthly" ? stats?.chartDataMonthly : stats?.chartDataYearly;

  // ✨ Lấy dữ liệu tỷ trọng doanh thu THỰC TẾ từ Backend
  const pieChartData = [
    { name: "Tiền thuê phòng", value: parseFloat(stats?.room_revenue || 0) },
    {
      name: "Dịch vụ phát sinh",
      value: parseFloat(stats?.service_revenue || 0),
    },
  ];
  const PIE_COLORS = [ COLORS.teal,COLORS.primary];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "8px",
            bgcolor: "white",
            minWidth: "120px",
          }}
        >
          <Typography
            variant="caption"
            fontWeight="bold"
            display="block"
            color="text.secondary"
            sx={{ mb: 0.5, textTransform: "uppercase" }}
          >
            {payload[0].payload.fullLabel || payload[0].payload.name}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="body2" fontWeight="900" color={COLORS.primary}>
            {`${payload[0].value.toLocaleString("vi-VN")} đ`}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 14% 8%, rgba(0,150,136,0.07), transparent 34%), radial-gradient(circle at 88% 92%, rgba(11,27,63,0.06), transparent 32%), linear-gradient(180deg, #f6f9fe 0%, #eef3fa 52%, #f8fbff 100%)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "flex-start" },
          mb: { xs: 2.5, sm: 3, md: 4 },
          flexWrap: "wrap",
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Box sx={{ maxWidth: { xs: "100%", md: "70%" } }}>
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{
              color: COLORS.navy,
              letterSpacing: "-0.03em",
              fontSize: { xs: "1.65rem", sm: "2rem", md: "2.2rem" },
            }}
          >
            Bảng Điều Khiển
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.75 }}>
            Tình hình hoạt động tổng quan tại Huế Hotel trong hôm nay.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "space-between", sm: "flex-start" },
            width: { xs: "100%", sm: "auto" },
            gap: 1.25,
          }}
        >
          <MuiTooltip title="Quản lý thư liên hệ" arrow>
            <IconButton
              sx={{
                bgcolor: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(11,27,63,0.12)",
                borderRadius: "4px",
                boxShadow: "0 6px 16px rgba(11, 27, 63, 0.08)",
              }}
              onClick={() => navigate("/dashboard/contacts")}
            >
              <Badge badgeContent={newContactsCount} color="error">
                <MailIcon sx={{ color: COLORS.navy }} />
              </Badge>
            </IconButton>
          </MuiTooltip>

          <MuiTooltip title="Quản lý đơn dịch vụ" arrow>
            <IconButton
              sx={{
                bgcolor: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(11,27,63,0.12)",
                borderRadius: "4px",
                boxShadow: "0 6px 16px rgba(11, 27, 63, 0.08)",
              }}
              onClick={() => navigate("/dashboard/rooms")}
            >
              <Badge badgeContent={pendingOrdersCount} color="error">
                <NotificationsNoneIcon sx={{ color: COLORS.navy }} />
              </Badge>
            </IconButton>
          </MuiTooltip>
          <Chip
            icon={<CalendarTodayIcon fontSize="small" />}
            label={currentDate}
            sx={{
              bgcolor: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(11,27,63,0.12)",
              fontWeight: 700,
              borderRadius: "4px",
              px: 0.75,
              py: 0.5,
              boxShadow: "0 6px 16px rgba(11, 27, 63, 0.08)",
            }}
          />
        </Box>
      </Box>

      {/* Cards thống kê */}
      <Box
        sx={{
          display: "grid",
          gap: { xs: 1.75, sm: 2.25, md: 2.5 },
          mb: { xs: 2.5, sm: 3, md: 4 },
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        {summaryCards.map((card, index) => (
          <Box key={index} sx={{ minWidth: 0, display: "flex" }}>
            <Card
              elevation={0}
              sx={{
                ...glassCardSx,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 1.25,
                  mb: 2.25,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    gutterBottom
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="900"
                    sx={{
                      color: COLORS.navy,
                      fontSize: { xs: "1.4rem", md: "1.55rem" },
                      wordBreak: "break-word",
                    }}
                  >
                    {card.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: card.iconBg,
                    color: card.iconColor,
                    p: 1.1,
                    borderRadius: 2,
                    display: "flex",
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  mt: "auto",
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 16, color: COLORS.teal }} />
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ color: COLORS.teal }}
                >
                  {card.trendText}
                </Typography>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      {/* ✨ KHU VỰC FLEXBOX: BIỂU ĐỒ (7) VÀ TRẠNG THÁI (3) NẰM NGANG */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: { xs: 2, md: 3 },
          alignItems: "stretch",
        }}
      >
        {/* CỘT TRÁI (CHIẾM 7 PHẦN): XU HƯỚNG DOANH THU */}
        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            flex: { xs: "1 1 auto", lg: "7" },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              ...glassCardSx,
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2.5,
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="h6" sx={sectionTitleSx}>
                  Biểu đồ Doanh thu
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thống kê doanh thu từ các giao dịch hoàn tất.
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Nút lọc Tháng/Năm */}
                <ToggleButtonGroup
                  value={chartView}
                  exclusive
                  onChange={(e, newVal) => newVal && setChartView(newVal)}
                  size="small"
                  sx={{
                    "& .MuiToggleButton-root": {
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 1,
                      color: COLORS.navy,
                    },
                    "& .Mui-selected": {
                      bgcolor: `${COLORS.teal} !important`,
                      color: "white !important",
                    },
                  }}
                >
                  <ToggleButton value="monthly">Tháng này</ToggleButton>
                  <ToggleButton value="yearly">Năm nay</ToggleButton>
                </ToggleButtonGroup>

                {/* ✨ Nút chuyển Vùng/Cột */}
                <ToggleButtonGroup
                  value={chartType}
                  exclusive
                  onChange={(e, val) => val && setChartType(val)}
                  size="small"
                  sx={{
                    "& .MuiToggleButton-root": {
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 1,
                      color: COLORS.navy,
                    },
                    "& .Mui-selected": {
                      bgcolor: `${COLORS.primary} !important`,
                      color: "white !important",
                    },
                  }}
                >
                  <ToggleButton value="area">Dạng Vùng</ToggleButton>
                  <ToggleButton value="bar">Dạng Cột</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                minHeight: { xs: 280, sm: 320, md: 360 },
                width: "100%",
                minWidth: 0,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart
                    data={currentChartData || []}
                    margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.primary}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.primary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#667085", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#667085", fontSize: 12 }}
                      tickFormatter={(value) => `${value / 1000000}M`}
                    />
                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(11, 27, 63, 0.08)"
                      strokeDasharray="3 3"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={currentChartData || []}
                    margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#667085", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#667085", fontSize: 12 }}
                      tickFormatter={(value) => `${value / 1000000}M`}
                    />
                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(11, 27, 63, 0.08)"
                      strokeDasharray="3 3"
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(94, 53, 177, 0.05)" }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill={COLORS.primary}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* CỘT PHẢI (CHIẾM 3 PHẦN): BIỂU ĐỒ TRÒN & NHIỆM VỤ */}
        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, md: 3 },
            flex: { xs: "1 1 auto", lg: "3" },
          }}
        >
          {/* ✨ BIỂU ĐỒ TRÒN TỶ TRỌNG */}
          <Paper
            elevation={0}
            sx={{
              ...glassCardSx,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ ...sectionTitleSx, alignSelf: "flex-start" }}
            >
              Cơ Cấu Doanh Thu
            </Typography>
            <Divider sx={{ width: "100%", my: 1.5 }} />
            <Box sx={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString("vi-VN")} đ`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* MỤC TIÊU CA LÀM VIỆC */}
          <Paper
            elevation={0}
            sx={{
              ...glassCardSx,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
                width: "100%",
              }}
            >
              <TrackChangesIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={sectionTitleSx}>
                Mục tiêu ca làm việc
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2} sx={{ mb: 2, flexGrow: 1, width: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    bgcolor: "rgba(237, 108, 2, 0.1)",
                    p: 1,
                    borderRadius: 2,
                    color: COLORS.orange,
                  }}
                >
                  <CleaningServicesIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography
                    fontWeight="bold"
                    variant="body2"
                    color={COLORS.textMain}
                  >
                    Dọn dẹp buồng phòng
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Có {dirtyRooms} phòng đang bẩn, cần dọn dẹp để đón khách
                    sớm.
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    bgcolor: "rgba(0, 150, 136, 0.1)",
                    p: 1,
                    borderRadius: "4px",
                    color: COLORS.teal,
                  }}
                >
                  <GroupsIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography
                    fontWeight="bold"
                    variant="body2"
                    color={COLORS.textMain}
                  >
                    Chuẩn bị Check-in
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Làm thẻ từ cho {stats?.bookings?.arrivals_today || 0} lượt
                    khách đến.
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardOverview;
