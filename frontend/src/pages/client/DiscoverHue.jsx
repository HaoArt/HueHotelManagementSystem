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
  Fade,
  Slide,
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

// Context kiểm tra đăng nhập
import { AuthContext } from "../../context/AuthContext";

// LUXURY DESIGN TOKENS
const LUXURY = {
  white: "#FAFAF9",
  offwhite: "#F8F8F6",
  charcoal: "#1A1A1A",
  navy: "#1B2D4F",
  gold: "#D4AF37",
  goldLight: "#E8D4B8",
  warmGray: "#9B8B7E",
  softGray: "#D4D0C8",
};

const DiscoverHue = () => {
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
    window.scrollTo(0, 0);

    const initData = async () => {
      try {
        const destRes = await DestinationService.getAll();
        setDestinations(destRes.data || []);

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
  }, [user]);

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

  // Đồng bộ màu Badge với Luxury Theme
  const getCategoryColor = (category) => {
    switch (category) {
      case "Di tích":
        return LUXURY.navy;
      case "Ẩm thực":
        return "#d84315"; // Cam sậm ấm áp
      case "Check-in":
        return LUXURY.gold;
      default:
        return "#2e7d32"; // Xanh rêu
    }
  };

  const handleRentMotorbike = async () => {
    try {
      setIsSubmitting(true);
      await FolioService.orderService({
        booking_id: activeBooking.id,
        service_id: 3, // Giả sử ID 3 là thuê xe máy
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
          bgcolor: LUXURY.white,
        }}
      >
        <CircularProgress sx={{ color: LUXURY.gold }} />
      </Box>
    );

  return (
    <Box
      sx={{
        bgcolor: LUXURY.offwhite,
        minHeight: "100vh",
        pb: { xs: 8, md: 12 },
      }}
    >
      {/* =========================================================================
          HERO HEADER SECTION - LUXURY STYLE
         ========================================================================= */}
      <Box
        sx={{
          height: { xs: "50vh", md: "60vh" },
          backgroundImage: `linear-gradient(to bottom, rgba(26,26,26,0.6), rgba(27,45,79,0.3)), url("https://images.unsplash.com/photo-1697861493110-b350eff7eebb?q=100&w=1920")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: { md: "fixed" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          mb: { xs: 6, md: 10 },
          position: "relative",
        }}
      >
        <Container>
          <Fade in={true} timeout={1000}>
            <Box>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 800,
                  letterSpacing: "1px",
                  mb: 2,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  textShadow: "0 4px 16px rgba(0,0,0,0.4)",
                }}
              >
                Khám Phá Cố Đô
              </Typography>
              <Typography
                variant="h6"
                component="p"
                sx={{
                  opacity: 0.9,
                  maxWidth: "700px",
                  mx: "auto",
                  fontWeight: 300,
                  lineHeight: 1.8,
                  fontSize: { xs: "1rem", md: "1.2rem" },
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                Trải nghiệm trọn vẹn nét đẹp văn hóa, lịch sử và tinh hoa ẩm
                thực đặc trưng chỉ có tại Huế Hotel.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* =========================================================================
            LIST DESTINATIONS - EDITORIAL ZIG-ZAG LAYOUT
           ========================================================================= */}
        <Grid container spacing={{ xs: 6, md: 8 }}>
          {destinations.map((place, index) => {
            const isImageLeft = index % 2 === 0;

            return (
              <Grid item xs={12} key={place.id}>
                <Slide
                  direction={isImageLeft ? "right" : "left"}
                  in={true}
                  timeout={600 + index * 100}
                >
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: "24px",
                      border: `1px solid ${LUXURY.softGray}`,
                      display: "flex",
                      flexDirection: {
                        xs: "column",
                        md: isImageLeft ? "row" : "row-reverse",
                      },
                      overflow: "hidden",
                      transition: "all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)",
                      bgcolor: LUXURY.white,
                      boxShadow: "0 20px 40px rgba(26,26,26,0.06)",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 24px 48px rgba(26,26,26,0.12)",
                        "& .MuiCardMedia-root": {
                          transform: "scale(1.05)",
                        },
                      },
                    }}
                  >
                    {/* HÌNH ẢNH (ĐÃ FIX LỖI ẢNH DỌC LÀM VỠ LAYOUT) */}
                    <Box
                      sx={{
                        width: { xs: "100%", md: "50%" },
                        minHeight: { xs: 300, md: 380 }, // Ép chiều cao tối thiểu cho Card luôn đều và đẹp
                        flexShrink: 0,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{
                          position: "absolute", // Tách ảnh khỏi luồng flex để không bị phình to
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover", // Tự động cắt cúp ảnh cho vừa khung
                          transition:
                            "transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)",
                        }}
                        image={place.image_url}
                        alt={place.name}
                      />
                    </Box>

                    {/* NỘI DUNG */}
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
                        mb={3}
                      >
                        <Chip
                          icon={getCategoryIcon(place.category)}
                          label={place.category}
                          size="medium"
                          sx={{
                            bgcolor: `${getCategoryColor(place.category)}15`,
                            color: getCategoryColor(place.category),
                            fontWeight: "800",
                            borderRadius: "12px",
                            px: 1,
                            letterSpacing: "0.5px",
                          }}
                        />
                        <Typography
                          variant="subtitle2"
                          color={LUXURY.charcoal}
                          fontWeight="bold"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            bgcolor: LUXURY.offwhite,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "12px",
                            border: `1px solid ${LUXURY.softGray}`,
                          }}
                        >
                          <LocationOnIcon
                            fontSize="small"
                            sx={{ color: LUXURY.warmGray }}
                          />
                          Cách KS: {parseFloat(place.distance_km)} km
                        </Typography>
                      </Stack>

                      <Typography
                        variant="h3"
                        sx={{
                          mb: 3,
                          color: LUXURY.charcoal,
                          fontFamily: '"Playfair Display", serif',
                          fontWeight: 800,
                          fontSize: { xs: "1.8rem", md: "2.2rem" },
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {place.name}
                      </Typography>

                      <Typography
                        variant="body1"
                        color={LUXURY.charcoal}
                        sx={{
                          mb: 4,
                          lineHeight: 1.9,
                          fontSize: "1.05rem",
                          opacity: 0.85,
                        }}
                      >
                        {place.description}
                      </Typography>

                      <Box sx={{ mt: "auto", pt: 2 }}>
                        {/* CROSS-SELL ĐẶT XE */}
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
                              background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                              color: LUXURY.white,
                              fontWeight: "800",
                              px: 4,
                              py: 1.5,
                              borderRadius: "12px",
                              boxShadow: `0 12px 24px ${LUXURY.gold}40`,
                              textTransform: "none",
                              fontSize: "1rem",
                              letterSpacing: "0.5px",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: `0 16px 32px ${LUXURY.gold}60`,
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
                              borderRadius: "12px",
                              fontWeight: "bold",
                              borderStyle: "dashed",
                              borderColor: LUXURY.softGray,
                            }}
                          >
                            Dành riêng cho Khách lưu trú
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            );
          })}
        </Grid>

        {/* =========================================================================
            DIALOG THUÊ XE MÁY TỰ ĐỘNG - LUXURY STYLE
           ========================================================================= */}
        <Dialog
          disableScrollLock
          open={rentDialog.open}
          onClose={() => setRentDialog({ open: false, destination: null })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "24px",
              overflow: "hidden",
              border: `1px solid ${LUXURY.softGray}`,
              boxShadow: "0 24px 48px rgba(26,26,26,0.12)",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: "900",
              fontFamily: '"Playfair Display", serif',
              bgcolor: LUXURY.navy,
              color: LUXURY.white,
              textAlign: "center",
              py: 2.5,
              fontSize: "1.5rem",
            }}
          >
            Xác nhận yêu cầu xe
          </DialogTitle>
          <DialogContent sx={{ pt: 4, pb: 2, px: { xs: 3, md: 5 } }}>
            <Alert
              severity="success"
              icon={false}
              sx={{
                mb: 4,
                borderRadius: "12px",
                bgcolor: `${LUXURY.gold}15`,
                color: LUXURY.charcoal,
                border: `1px solid ${LUXURY.gold}40`,
                textAlign: "center",
              }}
            >
              Bạn đang thao tác tại{" "}
              <b style={{ color: LUXURY.navy }}>
                Phòng {activeBooking?.room_number}
              </b>
              .
            </Alert>
            <Typography
              variant="body1"
              mb={2}
              fontSize="1.1rem"
              color={LUXURY.charcoal}
            >
              Điểm đến:{" "}
              <b style={{ color: LUXURY.navy, fontSize: "1.2rem" }}>
                {rentDialog.destination?.name}
              </b>
            </Typography>
            <Typography
              variant="body1"
              color={LUXURY.warmGray}
              lineHeight={1.8}
            >
              Hệ thống sẽ ghi nhận dịch vụ <b>"Thuê xe máy (Tay ga)"</b> với giá{" "}
              <b style={{ color: LUXURY.charcoal }}>200,000đ/ngày</b>. Bạn vui
              lòng xuống sảnh lễ tân để nhận chìa khóa xe nhé!
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 2, justifyContent: "center", gap: 2 }}>
            <Button
              onClick={() => setRentDialog({ open: false, destination: null })}
              sx={{
                fontWeight: "700",
                px: 4,
                color: LUXURY.warmGray,
                "&:hover": { bgcolor: LUXURY.offwhite },
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleRentMotorbike}
              disabled={isSubmitting}
              sx={{
                background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                color: LUXURY.white,
                fontWeight: "800",
                px: 5,
                py: 1.2,
                borderRadius: "12px",
                boxShadow: `0 8px 24px ${LUXURY.gold}40`,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 32px ${LUXURY.gold}60`,
                },
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
            sx={{
              width: "100%",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default DiscoverHue;
