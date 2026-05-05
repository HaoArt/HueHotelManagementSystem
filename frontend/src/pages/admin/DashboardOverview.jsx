import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Chip,
} from "@mui/material";

// Icons
import ApartmentIcon from "@mui/icons-material/Apartment";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import GroupsIcon from "@mui/icons-material/Groups";

import DashboardService from "../../services/dashboardService";

// Theme Colors theo thiết kế
const COLORS = {
  primary: "#5e35b1",
  border: "#e0e0e0",
  bgLight: "#f8f9fa",
  status: {
    Available: "#00897b", // Xanh ngọc
    Occupied: "#5e35b1", // Tím
    Dirty: "#ffb300", // Vàng
    Maintenance: "#e53935", // Đỏ
  },
};

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lấy ngày hiện tại format: Oct 24, 2024
  const currentDate = new Date().toLocaleDateString("en-US", {
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
        setError(err);
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
          minHeight: "50vh",
        }}
      >
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ m: 3, borderRadius: 2 }}>
        {error}
      </Alert>
    );

  // Tính tổng số phòng từ dữ liệu trả về
  const totalRooms =
    stats?.rooms?.reduce((acc, curr) => acc + curr.count, 0) || 0;

  // Dữ liệu hiển thị 4 thẻ chỉ số
  const summaryCards = [
    {
      title: "Tổng số phòng",
      value: totalRooms,
      icon: <ApartmentIcon fontSize="small" />,
      iconBg: "#ede7f6", // Tím nhạt
      iconColor: COLORS.primary,
      trendText: "Toàn hệ thống",
    },
    {
      title: "Khách đến hôm nay",
      value: stats?.bookings?.arrivals_today || 0,
      icon: <FlightLandIcon fontSize="small" />,
      iconBg: "#e0f2f1", // Xanh ngọc nhạt
      iconColor: "#00897b",
      trendText: "Lịch Check-in",
    },
    {
      title: "Khách đi hôm nay",
      value: stats?.bookings?.departures_today || 0,
      icon: <FlightTakeoffIcon fontSize="small" />,
      iconBg: "#efebe9", // Nâu nhạt
      iconColor: "#8d6e63",
      trendText: "Lịch Check-out",
    },
    {
      title: "Doanh thu tháng này",
      value: `$${(stats?.revenue || 0).toLocaleString("en-US")}`,
      icon: <RequestQuoteIcon fontSize="small" />,
      iconBg: "#ede7f6", // Tím nhạt
      iconColor: COLORS.primary,
      trendText: "Tổng doanh thu thực tế",
    },
  ];

  // Helper dịch trạng thái
  const getStatusLabel = (status) => {
    switch (status) {
      case "Available":
        return "Trống (Available)";
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

  return (
    <Box
      sx={{ p: { xs: 2, md: 4 }, bgcolor: COLORS.bgLight, minHeight: "100vh" }}
    >
      {/* 1. HEADER KHU VỰC TOP */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="800"
            sx={{ color: "#1a1a1a", letterSpacing: "-0.5px", mb: 0.5 }}
          >
            Chào mừng trở lại, Admin
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Dưới đây là tình hình hoạt động tại Hue Hotel hôm nay.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            sx={{ bgcolor: "white", border: `1px solid ${COLORS.border}` }}
          >
            <NotificationsNoneIcon sx={{ color: COLORS.primary }} />
          </IconButton>
          <Chip
            icon={<CalendarTodayIcon fontSize="small" />}
            label={currentDate}
            sx={{
              bgcolor: "white",
              border: `1px solid ${COLORS.border}`,
              fontWeight: "bold",
              borderRadius: "8px",
              px: 1,
            }}
          />
        </Box>
      </Box>

      {/* 2. CÁC THẺ CHỈ SỐ NHANH */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "16px",
                border: `1px solid ${COLORS.border}`,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography
                  variant="body2"
                  fontWeight="600"
                  color="text.secondary"
                >
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    bgcolor: card.iconBg,
                    color: card.iconColor,
                    p: 0.8,
                    borderRadius: "8px",
                    display: "flex",
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
              <Typography
                variant="h4"
                fontWeight="800"
                sx={{ mb: 1.5, color: "#111" }}
              >
                {card.value}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: "auto",
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 16, color: "#00897b" }} />
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ color: "#00897b" }}
                >
                  {card.trendText}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 3. KHU VỰC THÔNG TIN CHI TIẾT */}
      <Grid container spacing={4}>
        {/* TRẠNG THÁI PHÒNG (Left Column) */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "16px",
              border: `1px solid ${COLORS.border}`,
              height: "100%",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 4 }}
            >
              <Typography variant="h6" fontWeight="bold" color="#111">
                Phân bổ trạng thái phòng
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{
                  color: COLORS.primary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                Xem tất cả <ArrowForwardIcon fontSize="small" />
              </Typography>
            </Stack>

            <Stack spacing={4}>
              {stats?.rooms?.map((room, idx) => {
                const percentage =
                  totalRooms === 0 ? 0 : (room.count / totalRooms) * 100;
                const dotColor = COLORS.status[room.status] || "#9e9e9e";

                return (
                  <Box key={idx}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: dotColor,
                          }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="#111"
                        >
                          {getStatusLabel(room.status)}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        color="text.secondary"
                      >
                        {room.count} Phòng ({percentage.toFixed(0)}%)
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        width: "100%",
                        height: 8,
                        bgcolor: "#f0f0f0",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          height: "100%",
                          borderRadius: 4,
                          bgcolor: dotColor,
                          transition: "width 1s ease-in-out",
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* MỤC TIÊU CA LÀM VIỆC (Right Column) */}
        <Grid item xs={12} md={5} lg={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: "16px",
              bgcolor: COLORS.primary,
              color: "white",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 3, md: 4 },
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                gap={1.5}
                sx={{ mb: 1 }}
              >
                <TrackChangesIcon fontSize="medium" />
                <Typography variant="h6" fontWeight="bold">
                  Mục tiêu ca làm việc
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{ opacity: 0.85, mb: 4, lineHeight: 1.6 }}
              >
                Nhiệm vụ ưu tiên cho ca làm việc hiện tại dựa trên dữ liệu thời
                gian thực.
              </Typography>

              <Stack spacing={2} sx={{ mb: 4 }}>
                {/* Alert 1 */}
                <Box
                  sx={{
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    p: 2,
                    display: "flex",
                    gap: 2,
                    bgcolor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <CleaningServicesIcon
                    sx={{ color: "rgba(255,255,255,0.9)", mt: 0.5 }}
                  />
                  <Box>
                    <Typography
                      fontWeight="bold"
                      variant="body2"
                      sx={{ mb: 0.5 }}
                    >
                      Cảnh báo Buồng phòng
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.8, lineHeight: 1.5, display: "block" }}
                    >
                      Ưu tiên dọn dẹp các phòng đang có trạng thái Dirty để
                      chuẩn bị cho các lượt check-in sớm.
                    </Typography>
                  </Box>
                </Box>

                {/* Alert 2 */}
                <Box
                  sx={{
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    p: 2,
                    display: "flex",
                    gap: 2,
                    bgcolor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <GroupsIcon
                    sx={{ color: "rgba(255,255,255,0.9)", mt: 0.5 }}
                  />
                  <Box>
                    <Typography
                      fontWeight="bold"
                      variant="body2"
                      sx={{ mb: 0.5 }}
                    >
                      Khách dự kiến đến
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.8, lineHeight: 1.5, display: "block" }}
                    >
                      Chuẩn bị trước thẻ từ cho{" "}
                      {stats?.bookings?.arrivals_today || 0} lượt khách dự kiến
                      nhận phòng hôm nay.
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "white",
                  color: COLORS.primary,
                  fontWeight: "bold",
                  mt: "auto",
                  textTransform: "none",
                  borderRadius: "8px",
                  py: 1.5,
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
              >
                Xem báo cáo đầy đủ
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;
