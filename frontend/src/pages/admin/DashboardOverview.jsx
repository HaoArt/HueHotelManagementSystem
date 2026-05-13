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
  navy: "#0b1b3f",
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

const glassCardSx = {
  p: { xs: 2.25, sm: 2.75, md: 3 },
  borderRadius: 1,
  border: "1px solid rgba(255,255,255,0.4)",
  bgcolor: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 12px 30px rgba(11, 27, 63, 0.1)",
  transition: "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
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

  // ĐÃ FIX: Sửa lại giao diện Tooltip nhỏ gọn khi hover vào biểu đồ
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

  const currentChartData =
    chartView === "monthly" ? stats?.chartDataMonthly : stats?.chartDataYearly;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 14% 8%, rgba(0,150,136,0.07), transparent 34%), radial-gradient(circle at 88% 92%, rgba(11,27,63,0.06), transparent 32%), linear-gradient(180deg, #f6f9fe 0%, #eef3fa 52%, #f8fbff 100%)",
      }}
    >
      {/* HEADER */}
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
          <IconButton
            sx={{
              bgcolor: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(11,27,63,0.12)",
              borderRadius: "4px",
              boxShadow: "0 6px 16px rgba(11, 27, 63, 0.08)",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.96)",
                transform: "translateY(-1px)",
              },
            }}
          >
            <NotificationsNoneIcon sx={{ color: COLORS.navy }} />
          </IconButton>
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

      {/* ROW 1: SUMMARY CARDS */}
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
          alignItems: "stretch",
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
                    sx={{ letterSpacing: "0.01em" }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="900"
                    sx={{
                      color: COLORS.navy,
                      fontSize: { xs: "1.4rem", md: "1.55rem" },
                      lineHeight: 1.2,
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
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
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
                  sx={{ color: COLORS.teal, letterSpacing: "0.01em" }}
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
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(0, 1fr)" },
          gap: { xs: 1.75, sm: 2.25, md: 2.5 },
          alignItems: "stretch",
        }}
      >
        {/* CỘT TRÁI: BIỂU ĐỒ DOANH THU */}
        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
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
              <ToggleButtonGroup
                value={chartView}
                exclusive
                onChange={(e, newVal) => newVal && setChartView(newVal)}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 1.6,
                    borderColor: "rgba(11,27,63,0.14)",
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
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* CỘT PHẢI: PHÂN BỔ PHÒNG & MỤC TIÊU CA LÀM VIỆC */}
        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.75, sm: 2.25, md: 2.5 },
            height: "100%",
          }}
        >
          {/* WIDGET 1: TRẠNG THÁI PHÒNG */}
          <Paper
            elevation={0}
            sx={{
              ...glassCardSx,
              flex: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2.5,
                width: "100%",
              }}
            >
              <Typography variant="subtitle1" sx={sectionTitleSx}>
                Phân bổ trạng thái
              </Typography>
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{
                  color: COLORS.teal,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "transform 0.2s ease, color 0.2s ease",
                  "&:hover": {
                    color: "#00796d",
                    transform: "translateX(2px)",
                  },
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
                        mb: 0.7,
                        width: "100%",
                        gap: 1,
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
                        bgcolor: "rgba(11, 27, 63, 0.08)",
                        borderRadius: 5,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          height: "100%",
                          bgcolor: dotColor,
                          borderRadius: 5,
                          transition: "width 1s ease",
                          boxShadow: `0 3px 10px ${dotColor}55`,
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
                borderRadius: 1,
                textTransform: "none",
                fontWeight: 700,
                color: COLORS.navy,
                borderColor: "rgba(11,27,63,0.16)",
                backgroundColor: "rgba(255,255,255,0.58)",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: COLORS.teal,
                  backgroundColor: "rgba(0, 150, 136, 0.08)",
                  transform: "translateY(-1px)",
                },
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
