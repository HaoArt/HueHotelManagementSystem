/* eslint-disable react-hooks/static-components */
import { useState, useEffect } from "react";
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
} from "@mui/material";

// Thư viện Recharts cho Biểu đồ
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import GroupsIcon from "@mui/icons-material/Groups";

import DashboardService from "../../services/dashboardService";

// Đồng bộ bảng màu Admin
const COLORS = {
  primary: "#5e35b1",
  teal: "#009688",
  orange: "#ed6c02",
  error: "#d32f2f",
  border: "#e0e0e0",
  bgLight: "#f4f6f8",
  textMain: "#1a1a1a",
  status: {
    Available: "#009688", // Xanh ngọc
    Occupied: "#5e35b1", // Tím
    Dirty: "#ed6c02", // Cam
    Maintenance: "#d32f2f", // Đỏ
  },
};

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartView, setChartView] = useState("monthly");

  const currentDate = new Date().toLocaleDateString("vi-VN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await DashboardService.getStats();
        setStats(res.data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
      value: `${(stats?.revenue || 0).toLocaleString("vi-VN")}đ`,
      icon: <RequestQuoteIcon />,
      iconBg: "rgba(94, 53, 177, 0.1)",
      iconColor: COLORS.primary,
      trendText: "Thực tế thu được",
    },
  ];

  const getStatusLabel = (status) => {
    switch (status) {
      case "Available":
        return "Sẵn sàng (Available)";
      case "Occupied":
        return "Có khách (Occupied)";
      case "Dirty":
        return "Chưa dọn (Dirty)";
      case "Maintenance":
        return "Bảo trì (Maintenance)";
      default:
        return status;
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            p: 4,
            bgcolor: COLORS.bgLight,
            minHeight: "100vh",
            overflowX: "hidden",
            pb: 10,
          }}
        >
          <Typography
            variant="body2"
            fontWeight="bold"
            color="text.secondary"
            mb={0.5}
          >
            {payload[0].payload.fullLabel}
          </Typography>
          <Typography variant="body1" fontWeight="bold" color={COLORS.primary}>
            {`${payload[0].value.toLocaleString("vi-VN")} đ`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const currentChartData =
    chartView === "monthly" ? stats?.chartDataMonthly : stats?.chartDataYearly;

  return (
    <Box sx={{ p: 4, bgcolor: COLORS.bgLight, minHeight: "100vh" }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{ color: COLORS.textMain, letterSpacing: "-1px" }}
          >
            Bảng Điều Khiển
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            Tình hình hoạt động tổng quan tại Huế Hotel trong hôm nay.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            sx={{
              bgcolor: "white",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "4px",
            }}
          >
            <NotificationsNoneIcon sx={{ color: COLORS.textMain }} />
          </IconButton>
          <Chip
            icon={<CalendarTodayIcon fontSize="small" />}
            label={currentDate}
            sx={{
              bgcolor: "white",
              border: `1px solid ${COLORS.border}`,
              fontWeight: "bold",
              borderRadius: "4px",
              px: 1,
            }}
          />
        </Box>
      </Box>

      {/* ROW 1: SUMMARY CARDS BẰNG FLEXBOX */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Box
            key={index}
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 24px)",
                md: "1 1 calc(25% - 24px)",
              },
              minWidth: 0,
            }}
          >
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "4px",
                border: `1px solid ${COLORS.border}`,
                display: "flex",
                flexDirection: "column",
                bgcolor: "white",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    color="text.secondary"
                    gutterBottom
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="900"
                    sx={{ color: COLORS.textMain }}
                  >
                    {card.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: card.iconBg,
                    color: card.iconColor,
                    p: 1,
                    borderRadius: "4px",
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
                  gap: 0.5,
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

      {/* ROW 2: CHART (TRÁI) & STATUS + GOALS (PHẢI) BẰNG FLEXBOX */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
        {/* CỘT TRÁI: BIỂU ĐỒ DOANH THU (Tỷ lệ 2/3) */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: 2 },
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "4px",
              border: `1px solid ${COLORS.border}`,
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
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color={COLORS.textMain}
                >
                  Biểu đồ Doanh thu
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thống kê doanh thu từ các giao dịch hoàn tất.
                </Typography>
              </Box>
              <ToggleButtonGroup
                value={chartView}
                exclusive
                onChange={(e, newVal) => newVal && setChartView(newVal)}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    fontWeight: "bold",
                    borderRadius: "4px",
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
            </Box>

            <Box
              sx={{ flexGrow: 1, minHeight: 350, width: "100%", minWidth: 0 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={currentChartData || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                    tick={{ fill: "#888", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888", fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <CartesianGrid
                    vertical={false}
                    stroke="#f0f0f0"
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
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* CỘT PHẢI: PHÂN BỔ PHÒNG & MỤC TIÊU CA LÀM VIỆC (Tỷ lệ 1/3) */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: 1 },
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* WIDGET 1: TRẠNG THÁI PHÒNG */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "4px",
              border: `1px solid ${COLORS.border}`,
              flex: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                width: "100%",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color={COLORS.textMain}
              >
                Phân bổ trạng thái
              </Typography>
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{
                  color: COLORS.teal,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Xem sơ đồ &rarr;
              </Typography>
            </Box>

            <Stack spacing={2.5} sx={{ width: "100%" }}>
              {stats?.rooms?.map((room, idx) => {
                const percentage =
                  totalRooms === 0 ? 0 : (room.count / totalRooms) * 100;
                const dotColor = COLORS.status[room.status] || "#9e9e9e";
                return (
                  <Box key={idx} sx={{ width: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: dotColor,
                          }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          color={COLORS.textMain}
                        >
                          {getStatusLabel(room.status)}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="text.secondary"
                      >
                        {room.count}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        height: 6,
                        bgcolor: "#f0f0f0",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          height: "100%",
                          bgcolor: dotColor,
                          borderRadius: "4px",
                          transition: "width 1s ease",
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>

          {/* WIDGET 2: MỤC TIÊU CA LÀM VIỆC */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "4px",
              border: `1px solid ${COLORS.border}`,
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
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color={COLORS.textMain}
              >
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
                    borderRadius: "4px",
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
                    Ưu tiên dọn dẹp các phòng trạng thái Dirty để đón khách sớm.
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
                    Kiểm tra thông tin và làm thẻ từ cho{" "}
                    {stats?.bookings?.arrivals_today || 0} lượt khách dự kiến
                    đến.
                  </Typography>
                </Box>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderRadius: "4px",
                textTransform: "none",
                fontWeight: "bold",
                color: COLORS.textMain,
                borderColor: COLORS.border,
              }}
            >
              Xem báo cáo chi tiết
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardOverview;
