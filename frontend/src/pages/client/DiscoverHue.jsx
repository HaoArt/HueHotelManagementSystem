/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";

// Icons
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";

import DestinationService from "../../services/destinationService";
import BookingService from "../../services/bookingService";
import FolioService from "../../services/folioService";

// Bổ sung Context kiểm tra đăng nhập
import { AuthContext } from "../../context/AuthContext";

const COLORS = {
  primary: "#4a148c",
  primaryDark: "#311b92",
  teal: "#009688",
  orange: "#e65100",
  bgLight: "#f5f7fa",
};

const DiscoverHue = () => {
  // Lấy thông tin user hiện tại
  const { user } = useContext(AuthContext);

  const [destinations, setDestinations] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rentDialog, setRentDialog] = useState({
    open: false,
    destination: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Tải danh sách địa điểm (Khách chưa đăng nhập cũng xem được)
        const destRes = await DestinationService.getAll();
        setDestinations(destRes.data || []);

        // 2. Chỉ khi đã đăng nhập mới gọi API kiểm tra lịch sử đặt phòng
        if (user) {
          const bookingRes = await BookingService.getUserBookings();
          const bookings = bookingRes.data || [];
          const inHouse = bookings.find((b) => b.status === "Checked_in");
          setActiveBooking(inHouse || null);
        } else {
          setActiveBooking(null);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [user]); // Cập nhật lại giao diện nếu trạng thái đăng nhập thay đổi

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Di tích":
        return <AccountBalanceIcon fontSize="small" />;
      case "Ẩm thực":
        return <RestaurantIcon fontSize="small" />;
      case "Check-in":
        return <CameraAltIcon fontSize="small" />;
      default:
        return <LocalFloristIcon fontSize="small" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Di tích":
        return "#5e35b1";
      case "Ẩm thực":
        return "#e65100";
      case "Check-in":
        return "#00897b";
      default:
        return "#43a047";
    }
  };

  const handleRentMotorbike = async () => {
    try {
      setIsSubmitting(true);
      await FolioService.orderService({
        booking_id: activeBooking.id,
        service_id: 3,
        quantity: 1,
      });
      setSnackbar({
        open: true,
        message: "Lễ tân đã nhận yêu cầu! Xe máy sẽ được chuẩn bị trước sảnh.",
        severity: "success",
      });
      setRentDialog({ open: false, destination: null });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Có lỗi khi gọi dịch vụ",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );

  return (
    <Box sx={{ bgcolor: COLORS.bgLight, minHeight: "100vh", pb: 10 }}>
      {/* HERO HEADER SECTION - FULL WIDTH */}
      <Box
        sx={{
          height: { xs: "40vh", md: "50vh" },
          backgroundImage: `linear-gradient(to bottom, rgba(74, 20, 140, 0.47), rgba(49, 27, 146, 0.18)), url("https://images.unsplash.com/photo-1697861493110-b350eff7eebb?q=80&w=1167&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          mb: 6,
        }}
      >
        <Container>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="800"
            letterSpacing={2}
            gutterBottom
            sx={{
              textTransform: "uppercase",
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Khám Phá Cố Đô Huế
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              opacity: 0.9,
              maxWidth: "650px",
              mx: "auto",
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Trải nghiệm trọn vẹn nét đẹp văn hóa, lịch sử và tinh hoa ẩm thực
            đặc trưng chỉ có tại Hue Hotel.
          </Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ mt: { xs: -8, md: -12 } }}>
        {/* LIST DESTINATIONS - ZIG-ZAG LAYOUT */}
        <Grid container spacing={6}>
          {destinations.map((place, index) => {
            // Xác định vị trí chẵn lẻ để tạo cấu trúc Zig-Zag trên Desktop
            const isImageLeft = index % 2 === 0;

            return (
              <Grid item xs={12} key={place.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.05)",
                    display: "flex",
                    // Tự động xoay chiều dựa vào isImageLeft trên Desktop
                    flexDirection: {
                      xs: "column",
                      md: isImageLeft ? "row" : "row-reverse",
                    },
                    overflow: "hidden",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    bgcolor: "white",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(74, 20, 140, 0.12)",
                      "& .MuiCardMedia-root": {
                        transform: "scale(1.05)",
                      },
                    },
                  }}
                >
                  {/* PHẦN HÌNH ẢNH CỦA ĐỊA ĐIỂM CÓ HIỆU ỨNG ZOOM */}
                  <Box
                    sx={{
                      width: { xs: "100%", md: "50%" },
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        height: { xs: 300, md: 450 },
                        objectFit: "cover",
                        transition: "transform 0.6s ease",
                      }}
                      image={place.image_url}
                      alt={place.name}
                    />
                  </Box>

                  {/* PHẦN NỘI DUNG (LỊCH SỬ / MÔ TẢ) */}
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      p: { xs: 4, md: 6 },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2.5}
                    >
                      <Chip
                        icon={getCategoryIcon(place.category)}
                        label={place.category}
                        size="medium"
                        sx={{
                          bgcolor: `${getCategoryColor(place.category)}15`,
                          color: getCategoryColor(place.category),
                          fontWeight: "800",
                          borderRadius: "8px",
                          px: 1,
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        color="error"
                        fontWeight="bold"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          bgcolor: "#ffebee",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "20px",
                        }}
                      >
                        <LocationOnIcon fontSize="small" /> Cách KS:{" "}
                        {parseFloat(place.distance_km)} km
                      </Typography>
                    </Stack>

                    <Typography
                      variant="h4"
                      fontWeight="900"
                      sx={{
                        mb: 2.5,
                        color: "#1a1a1a",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {place.name}
                    </Typography>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.05rem" }}
                    >
                      {place.description}
                    </Typography>

                    <Box sx={{ mt: "auto", pt: 2 }}>
                      {/* LOGIC CROSS-SELL: Chỉ hiện khi khách đang Checked_in */}
                      {activeBooking ? (
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<TwoWheelerIcon />}
                          endIcon={<DoubleArrowIcon sx={{ fontSize: 18 }} />}
                          onClick={() =>
                            setRentDialog({ open: true, destination: place })
                          }
                          sx={{
                            bgcolor: COLORS.primary,
                            fontWeight: "bold",
                            px: 4,
                            py: 1.5,
                            borderRadius: "8px",
                            boxShadow: "0 8px 16px rgba(74, 20, 140, 0.2)",
                            textTransform: "none",
                            fontSize: "1.05rem",
                            "&:hover": {
                              bgcolor: COLORS.primaryDark,
                              boxShadow: "0 10px 20px rgba(74, 20, 140, 0.3)",
                            },
                          }}
                        >
                          Thuê xe đi đến đây
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="large"
                          disabled
                          sx={{
                            py: 1.5,
                            px: 4,
                            borderRadius: "8px",
                            fontWeight: "bold",
                            borderStyle: "dashed",
                          }}
                        >
                          Chỉ dành cho khách đang lưu trú
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* DIALOG THUÊ XE MÁY TỰ ĐỘNG - GIAO DIỆN FLAT DESIGN */}
        <Dialog
          disableScrollLock
          open={rentDialog.open}
          onClose={() => setRentDialog({ open: false, destination: null })}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "12px", overflow: "hidden" } }}
        >
          <DialogTitle
            sx={{
              fontWeight: "bold",
              bgcolor: COLORS.primary,
              color: "white",
              textAlign: "center",
              py: 2,
            }}
          >
            Xác nhận yêu cầu xe
          </DialogTitle>
          <DialogContent sx={{ pt: 4, pb: 2 }}>
            <Alert severity="success" sx={{ mb: 3, borderRadius: "8px" }}>
              Bạn đang thao tác tại <b>Phòng {activeBooking?.room_number}</b>.
            </Alert>
            <Typography variant="body1" mb={1.5} fontSize="1.1rem">
              Điểm đến:{" "}
              <b style={{ color: COLORS.primary }}>
                {rentDialog.destination?.name}
              </b>
            </Typography>
            <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
              Hệ thống sẽ ghi nhận dịch vụ <b>"Thuê xe máy (Tay ga)"</b> với giá{" "}
              <b>200,000đ/ngày</b>. Bạn vui lòng xuống sảnh lễ tân để nhận chìa
              khóa xe nhé!
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1, justifyContent: "center", gap: 1 }}>
            <Button
              onClick={() => setRentDialog({ open: false, destination: null })}
              color="inherit"
              sx={{ fontWeight: "bold", px: 3 }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleRentMotorbike}
              disabled={isSubmitting}
              sx={{
                bgcolor: COLORS.primary,
                fontWeight: "bold",
                px: 4,
                borderRadius: "8px",
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "ĐỒNG Ý THUÊ"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* SNACKBAR */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%", borderRadius: "8px" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default DiscoverHue;
