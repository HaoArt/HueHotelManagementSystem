/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Rating,
  Container,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Stack,
  Button,
  Divider,
  Paper,
  Avatar,
  Fade,
  Slide,
  Grid,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import SearchBar from "../../components/specific/SearchBar";
import RoomCard from "../../components/specific/RoomCard";

import PoolIcon from "@mui/icons-material/Pool";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SpaIcon from "@mui/icons-material/Spa";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import couponService from "../../services/couponService";
import RoomTypeService from "../../services/roomTypeService";
import reviewService from "../../services/reviewService";
import ConfigService from "../../services/configService";

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

const facilities = [
  {
    title: "Hồ Bơi Sang Trọng",
    desc: "Hồ bơi ngoài trời trên sân thượng với view hoàng hôn cực đẹp",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
    icon: <PoolIcon />,
  },
  {
    title: "Nhà Hàng & Bar",
    desc: "Thưởng thức ẩm thực địa phương và quốc tế trong không gian sang trọng",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    icon: <RestaurantIcon />,
  },
  {
    title: "Spa & Thư Giãn",
    desc: "Dịch vụ massage và chăm sóc sức khỏe chuyên nghiệp",
    img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
    icon: <SpaIcon />,
  },
  {
    title: "Phòng Gym",
    desc: "Trang thiết bị hiện đại giúp bạn duy trì thể lực mỗi ngày",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    icon: <FitnessCenterIcon />,
  },
];

