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
  Stack,
  Button,
  Divider,
  Paper,
  Avatar,
  Fade,
  Slide,
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
  white: "#FFFFFF",
  offwhite: "#FAFAF9",
  charcoal: "#1A1A1A",
  navy: "#1B2D4F",
  gold: "#D4AF37",
  goldLight: "#E8D4B8",
  warmGray: "#6B7280",
  softGray: "rgba(0,0,0,0.08)",
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
    img: "https://images.unsplash.com/photo-1559414059-34fe0a59e57a?q=80&w=687&auto=format&fit=crop",
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
        setTimeout(() => setShowFacilities(true), 400);
        setTimeout(() => setShowReviews(true), 600);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ bgcolor: LUXURY.offwhite, overflowX: "hidden" }}>
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
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 2, mt: -8 }}
        >
          <Fade in={pageMounted} timeout={800}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  letterSpacing: "4px",
                  mb: 2,
                  fontSize: { xs: "3rem", md: "5.5rem" },
                  color: LUXURY.white,
                }}
              >
                HUẾ HOTEL
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 400,
                  fontSize: { xs: "1.3rem", md: "1.5rem" },
                  letterSpacing: "2px",
                  color: LUXURY.white,
                  textTransform: "uppercase",
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
          mt: { xs: -8, md: -6 },
          mb: { xs: 8, md: 10 },
          px: { xs: 2, md: 0 },
        }}
      >
        <Slide direction="up" in={pageMounted} timeout={600}>
          <Container maxWidth="lg">
            <Paper
              elevation={0}
              sx={{
                bgcolor: LUXURY.white,
                border: `1px solid ${LUXURY.softGray}`,
                borderRadius: "8px", // Chuẩn 8px
                p: { xs: 2, md: 3 },
                boxShadow: "0 8px 24px rgba(0,0,0,0.04)", // Soft shadow
                width: "100%",
              }}
            >
              <SearchBar onSearch={handleSearch} />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  justifyContent: "center",
                  gap: { xs: 1, sm: 2 },
                  mt: 2.5,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    color: LUXURY.warmGray,
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  <AccessTimeIcon
                    sx={{
                      fontSize: 16,
                      color: LUXURY.gold,
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      color: LUXURY.warmGray,
                      fontWeight: 500,
                    }}
                  >
                    Giờ nhận phòng:
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: LUXURY.charcoal,
                      fontWeight: 700,
                    }}
                  >
                    {checkInTime}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: { xs: "none", sm: "block" },
                    color: LUXURY.softGray,
                  }}
                >
                  |
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    color: LUXURY.warmGray,
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: LUXURY.warmGray,
                      fontWeight: 500,
                    }}
                  >
                    Giờ trả phòng:
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: LUXURY.charcoal,
                      fontWeight: 700,
                    }}
                  >
                    {checkOutTime}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Slide>
      </Box>

      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: LUXURY.offwhite }}>
        <Container maxWidth="lg">
          <Fade in={pageMounted} timeout={800}>
            <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  mb: 2,
                  color: LUXURY.charcoal,
                  fontWeight: 700,
                }}
              >
                Ưu Đãi Đặc Biệt
              </Typography>
              <Box
                sx={{
                  width: "60px",
                  height: "2px",
                  bgcolor: LUXURY.gold,
                  mx: "auto",
                  mb: 3,
                }}
              />
              <Typography
                variant="body1"
                sx={{ color: LUXURY.warmGray, fontSize: "1rem" }}
              >
                Cơ hội trải nghiệm dịch vụ đẳng cấp với giá ưu đãi
              </Typography>
            </Box>
          </Fade>

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress sx={{ color: LUXURY.gold }} />
            </Box>
          ) : coupons.length > 0 ? (
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 3, md: 4 } }}
            >
              {coupons.slice(0, 3).map((item, index) => (
                <Box
                  key={item.id || index}
                  sx={{
                    flex: { xs: "1 1 100%", md: "1 1 calc(33.333% - 27px)" },
                  }}
                >
                  <Fade in={!loading} timeout={400 + index * 100}>
                    <Card
                      elevation={0}
                      sx={{
                        bgcolor: LUXURY.white,
                        border: `1px solid ${LUXURY.softGray}`,
                        borderRadius: "8px",
                        p: 4,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                          borderColor: LUXURY.gold,
                        },
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 2,
                          }}
                        >
                          <LocalOfferIcon
                            sx={{ fontSize: 20, color: LUXURY.gold }}
                          />
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: LUXURY.charcoal,
                              fontWeight: 700,
                              letterSpacing: "1px",
                            }}
                          >
                            {item.code}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h5"
                          sx={{
                            color: LUXURY.charcoal,
                            fontWeight: 700,
                            mb: 2,
                          }}
                        >
                          {item.discount_type === "Percentage"
                            ? `Giảm ${parseFloat(item.discount_value)}%`
                            : `Giảm ${Number(item.discount_value).toLocaleString("vi-VN")}đ`}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: LUXURY.warmGray,
                            mb: 3,
                            lineHeight: 1.6,
                          }}
                        >
                          {item.description ||
                            "Ưu đãi dành riêng cho khách hàng của Huế Hotel."}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            color: LUXURY.warmGray,
                            mb: 4,
                          }}
                        >
                          HSD:{" "}
                          {item.end_date
                            ? new Date(item.end_date).toLocaleDateString(
                                "vi-VN",
                              )
                            : "Không thời hạn"}
                        </Typography>
                      </Box>
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
                          color: LUXURY.white,
                          borderRadius: "8px",
                          fontWeight: 600,
                          py: 1.2,
                          boxShadow: "none",
                          "&:hover": { bgcolor: "#B8962A", boxShadow: "none" },
                        }}
                      >
                        LƯU MÃ
                      </Button>
                    </Card>
                  </Fade>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography textAlign="center" color={LUXURY.warmGray}>
              Hiện tại không có khuyến mãi nào.
            </Typography>
          )}
        </Container>
      </Box>

      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: LUXURY.white }}>
        <Container maxWidth="lg">
          <Fade in={pageMounted} timeout={800}>
            <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  mb: 2,
                  color: LUXURY.charcoal,
                  fontWeight: 700,
                }}
              >
                Phòng Nổi Bật
              </Typography>
              <Box
                sx={{
                  width: "60px",
                  height: "2px",
                  bgcolor: LUXURY.gold,
                  mx: "auto",
                  mb: 3,
                }}
              />
              <Typography
                variant="body1"
                sx={{ color: LUXURY.warmGray, fontSize: "1rem" }}
              >
                Top 3 không gian nghỉ dưỡng được yêu thích nhất
              </Typography>
            </Box>
          </Fade>

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress sx={{ color: LUXURY.gold }} />
            </Box>
          ) : (
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 3, md: 4 } }}
            >
              {topRooms && topRooms.length > 0
                ? topRooms.slice(0, 3).map((room, idx) => (
                    <Box
                      key={room.id}
                      sx={{
                        flex: {
                          xs: "1 1 100%",
                          md: "1 1 calc(33.333% - 27px)",
                        },
                      }}
                    >
                      <Fade in={!loading} timeout={400 + idx * 100}>
                        <Box sx={{ height: "100%" }}>
                          <RoomCard room={room} />
                        </Box>
                      </Fade>
                    </Box>
                  ))
                : !loading && (
                    <Typography
                      sx={{
                        width: "100%",
                        textAlign: "center",
                        color: LUXURY.warmGray,
                      }}
                    >
                      Không tìm thấy phòng nổi bật.
                    </Typography>
                  )}
            </Box>
          )}

          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              component={Link}
              to="/rooms"
              variant="outlined"
              sx={{
                color: LUXURY.charcoal,
                borderColor: LUXURY.softGray,
                px: 4,
                py: 1.2,
                borderRadius: "8px",
                fontWeight: "600",
                "&:hover": {
                  borderColor: LUXURY.charcoal,
                  bgcolor: "transparent",
                },
              }}
            >
              XEM TẤT CẢ PHÒNG
            </Button>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: LUXURY.offwhite }}>
        <Container maxWidth="lg">
          <Fade in={showFacilities} timeout={800}>
            <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  mb: 2,
                  color: LUXURY.charcoal,
                  fontWeight: 700,
                }}
              >
                Dịch Vụ & Tiện Ích
              </Typography>
              <Box
                sx={{
                  width: "60px",
                  height: "2px",
                  bgcolor: LUXURY.gold,
                  mx: "auto",
                  mb: 3,
                }}
              />
              <Typography
                variant="body1"
                sx={{ color: LUXURY.warmGray, fontSize: "1rem" }}
              >
                Mọi tiện nghi đẳng cấp nhất đã sẵn sàng cho kỳ nghỉ của bạn
              </Typography>
            </Box>
          </Fade>

          <Box
            sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 3, md: 4 } }}
          >
            {facilities.map((item, index) => (
              <Box
                key={index}
                sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 16px)" } }}
              >
                <Fade in={showFacilities} timeout={400 + index * 100}>
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: LUXURY.white,
                      border: `1px solid ${LUXURY.softGray}`,
                      borderRadius: "8px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      height: "100%",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                    }}
                  >
                    <Box
                      component="img"
                      loading="lazy"
                      src={item.img}
                      sx={{
                        width: { xs: "100%", sm: "40%" },
                        height: { xs: 200, sm: "100%" },
                        minHeight: { sm: 220 },
                        objectFit: "cover",
                      }}
                    />
                    <CardContent
                      sx={{
                        p: { xs: 3, md: 4 },
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Box sx={{ color: LUXURY.gold, mb: 2 }}>
                        {React.cloneElement(item.icon, {
                          sx: { fontSize: 24 },
                        })}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: '"Playfair Display", serif',
                          color: LUXURY.charcoal,
                          mb: 1,
                          fontWeight: 700,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: LUXURY.warmGray, lineHeight: 1.6 }}
                      >
                        {item.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: LUXURY.white }}>
        <Container maxWidth="lg">
          <Fade in={pageMounted} timeout={800}>
            <Box sx={{ textAlign: "center", mb: { xs: 5, md: 6 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  mb: 2,
                  color: LUXURY.charcoal,
                  fontWeight: 700,
                }}
              >
                Không Gian Huế Hotel
              </Typography>

              <Box
                sx={{
                  width: 60,
                  height: 2,
                  bgcolor: LUXURY.gold,
                  mx: "auto",
                  mb: 2.5,
                }}
              />

              <Typography
                variant="body1"
                sx={{
                  color: LUXURY.warmGray,
                  fontSize: "0.98rem",
                  maxWidth: 560,
                  mx: "auto",
                  lineHeight: 1.7,
                }}
              >
                Vẻ đẹp giao thoa giữa nét cổ kính và hơi thở hiện đại
              </Typography>
            </Box>
          </Fade>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: {
                    xs: "100%",
                    md: "calc(65% - 6px)",
                  },
                  height: {
                    xs: 220,
                    md: 280,
                  },
                  borderRadius: "8px",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <Box
                  component="img"
                  src={gallery[0]?.img}
                  alt={gallery[0]?.title}
                  loading="lazy"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform .35s ease",
                    display: "block",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  width: {
                    xs: "100%",
                    md: "calc(35% - 6px)",
                  },
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  flexShrink: 0,
                }}
              >
                {gallery.slice(1, 3).map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      height: {
                        xs: 150,
                        md: 132,
                      },
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="img"
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform .35s ease",
                        display: "block",
                        "&:hover": {
                          transform: "scale(1.02)",
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 1.5,
              }}
            >
              {gallery.slice(3).map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    flex: 1,
                    height: {
                      xs: 180,
                      md: 180,
                    },
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={item.img}
                    alt={item.title}
                    loading="lazy"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform .35s ease",
                      display: "block",
                      "&:hover": {
                        transform: "scale(1.02)",
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: LUXURY.offwhite }}>
        <Container maxWidth="lg">
          <Fade in={showReviews} timeout={800}>
            <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  mb: 2,
                  color: LUXURY.charcoal,
                  fontWeight: 700,
                }}
              >
                Nhận Xét Từ Khách Hàng
              </Typography>
              <Box
                sx={{
                  width: "60px",
                  height: "2px",
                  bgcolor: LUXURY.gold,
                  mx: "auto",
                  mb: 3,
                }}
              />
            </Box>
          </Fade>

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
              style={{ paddingBottom: "40px" }}
            >
              {topReviews.map((review, idx) => (
                <SwiperSlide
                  key={idx}
                  style={{ width: "100%", maxWidth: "600px", padding: "10px" }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: LUXURY.white,
                      border: `1px solid ${LUXURY.softGray}`,
                      borderRadius: "8px",
                      p: 4,
                      minHeight: "260px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                    }}
                  >
                    <FormatQuoteIcon
                      sx={{
                        fontSize: 32,
                        color: LUXURY.gold,
                        opacity: 0.5,
                        mb: 2,
                      }}
                    />
                    {console.log("Review data:", review)}
                    <Rating
                      value={review.rating || 5}
                      readOnly
                      size="small"
                      sx={{
                        "& .MuiRating-iconFilled": { color: LUXURY.gold },
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: LUXURY.charcoal,
                        mb: 3,
                        lineHeight: 1.6,
                        fontStyle: "italic",
                        flex: 1,
                      }}
                    >
                      "{review.comment || review.content}"
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: LUXURY.offwhite,
                          border: `1px solid ${LUXURY.softGray}`,
                          color: LUXURY.charcoal,
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        {(review.author_name ||
                          review.customer_name ||
                          "K")[0].toUpperCase()}
                      </Avatar>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: LUXURY.charcoal, fontWeight: 600 }}
                      >
                        {review.full_name ||
                          review.customer_name ||
                          "Khách hàng"}
                      </Typography>
                    </Stack>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Typography textAlign="center" color={LUXURY.warmGray}>
              Chưa có nhận xét nào.
            </Typography>
          )}
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 8, md: 10 },
          bgcolor: "#242424",
          color: LUXURY.white,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Fade in={pageMounted} timeout={800}>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  mb: 2,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  fontWeight: 700,
                }}
              >
                Sẵn Sàng Khám Phá?
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 4, color: "rgba(255,255,255,0.7)" }}
              >
                Bắt đầu hành trình của bạn đến Huế Hotel ngay hôm nay
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/rooms")}
                sx={{
                  bgcolor: LUXURY.gold,
                  color: LUXURY.charcoal,
                  fontWeight: 600,
                  py: 1.2,
                  px: 4,
                  borderRadius: "8px",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#B8962A", boxShadow: "none" },
                }}
              >
                ĐẶT PHÒNG NGAY
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ borderRadius: "8px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
