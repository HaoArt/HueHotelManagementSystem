import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  Avatar,
  Rating,
} from "@mui/material";

// Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import BedIcon from "@mui/icons-material/Bed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WifiIcon from "@mui/icons-material/Wifi";
import TvIcon from "@mui/icons-material/Tv";
import BalconyIcon from "@mui/icons-material/Balcony";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import CoffeeMakerIcon from "@mui/icons-material/CoffeeMaker";
import BathtubIcon from "@mui/icons-material/Bathtub";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Swiper (Hiệu ứng Slide ảnh)
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { AuthContext } from "../../context/AuthContext";
import RoomTypeService from "../../services/roomTypeService";

// Theme Colors theo thiết kế
const COLORS = {
  primary: "#5e35b1", // Tím đậm
  primaryLight: "#ede7f6", // Tím nhạt cho nền icon
  border: "#e0e0e0",
  textMain: "#333",
  textTitle:"#fff",
  textSecondary: "#666",
  bgLight: "#f8f9fa",
};

// Hình ảnh dự phòng độ phân giải cao (1920px) khi link ảnh bị lỗi
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1920&q=80";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [reviews, setReviews] = useState([]);
  const { user } = useContext(AuthContext);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        const data = await RoomTypeService.getRoomTypeById(id);
        setRoom(data.data || data);
        const reviewRes = await RoomTypeService.getReviewsByRoomTypeId(id);
        setReviews(reviewRes.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetail();
  }, [id]);

  const handleBooking = () => {
    if (!user) {
      alert("Vui lòng đăng nhập để thực hiện đặt phòng!");
      return navigate("/login", { state: { from: location } });
    }
    navigate("/booking", {
      state: {
        room: {
          id: room.id,
          type_name: room.type_name || room.name,
          base_price: room.base_price,
          area: room.area,
        },
      },
    });
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : 5.0;

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  if (error || !room) {
    return (
      <Container className="py-5 text-center">
        <Alert severity="error" sx={{ borderRadius: "4px" }}>
          {error || "Không tìm thấy thông tin phòng!"}
        </Alert>
        <Button
          variant="outlined"
          sx={{
            mt: 3,
            color: COLORS.primary,
            borderColor: COLORS.primary,
            borderRadius: "4px",
          }}
          onClick={() => navigate("/rooms")}
        >
          Quay lại danh sách phòng
        </Button>
      </Container>
    );
  }

  // Khởi tạo mảng hình ảnh cho Slider (Nâng cấp độ phân giải lên 1920px)
  const imagesList =
    room.images && room.images.length > 0
      ? room.images.map((img) => img.image_url)
      : [
          room.image_url || FALLBACK_IMAGE,
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1920&q=80",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80",
        ];

  return (
    <Box sx={{ bgcolor: COLORS.bgLight, minHeight: "100vh", pb: 10, pt: 4 }}>
      <Container maxWidth="lg">
        {/* BREADCRUMBS */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <MuiLink
            component={Link}
            to="/"
            underline="hover"
            color="inherit"
            fontSize="0.9rem"
          >
            Trang chủ
          </MuiLink>
          <MuiLink
            component={Link}
            to="/rooms"
            underline="hover"
            color="inherit"
            fontSize="0.9rem"
          >
            Phòng & Suite
          </MuiLink>
          <Typography color="text.primary" fontSize="0.9rem" fontWeight="500">
            {room.type_name || room.name}
          </Typography>
        </Breadcrumbs>

        {/* HERO IMAGE BANNER SỬ DỤNG SWIPER SLIDER */}
        <Box
          sx={{
            position: "relative",
            height: { xs: "300px", md: "450px" },
            borderRadius: "8px",
            overflow: "hidden",
            mb: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            bgcolor: "#000", // Nền đen đề phòng ảnh tải chậm
          }}
        >
          <Swiper
            modules={[Pagination, Autoplay, Navigation]}
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop={true}
            style={{ width: "100%", height: "100%" }}
          >
            {imagesList.map((url, idx) => (
              <SwiperSlide key={idx} style={{ width: "100%", height: "100%" }}>
                <Box
                  sx={{ width: "100%", height: "100%", position: "relative" }}
                >
                  {/* CẬP NHẬT: Dùng thẻ img để ảnh nét hơn và bắt lỗi vỡ ảnh */}
                  <img
                    src={url}
                    alt={`slide-${idx}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      // Nếu link ảnh bị lỗi 404 (vỡ ảnh), tự động thế bằng ảnh dự phòng
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                  {/* CẬP NHẬT: Lớp phủ Gradient đen trong suốt */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Khối Text nổi đè lên trên Slider */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              zIndex: 10,
              p: { xs: 3, md: 5 },
              pointerEvents: "none",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                label="PREMIUM"
                size="small"
                sx={{
                  bgcolor: COLORS.primary,
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.7rem",
                  borderRadius: "4px",
                }}
              />
              <Chip
                label="🏞 Hướng Sông Hương"
                size="small"
                sx={{
                  bgcolor: "rgba(0,0,0,0.5)",
                  color: "white",
                  fontSize: "0.75rem",
                  borderRadius: "4px",
                }}
              />
            </Stack>
            <Typography
              variant="h3"
              fontWeight="bold"
              color="white"
              sx={{ mb: 1, fontSize: { xs: "2rem", md: "3rem" },color:"white" }}
            >
              {room.type_name || room.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.9)",
                maxWidth: "600px",
                fontSize: "1.1rem",
              }}
            >
              Trải nghiệm không gian nghỉ dưỡng hoàng gia đương đại với tầm nhìn
              tuyệt mỹ ra dòng sông Hương thơ mộng.
            </Typography>
          </Box>
        </Box>

        <Row className="g-5">
          {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
          <Col lg={8}>
            {/* THỐNG KÊ NHANH CỦA PHÒNG */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "8px",
                border: `1px solid ${COLORS.border}`,
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                mb: 5,
              }}
            >
              {/* Diện tích */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "4px",
                    bgcolor: COLORS.primaryLight,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: COLORS.primary,
                  }}
                >
                  <AspectRatioIcon />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="bold"
                    display="block"
                  >
                    DIỆN TÍCH
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={COLORS.textMain}
                  >
                    {room.area || "45"} m²
                  </Typography>
                </Box>
              </Box>

              {/* Sức chứa */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "4px",
                    bgcolor: COLORS.primaryLight,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: COLORS.primary,
                  }}
                >
                  <PeopleAltIcon />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="bold"
                    display="block"
                  >
                    SỨC CHỨA
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={COLORS.textMain}
                  >
                    {room.capacity || 2} Người lớn, 1 Trẻ em
                  </Typography>
                </Box>
              </Box>

              {/* Loại giường */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "4px",
                    bgcolor: COLORS.primaryLight,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: COLORS.primary,
                  }}
                >
                  <BedIcon />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="bold"
                    display="block"
                  >
                    LOẠI GIƯỜNG
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={COLORS.textMain}
                  >
                    1 Giường King cỡ lớn
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* TỔNG QUAN */}
            <Box sx={{ mb: 5 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={COLORS.primary}
                >
                  Tổng quan
                </Typography>
                <Box
                  sx={{
                    ml: 2,
                    height: "1px",
                    flex: 1,
                    bgcolor: COLORS.border,
                    maxWidth: "120px",
                  }}
                />
              </Box>

              <Typography
                variant="body1"
                color={COLORS.textSecondary}
                paragraph
                sx={{ lineHeight: 1.8 }}
              >
                {room.description ||
                  "Phòng Premium Deluxe Hướng Sông là sự kết hợp tinh tế giữa nét đẹp văn hóa cung đình Huế và thiết kế nội thất hiện đại tối giản. Với cửa sổ kính sát trần, du khách có thể chiêm ngưỡng trọn vẹn vẻ đẹp lãng mạn của sông Hương từ lúc bình minh sương mù giăng lối đến khi hoàng hôn rực rỡ buông xuống."}
              </Typography>
              <Typography
                variant="body1"
                color={COLORS.textSecondary}
                paragraph
                sx={{ lineHeight: 1.8 }}
              >
                Nội thất được làm từ gỗ tự nhiên cao cấp, kết hợp với các điểm
                nhấn màu tím hoàng gia (Imperial Purple) trên nền trắng tinh
                khôi, tạo nên một không gian nghỉ ngơi sang trọng nhưng vẫn vô
                cùng ấm cúng và gần gũi. Phòng tắm không gian mở với bồn tắm nằm
                đá cẩm thạch và vòi sen đứng mang lại trải nghiệm thư giãn tuyệt
                đối.
              </Typography>
            </Box>

            {/* TIỆN NGHI PHÒNG */}
            <Box sx={{ mb: 5 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={COLORS.primary}
                >
                  Tiện nghi phòng
                </Typography>
                <Box
                  sx={{
                    ml: 2,
                    height: "1px",
                    flex: 1,
                    bgcolor: COLORS.border,
                    maxWidth: "80px",
                  }}
                />
              </Box>

              <Row className="g-4">
                {[
                  {
                    label: "Wi-Fi tốc độ cao miễn phí",
                    icon: <WifiIcon color="success" />,
                  },
                  {
                    label: "Smart TV 55 inch",
                    icon: <TvIcon color="success" />,
                  },
                  {
                    label: "Ban công riêng",
                    icon: <BalconyIcon color="success" />,
                  },
                  {
                    label: "Điều hòa trung tâm",
                    icon: <AcUnitIcon color="success" />,
                  },
                  {
                    label: "Máy pha cà phê Espresso",
                    icon: <CoffeeMakerIcon color="success" />,
                  },
                  {
                    label: "Bồn tắm & vòi sen",
                    icon: <BathtubIcon color="success" />,
                  },
                ].map((item, index) => (
                  <Col md={4} xs={6} key={index}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      {item.icon}
                      <Typography
                        variant="body2"
                        fontWeight="500"
                        color={COLORS.textMain}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  </Col>
                ))}
              </Row>
            </Box>

            {/* ĐÁNH GIÁ TỪ KHÁCH HÀNG */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={COLORS.primary}
                >
                  Đánh giá từ khách hàng
                </Typography>
                <Box
                  sx={{
                    ml: 2,
                    height: "1px",
                    flex: 1,
                    bgcolor: COLORS.border,
                    maxWidth: "60px",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    ml: "auto",
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    {averageRating}
                  </Typography>
                  <Rating
                    value={Number(averageRating)}
                    readOnly
                    precision={0.1}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({reviews.length} đánh giá)
                  </Typography>
                </Box>
              </Box>

              {reviews.length > 0 ? (
                <Stack spacing={3}>
                  {reviews.map((review) => (
                    <Paper
                      key={review.id}
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: "8px",
                        border: `1px solid ${COLORS.border}`,
                        bgcolor: "white",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ mb: 2, justifyContent: "space-between" }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: COLORS.primaryLight,
                              color: COLORS.primary,
                              width: 48,
                              height: 48,
                              borderRadius: "8px",
                            }}
                          >
                            {review.full_name?.substring(0, 2).toUpperCase() ||
                              "KH"}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold", fontSize: "0.95rem" }}
                            >
                              {review.full_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Kỳ nghỉ gia đình •{" "}
                              {new Date(review.created_at).toLocaleDateString(
                                "vi-VN",
                                { month: "long", year: "numeric" },
                              )}
                            </Typography>
                          </Box>
                        </Box>
                        <Rating value={review.rating} readOnly size="small" />
                      </Stack>
                      <Typography
                        variant="body2"
                        color={COLORS.textSecondary}
                        sx={{ fontStyle: "italic", lineHeight: 1.6 }}
                      >
                        "{review.comment}"
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontStyle: "italic",
                    textAlign: "center",
                    py: 4,
                    bgcolor: "white",
                    borderRadius: "8px",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  Chưa có đánh giá nào cho hạng phòng này.
                </Typography>
              )}
            </Box>
          </Col>

          {/* CỘT PHẢI: BOOKING CARD (Sticky) */}
          <Col lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: "8px",
                position: "sticky",
                top: 100,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "none",
                bgcolor: "white",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
                letterSpacing={1}
              >
                GIÁ TỪ
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}
              >
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color={COLORS.primary}
                >
                  {Number(room.base_price)?.toLocaleString("vi-VN")}đ
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  / đêm
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography
                  variant="body2"
                  color="success.main"
                  fontWeight="500"
                >
                  Đã bao gồm thuế & phí
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Stack
                  direction="row"
                  sx={{
                    border: `1px solid ${COLORS.border}`,
                    borderTopLeftRadius: "4px",
                    borderTopRightRadius: "4px",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      flex: 1,
                      borderRight: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      display="block"
                    >
                      NHẬN PHÒNG
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chọn ngày đến
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, flex: 1 }}>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      display="block"
                    >
                      TRẢ PHÒNG
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chọn ngày đi
                    </Typography>
                  </Box>
                </Stack>
                <Box
                  sx={{
                    p: 2,
                    border: `1px solid ${COLORS.border}`,
                    borderTop: "none",
                    borderBottomLeftRadius: "4px",
                    borderBottomRightRadius: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      display="block"
                    >
                      KHÁCH
                    </Typography>
                    <Typography variant="body2">
                      {room.capacity || 2} Người lớn, 0 Trẻ em
                    </Typography>
                  </Box>
                  <KeyboardArrowDownIcon color="action" />
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={handleBooking}
                disableElevation
                sx={{
                  py: 1.5,
                  bgcolor: COLORS.primary,
                  fontWeight: "bold",
                  fontSize: "1rem",
                  borderRadius: "4px",
                  textTransform: "none",
                  mb: 2,
                  "&:hover": { bgcolor: "#4527a0" },
                }}
              >
                ĐẶT PHÒNG NGAY
              </Button>

              <Typography
                variant="caption"
                display="block"
                textAlign="center"
                color="text.secondary"
              >
                Bạn sẽ không bị trừ tiền ngay bây giờ
              </Typography>
            </Paper>
          </Col>
        </Row>
      </Container>
    </Box>
  );
};

export default RoomDetail;
