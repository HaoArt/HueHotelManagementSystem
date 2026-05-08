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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/specific/SearchBar";
import RoomCard from "../../components/specific/RoomCard";

// Icons
import PoolIcon from "@mui/icons-material/Pool";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SpaIcon from "@mui/icons-material/Spa";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// Swiper (for review slider)
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import couponService from "../../services/couponService";
import RoomTypeService from "../../services/roomTypeService";
import reviewService from "../../services/reviewService";

// Theme Colors
const COLORS = {
  primary: "#5e35b1",
  primaryDark: "#4527a0",
  badgeGreen: "#00796b",
  textMain: "#333333",
  textSecondary: "#666666",
  bgLight: "#f8f9fa",
  border: "#e0e0e0",
  gold: "#fbc02d",
};

const facilities = [
  {
    title: "Hồ bơi",
    desc: "Hồ bơi ngoài trời trên sân thượng với view hoàng hôn cực đẹp",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
    icon: <PoolIcon />,
  },
  {
    title: "Nhà hàng & Bar",
    desc: "Thưởng thức ẩm thực địa phương và quốc tế trong không gian sang trọng",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    icon: <RestaurantIcon />,
  },
  {
    title: "Spa & Thư giãn",
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
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
    title: "Sảnh khách sạn",
  },
  {
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600",
    title: "Khu vườn thư giãn",
  },
  {
    img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600",
    title: "Nhà hàng sang trọng",
  },
  {
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600",
    title: "Hồ bơi riêng",
  },
];

const twoLineClampSx = {
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
};

const threeLineClampSx = {
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
};

