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
  Dialog,
  IconButton,
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
import AppsIcon from "@mui/icons-material/Apps";
import CloseIcon from "@mui/icons-material/Close";

import { AuthContext } from "../../context/AuthContext";
import RoomTypeService from "../../services/roomTypeService";

// Theme Colors
const COLORS = {
  primary: "#5e35b1",
  primaryLight: "#ede7f6",
  border: "#e0e0e0",
  textMain: "#333",
  textSecondary: "#666",
  bgLight: "#f8f9fa",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1920&q=100";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [reviews, setReviews] = useState([]);
  const { user } = useContext(AuthContext);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State quản lý việc mở Dialog xem toàn bộ ảnh
  const [openGallery, setOpenGallery] = useState(false);

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
          sx={{ mt: 3, color: COLORS.primary, borderColor: COLORS.primary }}
          onClick={() => navigate("/rooms")}
        >
          Quay lại danh sách phòng
        </Button>
      </Container>
    );
  }

  // ==========================================
  // 1. HÀM TỐI ƯU ẢNH CLOUDINARY (XÓA BỎ LỖI MỜ ẢNH)
  // ==========================================
  const optimizeImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE;
    // Chèn tham số w_1920, q_100 để ép Cloudinary xuất ảnh nét căng
    if (url.includes("cloudinary.com") && !url.includes("/upload/w_")) {
      return url.replace("/upload/", "/upload/w_1920,q_100,f_auto/");
    }
    return url;
  };

  // Cần ít nhất 5 ảnh để lấp đầy Lưới ảnh (Grid)
  const baseImages =
    room.images && room.images.length > 0
      ? room.images.map((img) => optimizeImageUrl(img.image_url))
      : [optimizeImageUrl(room.image_url)];

  const defaultFillers = [
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1920&q=100",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=100",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=100",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1920&q=100",
  ];

  // Trộn ảnh thực tế và ảnh dự phòng nếu phòng không đủ 5 ảnh
  const imagesList = [...baseImages, ...defaultFillers].slice(
    0,
    Math.max(5, baseImages.length),
  );

  // ==========================================
  // 2. TẠO THẺ CHIP ĐỘNG DỰA VÀO TÊN PHÒNG
  // ==========================================
  const getDynamicChips = (roomName = "") => {
    const chips = [];
    const nameLower = roomName.toLowerCase();

    if (nameLower.includes("suite") || nameLower.includes("vip")) {
      chips.push({ label: "SUITE CAO CẤP", color: COLORS.primary });
    } else if (nameLower.includes("deluxe") || nameLower.includes("premium")) {
      chips.push({ label: "PREMIUM", color: COLORS.primary });
    } else if (nameLower.includes("family") || nameLower.includes("gia đình")) {
      chips.push({ label: "GIA ĐÌNH", color: "#2e7d32" });
    } else {
      chips.push({ label: "TIÊU CHUẨN", color: "#1976d2" });
    }

    if (nameLower.includes("city") || nameLower.includes("thành phố")) {
      chips.push({ label: "🏙 Hướng Thành Phố", color: "rgba(0,0,0,0.6)" });
    } else if (nameLower.includes("river") || nameLower.includes("sông")) {
      chips.push({ label: "🏞 Hướng Sông Hương", color: "rgba(0,0,0,0.6)" });
    } else if (nameLower.includes("couple")) {
      chips.push({ label: "💕 Lãng Mạn", color: "rgba(0,0,0,0.6)" });
    }
    return chips;
  };

  const dynamicChips = getDynamicChips(room.type_name || room.name);

  // ==========================================
  // 3. TẠO LOẠI GIƯỜNG ĐỘNG
  // ==========================================
  const getBedInfo = (capacity) => {
    if (capacity >= 4) return "2 Giường Đôi cỡ lớn";
    if (capacity === 1) return "1 Giường Đơn";
    return "1 Giường King cỡ lớn";
  };

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

        {/* TIÊU ĐỀ PHÒNG */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h3"
            fontWeight="900"
            color={COLORS.textMain}
            sx={{ mb: 2, fontSize: { xs: "2rem", md: "2.5rem" } }}
          >
            {room.type_name || room.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            {dynamicChips.map((chip, index) => (
              <Chip
                key={index}
                label={chip.label}
                size="small"
                sx={{
                  bgcolor: chip.color,
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  borderRadius: "4px",
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* ============================================================== */}
        {/* LƯỚI ẢNH (IMAGE GRID) - PHONG CÁCH AIRBNB THAY CHO SWIPER */}
        {/* ============================================================== */}
        <Box sx={{ position: "relative", mb: 5 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 1.5,
              height: { xs: 280, md: 500 },
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {/* Ảnh To Nhất (Bên trái) */}
            <Box
              sx={{ overflow: "hidden", cursor: "pointer", height: "100%" }}
              onClick={() => setOpenGallery(true)}
            >
              <Box
                component="img"
                src={imagesList[0]}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              />
            </Box>

            {/* 4 Ảnh Nhỏ (Bên phải - Chỉ hiện trên PC) */}
            <Box
              sx={{
                display: { xs: "none", md: "grid" },
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: 1.5,
                height: "100%",
              }}
            >
              {imagesList.slice(1, 5).map((img, idx) => (
                <Box
                  key={idx}
                  sx={{ overflow: "hidden", cursor: "pointer", height: "100%" }}
                  onClick={() => setOpenGallery(true)}
                >
                  <Box
                    component="img"
                    src={img}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Nút mở Dialog Gallery */}
          <Button
            variant="contained"
            startIcon={<AppsIcon />}
            onClick={() => setOpenGallery(true)}
            sx={{
              position: "absolute",
              bottom: 24,
              right: 24,
              bgcolor: "white",
              color: "black",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            Hiển thị tất cả ảnh
          </Button>
        </Box>

        {/* DIALOG TOÀN MÀN HÌNH ĐỂ XEM ẢNH */}
        <Dialog
          fullScreen
          open={openGallery}
          onClose={() => setOpenGallery(false)}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              position: "sticky",
              top: 0,
              bgcolor: "white",
              zIndex: 10,
              borderBottom: "1px solid #eee",
            }}
          >
            <IconButton onClick={() => setOpenGallery(false)}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, fontWeight: "bold" }}>
              Thư viện ảnh của {room.type_name || room.name}
            </Typography>
          </Box>
          <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={4}>
              {imagesList.map((img, idx) => (
                <Box
                  component="img"
                  key={idx}
                  src={img}
                  sx={{
                    width: "100%",
                    borderRadius: "12px",
                    objectFit: "cover",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  }}
                />
              ))}
            </Stack>
          </Container>
        </Dialog>
        {/* KẾT THÚC LƯỚI ẢNH VÀ DIALOG */}

        <Row className="g-5">
          {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
          <Col lg={8}>
            {/* THỐNG KÊ NHANH CỦA PHÒNG */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "12px",
                border: `1px solid ${COLORS.border}`,
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                mb: 5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
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
                    {room.area || "25"} m²
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
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
                    Tối đa {room.capacity || 2} Khách
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
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
                    {getBedInfo(room.capacity)}
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
                  `Phòng ${room.type_name || room.name} mang đến cho bạn không gian lưu trú lý tưởng với đầy đủ các tiện ích tiêu chuẩn 5 sao. Thiết kế hài hòa giữa nét truyền thống và sự tiện nghi hiện đại sẽ giúp kỳ nghỉ của bạn trở nên trọn vẹn.`}
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
                  Tiện nghi nổi bật
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
                    label: "Wi-Fi tốc độ cao",
                    icon: <WifiIcon color="success" />,
                  },
                  {
                    label: "Smart TV giải trí",
                    icon: <TvIcon color="success" />,
                  },
                  {
                    label: "Ban công riêng biệt",
                    icon: <BalconyIcon color="success" />,
                  },
                  {
                    label: "Điều hòa 2 chiều",
                    icon: <AcUnitIcon color="success" />,
                  },
                  {
                    label: "Bàn làm việc",
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
                    ({reviews.length})
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
                        borderRadius: "12px",
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
                              Khách lưu trú •{" "}
                              {new Date(review.created_at).toLocaleDateString(
                                "vi-VN",
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
                    borderRadius: "12px",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  Chưa có đánh giá nào cho hạng phòng này.
                </Typography>
              )}
            </Box>
          </Col>

          {/* CỘT PHẢI: BOOKING CARD */}
          <Col lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: "12px",
                position: "sticky",
                top: 100,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
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
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
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
                    borderBottomLeftRadius: "8px",
                    borderBottomRightRadius: "8px",
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
                      Tối đa {room.capacity || 2} Người
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
                  borderRadius: "8px",
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
                Bạn sẽ không bị trừ tiền ngay lúc này
              </Typography>
            </Paper>
          </Col>
        </Row>
      </Container>
    </Box>
  );
};

export default RoomDetail;