const gallery = [
  {
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop",
    title: "Sảnh Khách Sạn",
  },
  {
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop",
    title: "Khu Vườn Thư Giãn",
  },
  {
    img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=600&fit=crop",
    title: "Nhà Hàng Sang Trọng",
  },
  {
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=600&fit=crop",
    title: "Hồ Bơi Riêng",
  },
  {
    img: "https://images.unsplash.com/photo-1559414059-34fe0a59e57a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "View thành phố",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [topRooms, setTopRooms] = useState([]);
  const [topReviews, setTopReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [showFacilities, setShowFacilities] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [pageMounted, setPageMounted] = useState(false);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSearch = (searchData) => {
    navigate("/rooms", { state: { initialSearchData: searchData } });
  };

  useEffect(() => {
    const mountTimer = setTimeout(() => setPageMounted(true), 100);
    return () => clearTimeout(mountTimer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [couponRes, roomsRes, reviewsRes] = await Promise.all([
          couponService.getActiveCoupons(),
          RoomTypeService.getTopRoomTypes(),
          reviewService.getTopReviews(),
        ]);

        setCoupons(couponRes.data || []);
        setTopRooms(roomsRes.data || []);
        setTopReviews(reviewsRes.data || []);

        const checkIn = await ConfigService.getConfigByKey("check_in_time");
        if (checkIn) setCheckInTime(checkIn);
        const checkOut = await ConfigService.getConfigByKey("check_out_time");
        if (checkOut) setCheckOutTime(checkOut);
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
        setSnackbar({
          open: true,
          message: "Không thể tải dữ liệu trang chủ.",
          severity: "error",
        });
      } finally {
        setLoading(false);
        setTimeout(() => {
          setShowFacilities(true);
        }, 800);
        setTimeout(() => {
          setShowReviews(true);
        }, 1200);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ bgcolor: LUXURY.white }}>
      <Box
        sx={{
          position: "relative",
          height: { xs: "75vh", md: "90vh" },
          backgroundImage: `linear-gradient(135deg, rgba(26,26,26,0.5), rgba(27,45,79,0.4)), url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=100")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: { md: "fixed" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Hero Content */}
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 2, mt: -5 }}
        >
          <Fade in={pageMounted} timeout={1000}>
            <Box sx={{ textAlign: "center", color: "white" }}>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 800,
                  letterSpacing: "3px",
                  mb: 2,
                  textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  fontSize: { xs: "3.2rem", md: "5.5rem" },
                }}
              >
                HUẾ HOTEL
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 400,
                  fontSize: { xs: "1.1rem", md: "1.5rem" },
                  letterSpacing: "2px",
                  opacity: 0.95,
                  textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  maxWidth: "700px",
                  mx: "auto",
                }}
              >
                Nơi di sản hội tụ cùng đẳng cấp nghỉ dưỡng
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 10,
          mt: { xs: -12, md: -8 },
          mb: { xs: 6, md: 8 },
          px: { xs: 2, md: 0 },
        }}
      >
        <Slide direction="up" in={pageMounted} timeout={800}>
          <Container maxWidth="lg">
            <Paper
              elevation={0}
              sx={{
                bgcolor: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(26,26,26,0.08)",
                borderRadius: "24px",
                p: { xs: 2, md: 3 },
                boxShadow: "0 20px 60px rgba(26,26,26,0.15)",
                width: "100%",
                willChange: "transform, opacity",
                transform: "translateZ(0)",
              }}
            >
              <SearchBar onSearch={handleSearch} />

              <Box sx={{ textAlign: "center", mt: 2.5 }}>
                <Typography
                  variant="body2"
                  sx={{ color: LUXURY.warmGray, fontWeight: 600 }}
                >
                  <AccessTimeIcon
                    sx={{
                      fontSize: 18,
                      verticalAlign: "middle",
                      mr: 0.5,
                      color: LUXURY.gold,
                      mt: "-2px",
                    }}
                  />
                  Giờ nhận phòng:{" "}
                  <span style={{ color: LUXURY.navy, fontWeight: 800 }}>
                    {checkInTime}
                  </span>
                  &nbsp;&nbsp;|&nbsp;&nbsp; Giờ trả phòng:{" "}
                  <span style={{ color: LUXURY.navy, fontWeight: 800 }}>
                    {checkOutTime}
                  </span>
                </Typography>
              </Box>
            </Paper>
          </Container>
        </Slide>
      </Box>
      {/* Thẻ giảm giá */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: LUXURY.white }}>
        <Container maxWidth="lg">
          <Fade in={pageMounted} timeout={800}>
            <Box sx={{ textAlign: "center", mb: { xs: 8, md: 10 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  mb: 3,
                  color: LUXURY.charcoal,
                }}
              >
                Ưu Đãi Đặc Biệt
              </Typography>
              <Box
                sx={{
                  width: "80px",
                  height: "3px",
                  background: `linear-gradient(90deg, transparent, ${LUXURY.gold}, transparent)`,
                  mx: "auto",
                  mb: 3,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: LUXURY.warmGray,
                  maxWidth: "500px",
                  mx: "auto",
                  fontSize: "1.05rem",
                }}
              >
                Cơ hội có 1-0-2 để trải nghiệm dịch vụ đẳng cấp với giá ưu đãi
              </Typography>
            </Box>
          </Fade>

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress sx={{ color: LUXURY.gold }} />
            </Box>
          ) : coupons.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: { xs: 3, md: 4 },
              }}
            >
              {coupons.slice(0, 3).map((item, index) => (
                <Fade
                  in={!loading}
                  timeout={800 + index * 100}
                  key={item.id || index}
                >
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: LUXURY.white,
                      border: `1px solid ${LUXURY.softGray}`,
                      borderRadius: "20px",
                      p: 4,
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "100px",
                        height: "100px",
                        background: `radial-gradient(circle, ${LUXURY.goldLight}, transparent 70%)`,
                        opacity: 0.5,
                      },
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 16px 48px rgba(212,175,55,0.15)",
                        borderColor: LUXURY.gold,
                      },
                    }}
                  >
                    {/* Discount Badge */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        background: LUXURY.gold,
                        color: LUXURY.charcoal,
                        px: 3,
                        py: 1.5,
                        borderBottomLeftRadius: "12px",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {item.discount_type === "PERCENTAGE"
                        ? `Giảm ${parseFloat(item.discount_value)}%`
                        : `Giảm ${Number(item.discount_value).toLocaleString("vi-VN")}đ`}
                    </Box>

                    {/* Content */}
                    <Box sx={{ position: "relative", zIndex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 3,
                        }}
                      >
                        <Box
                          sx={{
                            width: "48px",
                            height: "48px",
                            bgcolor: `${LUXURY.gold}20`,
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <LocalOfferIcon
                            sx={{ fontSize: 28, color: LUXURY.gold }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            color: LUXURY.charcoal,
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 600,
                          }}
                        >
                          Mã: {item.code}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          color: LUXURY.warmGray,
                          mb: 3,
                          minHeight: "60px",
                          lineHeight: 1.7,
                        }}
                      >
                        {item.description ||
                          "Ưu đãi dành riêng cho thành viên khách sạn Huế Hotel. Áp dụng cho mọi loại phòng."}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: LUXURY.softGray,
                          fontSize: "0.85rem",
                          fontStyle: "italic",
                          mb: 3,
                        }}
                      >
                        HSD:{" "}
                        {item.end_date
                          ? new Date(item.end_date).toLocaleDateString("vi-VN")
                          : "Không thời hạn"}
                      </Typography>

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          navigator.clipboard.writeText(item.code);
                          setSnackbar({
                            open: true,
                            message: `Đã sao chép mã ${item.code}`,
                            severity: "success",
                          });
                        }}
                        sx={{
                          bgcolor: LUXURY.gold,
                          color: LUXURY.charcoal,
                          borderRadius: "12px",
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          fontSize: "0.95rem",
                          py: 1.5,
                          boxShadow: "none",
                          "&:hover": {
                            bgcolor: LUXURY.goldLight,
                            boxShadow: "none",
                          },
                        }}
                      >
                        Lưu Mã
                      </Button>
                    </Box>
                  </Card>
                </Fade>
              ))}
            </Box>
          ) : (
            <Typography
              textAlign="center"
              color="text.secondary"
              sx={{ py: 4 }}
            >
              Hiện tại không có chương trình khuyến mãi nào.
            </Typography>
          )}
        </Container>
      </Box>
      {/* Phòng nổi bật  */}
      <Box
        sx={{
          py: { xs: 10, md: 12 },
          bgcolor: LUXURY.offwhite,
          borderTop: `1px solid ${LUXURY.softGray}`,
          borderBottom: `1px solid ${LUXURY.softGray}`,
        }}
      >
        <Container maxWidth="lg">
          <Fade in={pageMounted} timeout={800}>
            <Box sx={{ textAlign: "center", mb: { xs: 8, md: 10 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  mb: 3,
                  color: LUXURY.charcoal,
                }}
              >
                Phòng Nổi Bật
              </Typography>
              <Box
                sx={{
                  width: "80px",
                  height: "3px",
                  background: `linear-gradient(90deg, transparent, ${LUXURY.gold}, transparent)`,
                  mx: "auto",
                  mb: 3,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: LUXURY.warmGray,
                  maxWidth: "500px",
                  mx: "auto",
                  fontSize: "1.05rem",
                }}
              >
                Top 3 không gian được yêu thích nhất của chúng tôi
              </Typography>
            </Box>
          </Fade>

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress sx={{ color: LUXURY.gold }} />
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: { xs: 3, md: 4 },
              }}
            >
              {topRooms && topRooms.length > 0
                ? topRooms.slice(0, 3).map((room, idx) => (
                    <Fade in={!loading} timeout={800 + idx * 100} key={room.id}>
                      <Box>
                        <RoomCard room={room} />
                      </Box>
                    </Fade>
                  ))
                : !loading && (
                    <Typography
                      sx={{
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        color: LUXURY.warmGray,
                      }}
                    >
                      Không tìm thấy phòng nổi bật.
                    </Typography>
                  )}
            </Box>
          )}

          <Box sx={{ textAlign: "center", mt: 8 }}>
            <Button
              component={Link}
              to="/rooms"
              variant="outlined"
              sx={{
                color: LUXURY.charcoal,
                borderColor: LUXURY.charcoal,
                px: 5,
                py: 1.5,
                borderRadius: "12px",
                fontWeight: "700",
                "&:hover": { borderColor: "black", background: LUXURY.white },
              }}
            >
              XEM TẤT CẢ LOẠI PHÒNG
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Dịch vụ  nổi bật */}
      <Fade in={showFacilities} timeout={1000}>
        <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: LUXURY.white }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: { xs: 8, md: 10 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  mb: 3,
                  color: LUXURY.charcoal,
                }}
              >
                Dịch Vụ & Tiện Ích
              </Typography>
              <Box
                sx={{
                  width: "80px",
                  height: "3px",
                  background: `linear-gradient(90deg, transparent, ${LUXURY.gold}, transparent)`,
                  mx: "auto",
                  mb: 3,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: LUXURY.warmGray,
                  maxWidth: "600px",
                  mx: "auto",
                  fontSize: "1.05rem",
                }}
              >
                Mọi tiện nghi đẳng cấp nhất đã sẵn sàng cho kỳ nghỉ của bạn
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                },
                gap: { xs: 3, md: 4 },
                alignItems: "center",
              }}
            >
              {facilities.map((item, index) => (
                <Slide
                  direction={index % 2 === 0 ? "right" : "left"}
                  in={showFacilities}
                  timeout={800 + index * 100}
                  key={index}
                >
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: LUXURY.offwhite,
                      border: `1px solid ${LUXURY.softGray}`,
                      borderRadius: "20px",
                      overflow: "hidden",
                      transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 16px 48px rgba(26,26,26,0.08)",
                        borderColor: LUXURY.gold,
                        "& .facility-image": {
                          transform: "scale(1.08)",
                        },
                      },
                    }}
                  >
                    {/* Image */}
                    <Box
                      className="facility-image"
                      component="img"
                      loading="lazy"
                      src={item.img}
                      sx={{
                        width: { xs: "100%", md: "45%" },
                        height: { xs: 240, md: "100%", minHeight: 280 },
                        objectFit: "cover",
                        transition:
                          "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    />
                    {/* Content */}
                    <CardContent
                      sx={{
                        p: { xs: 3, md: 4 },
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: "44px",
                            height: "44px",
                            bgcolor: `${LUXURY.gold}15`,
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: LUXURY.gold,
                          }}
                        >
                          {React.cloneElement(item.icon, {
                            sx: { fontSize: 24 },
                          })}
                        </Box>
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: '"Playfair Display", serif',
                          color: LUXURY.charcoal,
                          mb: 2,
                          fontWeight: 600,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: LUXURY.warmGray,
                          lineHeight: 1.8,
                          fontSize: "1rem",
                        }}
                      >
                        {item.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Slide>
              ))}
            </Box>
          </Container>
        </Box>
      </Fade>

      {/* Ảnh nổi bật */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: LUXURY.offwhite }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 8, md: 10 } }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Playfair Display", serif',
                mb: 3,
                color: LUXURY.charcoal,
              }}
            >
              Không Gian Huế Hotel
            </Typography>
            <Box
              sx={{
                width: "80px",
                height: "3px",
                background: `linear-gradient(90deg, transparent, ${LUXURY.gold}, transparent)`,
                mx: "auto",
                mb: 3,
              }}
            />
            <Typography
              variant="body1"
              sx={{
                color: LUXURY.warmGray,
                maxWidth: "500px",
                mx: "auto",
                fontSize: "1.05rem",
              }}
            >
              Vẻ đẹp giao thoa giữa nét cổ kính và hơi thở hiện đại
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(12, 1fr)",
              },
              gap: 3,
            }}
          >
            <Fade in={pageMounted} timeout={800}>
              <Box
                sx={{
                  gridColumn: { xs: "1 / -1", md: "1 / span 8" },
                  height: { xs: 300, md: 400 },
                  borderRadius: "20px",
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                  "&:hover img": {
                    transform: "scale(1.06)",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(26,26,26,0.15) 100%)",
                    zIndex: 1,
                  },
                }}
              >
                <Box
                  component="img"
                  loading="lazy"
                  src={
                    gallery[0]?.img ||
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop"
                  }
                  alt={gallery[0]?.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition:
                      "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              </Box>
            </Fade>

            <Box
              sx={{
                gridColumn: { xs: "1 / -1", md: "9 / span 4" },
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {gallery.slice(1, 3).map((item, idx) => (
                <Fade
                  in={pageMounted}
                  timeout={800 + (idx + 1) * 100}
                  key={idx}
                >
                  <Box
                    sx={{
                      height: { xs: 200, md: 190 },
                      borderRadius: "16px",
                      overflow: "hidden",
                      position: "relative",
                      cursor: "pointer",
                      "&:hover img": {
                        transform: "scale(1.06)",
                      },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(26,26,26,0.15) 100%)",
                        zIndex: 1,
                      },
                    }}
                  >
                    <Box
                      component="img"
                      loading="lazy"
                      src={item.img}
                      alt={item.title}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition:
                          "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    />
                  </Box>
                </Fade>
              ))}
            </Box>

            {/* Bottom row - 2 equal images */}
            {gallery.slice(3).map((item, idx) => (
              <Fade
                in={pageMounted}
                timeout={800 + (idx + 3) * 100}
                key={idx + 3}
              >
                <Box
                  sx={{
                    gridColumn: { xs: "1 / -1", md: "span 6" },
                    height: { xs: 250, md: 300 },
                    borderRadius: "16px",
                    overflow: "hidden",
                    position: "relative",
                    cursor: "pointer",
                    "&:hover img": {
                      transform: "scale(1.06)",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(26,26,26,0.15) 100%)",
                      zIndex: 1,
                    },
                  }}
                >
                  <Box
                    component="img"
                    loading="lazy"
                    src={item.img}
                    alt={item.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition:
                        "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  />
                </Box>
              </Fade>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Top đánh giá */}
      <Fade in={showReviews} timeout={1000}>
        <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: LUXURY.white }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  mb: 3,
                  color: LUXURY.charcoal,
                }}
              >
                Nhận Xét Từ Khách Hàng
              </Typography>
              <Box
                sx={{
                  width: "80px",
                  height: "3px",
                  background: `linear-gradient(90deg, transparent, ${LUXURY.gold}, transparent)`,
                  mx: "auto",
                  mb: 3,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: LUXURY.warmGray,
                  maxWidth: "500px",
                  mx: "auto",
                  fontSize: "1.05rem",
                }}
              >
                Những chia sẻ quý báu từ những vị khách đã trải nghiệm
              </Typography>
            </Box>

            {topReviews && topReviews.length > 0 ? (
              <Swiper
                modules={[EffectCoverflow, Pagination, Autoplay]}
                effect="coverflow"
                grabCursor
                centeredSlides
                slidesPerView="auto"
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 2,
                  slideShadows: false,
                }}
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                className="mySwiper"
                style={{ paddingBottom: "50px" }}
              >
                {topReviews.map((review, idx) => (
                  <SwiperSlide
                    key={idx}
                    style={{
                      width: "100%",
                      maxWidth: "600px",
                      padding: "10px",
                    }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        bgcolor: LUXURY.offwhite,
                        border: `1px solid ${LUXURY.softGray}`,
                        borderRadius: "20px",
                        p: 4,
                        minHeight: "320px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0 10px 30px rgba(26,26,26,0.05)",
                      }}
                    >
                      {/* Quote Icon */}
                      <FormatQuoteIcon
                        sx={{
                          fontSize: 48,
                          color: LUXURY.gold,
                          opacity: 0.4,
                          mb: 2,
                        }}
                      />

                      {/* Rating */}
                      <Rating
                        value={review.rating || 5}
                        readOnly
                        sx={{
                          "& .MuiRating-iconFilled": { color: LUXURY.gold },
                          mb: 2,
                        }}
                      />

                      {/* Comment */}
                      <Typography
                        variant="body1"
                        sx={{
                          color: LUXURY.charcoal,
                          mb: 4,
                          lineHeight: 1.8,
                          fontStyle: "italic",
                          flex: 1,
                        }}
                      >
                        "{review.comment || review.content}"
                      </Typography>

                      <Divider sx={{ mb: 3 }} />

                      {/* Author */}
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <Avatar
                          sx={{
                            width: 50,
                            height: 50,
                            background: `linear-gradient(135deg, ${LUXURY.gold}, ${LUXURY.goldLight})`,
                            fontWeight: 800,
                            color: LUXURY.charcoal,
                          }}
                        >
                          {(review.author_name ||
                            review.customer_name ||
                            "K")[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              color: LUXURY.charcoal,
                              fontWeight: 700,
                            }}
                          >
                            {review.full_name ||
                              review.customer_name ||
                              "Khách hàng"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <Typography
                textAlign="center"
                color="text.secondary"
                sx={{ py: 4 }}
              >
                Chưa có nhận xét nào.
              </Typography>
            )}
          </Container>
        </Box>
      </Fade>

      <Box
        sx={{
          py: { xs: 10, md: 12 },
          bgcolor: LUXURY.charcoal,
          color: LUXURY.white,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 20% 50%, ${LUXURY.gold}20, transparent 50%),
                         radial-gradient(circle at 80% 80%, ${LUXURY.gold}15, transparent 50%)`,
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
          <Fade in={pageMounted} timeout={800}>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  mb: 3,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                }}
              >
                Sẵn Sàng Khám Phá?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  fontSize: "1.15rem",
                  opacity: 0.95,
                  maxWidth: "500px",
                  mx: "auto",
                }}
              >
                Bắt đầu hành trình của bạn đến Huế Hotel ngay hôm nay
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/rooms")}
                sx={{
                  bgcolor: LUXURY.gold,
                  color: LUXURY.charcoal,
                  fontWeight: 800,
                  fontSize: "1rem",
                  py: 1.8,
                  px: 5,
                  borderRadius: "12px",
                  letterSpacing: "1px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: LUXURY.goldLight,
                    transform: "translateY(-2px)",
                    boxShadow: `0 12px 32px ${LUXURY.gold}40`,
                  },
                }}
              >
                XEM TẤT CẢ PHÒNG
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ borderRadius: "12px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