const Home = () => {
  const navigate = useNavigate();
  const [topRooms, setTopRooms] = useState([]);
  const [topReviews, setTopReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSearch = (searchData) => {
    navigate("/rooms", { state: { initialSearchData: searchData } });
  };

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
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
        setSnackbar({
          open: true,
          message: "Không thể tải dữ liệu trang chủ.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-light pb-5">
      {/* 1. HERO SECTION */}
      <Box
        sx={{
          height: { xs: "55vh", md: "65vh" },
          backgroundImage: `linear-gradient(to bottom, rgba(74, 20, 140, 0.47), rgba(49, 27, 146, 0.18)),url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
          pb: 12, // Tăng khoảng trống bên dưới để hiển thị giờ giấc cân đối
        }}
      >
        <Container>
          <Typography
            variant="h2"
            component="h1"
            fontWeight="900"
            letterSpacing={3}
            gutterBottom
            sx={{
              textTransform: "uppercase",
              fontSize: { xs: "2.8rem", md: "4rem" },
              textShadow: "2px 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            HUẾ HOTEL
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              mb: 4,
              maxWidth: "600px",
              mx: "auto",
              fontWeight: 500,
              opacity: 0.95,
              fontStyle: "italic",
            }}
          >
            Nơi di sản hội tụ cùng đẳng cấp nghỉ dưỡng
          </Typography>

          {/* THÔNG TIN GIỜ CHECK-IN/OUT (Dạng Glassmorphism tinh tế) */}
          <Stack
            direction="row"
            spacing={4}
            justifyContent="center"
            alignItems="center"
            sx={{
              mt: 2,
              backdropFilter: "blur(10px)", // Hiệu ứng làm mờ nền ảnh
              bgcolor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "50px",
              py: 1.5,
              px: { xs: 3, md: 6 },
              width: "fit-content",
              mx: "auto",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <AccessTimeIcon sx={{ fontSize: 22, color: COLORS.gold }} />
              <Box textAlign="left">
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    opacity: 0.8,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Check-in
                </Typography>
                <Typography variant="body1" fontWeight="800">
                  14:00 PM
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                width: "1px",
                height: "30px",
                bgcolor: "rgba(255, 255, 255, 0.3)",
              }}
            />

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <AccessTimeIcon sx={{ fontSize: 22, color: COLORS.gold }} />
              <Box textAlign="left">
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    opacity: 0.8,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Check-out
                </Typography>
                <Typography variant="body1" fontWeight="800">
                  12:00 PM
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* 2. THANH TÌM KIẾM */}
      <Box sx={{ mt: -5, position: "relative", zIndex: 10 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              p: 1.5,
              bgcolor: "white",
              borderRadius: "16px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <SearchBar onSearch={handleSearch} />
          </Box>
        </Container>
      </Box>

      {/* 3. ƯU ĐÃI ĐẶC BIỆT */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: COLORS.bgLight }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h4" fontWeight="bold" color={COLORS.primary}>
              Ưu đãi đặc biệt
            </Typography>
            <Typography color="text.secondary" mt={1}>
              Cơ hội có 1-0-2 để trải nghiệm dịch vụ đẳng cấp với giá ưu đãi
            </Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress sx={{ color: COLORS.primary }} />
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
                gap: 4,
              }}
            >
              {coupons.map((item, index) => (
                <Card
                  key={item.id || index}
                  elevation={0}
                  sx={{
                    borderRadius: "12px",
                    position: "relative",
                    border: `1px solid ${COLORS.border}`,
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "white",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 24px rgba(94, 53, 177, 0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: COLORS.badgeGreen,
                      color: "#fff",
                      px: 2,
                      py: 0.8,
                      borderBottomLeftRadius: 12,
                      fontSize: 13,
                      fontWeight: "bold",
                    }}
                  >
                    {item.discount_type === "PERCENTAGE"
                      ? `Giảm ${parseFloat(item.discount_value)}%`
                      : `Giảm ${Number(item.discount_value).toLocaleString("vi-VN")}đ`}
                  </Box>

                  <CardContent
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <LocalOfferIcon
                      sx={{ fontSize: 32, color: COLORS.badgeGreen, mb: 2 }}
                    />

                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={COLORS.textMain}
                      sx={{ mb: 1 }}
                    >
                      Mã: {item.code}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{ mb: 2, ...threeLineClampSx, minHeight: 60 }}
                    >
                      {item.description ||
                        "Ưu đãi dành riêng cho thành viên khách sạn Huế Hotel. Áp dụng cho mọi loại phòng."}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{ fontSize: 12, fontStyle: "italic", mb: 3 }}
                    >
                      HSD:{" "}
                      {item.end_date
                        ? new Date(item.end_date).toLocaleDateString("vi-VN")
                        : "Không thời hạn"}
                    </Typography>

                    <Box sx={{ mt: "auto" }}>
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
                          borderRadius: "6px",
                          fontWeight: "bold",
                          textTransform: "none",
                          bgcolor: COLORS.primary,
                          "&:hover": { bgcolor: COLORS.primaryDark },
                        }}
                      >
                        Lưu mã ({item.code})
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography textAlign="center" color="text.secondary">
              Hiện tại không có chương trình khuyến mãi nào.
            </Typography>
          )}
        </Container>
      </Box>

      {/* 4. PHÒNG & SUITE NỔI BẬT */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h4" fontWeight="bold" color={COLORS.primary}>
              Phòng & Suite Nổi Bật
            </Typography>
            <Typography color="text.secondary" mt={1}>
              Top 3 không gian được yêu thích nhất
            </Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress sx={{ color: COLORS.primary }} />
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
                gap: 4,
              }}
            >
              {topRooms && topRooms.length > 0
                ? topRooms
                    .slice(0, 3)
                    .map((room) => <RoomCard key={room.id} room={room} />)
                : !loading && (
                    <Typography
                      sx={{ gridColumn: "1 / -1", textAlign: "center" }}
                    >
                      Không tìm thấy phòng nổi bật.
                    </Typography>
                  )}
            </Box>
          )}
        </Container>
      </Box>

      {/* 5. TIỆN NGHI ĐẲNG CẤP */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: COLORS.bgLight }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h4" fontWeight="bold" color={COLORS.primary}>
              Tiện nghi đẳng cấp
            </Typography>
            <Typography color="text.secondary" mt={1}>
              Tất cả những gì bạn cần cho kỳ nghỉ hoàn hảo
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {facilities.map((item, index) => (
              <Card
                key={index}
                elevation={0}
                sx={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  position: "relative",
                  height: 320,
                  "&:hover img": { transform: "scale(1.05)" },
                }}
              >
                <Box
                  component="img"
                  src={item.img}
                  alt={item.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    p: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="white"
                    sx={{ mb: 1 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="rgba(255,255,255,0.8)"
                    sx={{ ...twoLineClampSx }}
                  >
                    {item.desc}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  }}
                >
                  {React.cloneElement(item.icon, { fontSize: "small" })}
                </Box>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 6. THƯ VIỆN ẢNH */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h4" fontWeight="bold" color={COLORS.primary}>
              Thư viện ảnh khách sạn
            </Typography>
            <Typography color="text.secondary" mt={1}>
              Khám phá không gian và tiện nghi của chúng tôi
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {gallery.map((item, index) => (
              <Box
                key={index}
                sx={{
                  width: "100%",
                  height: 240,
                  borderRadius: "12px",
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <Box
                  component="img"
                  src={item.img}
                  alt={item.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "0.4s",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                    opacity: 1,
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#fff",
                      p: 2,
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 7. KHÁCH HÀNG NÓI GÌ */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: COLORS.bgLight }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight="bold"
            color={COLORS.primary}
            mb={6}
          >
            Khách Hàng Nói Gì
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress sx={{ color: COLORS.primary }} />
            </Box>
          ) : (
            <Box sx={{ maxWidth: "1000px", mx: "auto" }}>
              {topReviews.length > 0 ? (
                <Swiper
                  modules={[EffectCoverflow, Pagination, Autoplay]}
                  effect="coverflow"
                  grabCursor={true}
                  centeredSlides={true}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 1.2 },
                    900: { slidesPerView: 2 },
                    1200: { slidesPerView: 3 },
                  }}
                  loop={topReviews.length > 3}
                  autoplay={{ delay: 4000, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                >
                  {topReviews.map((item, index) => (
                    <SwiperSlide
                      key={item.id || index}
                      style={{
                        height: "auto",
                        display: "flex",
                        paddingBottom: "40px",
                      }}
                    >
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: "16px",
                          border: `1px solid ${COLORS.border}`,
                          height: "100%",
                          width: "100%",
                          textAlign: "center",
                          p: 4,
                          bgcolor: "white",
                        }}
                      >
                        <CardContent
                          sx={{
                            p: 0,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <FormatQuoteIcon
                            sx={{ fontSize: 40, color: COLORS.gold, mb: 1 }}
                          />

                          <Box my={1} display="flex" justifyContent="center">
                            <Rating
                              value={Number(item.rating) || 5}
                              readOnly
                              size="small"
                              precision={0.5}
                              sx={{ color: COLORS.gold }}
                            />
                          </Box>

                          <Typography
                            variant="body2"
                            sx={{
                              ...threeLineClampSx,
                              minHeight: 60,
                              fontStyle: "italic",
                              color: COLORS.textSecondary,
                              mb: 3,
                            }}
                          >
                            "{item.comment}"
                          </Typography>

                          <Typography
                            fontWeight="bold"
                            color={COLORS.primary}
                            sx={{ mt: "auto", fontSize: "1rem" }}
                          >
                            {item.customer_name || item.full_name}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {new Date(item.created_at).toLocaleDateString(
                              "vi-VN",
                            )}
                          </Typography>
                        </CardContent>
                      </Card>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <Typography textAlign="center" color="text.secondary">
                  Chưa có đánh giá nào.
                </Typography>
              )}
            </Box>
          )}
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Home;
