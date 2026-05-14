import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
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
  Fade,
  Slide,
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
import StarIcon from "@mui/icons-material/Star";

import { AuthContext } from "../../context/AuthContext";
import RoomTypeService from "../../services/roomTypeService";

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
          minHeight: "80vh",
          bgcolor: LUXURY.white,
        }}
      >
        <CircularProgress sx={{ color: LUXURY.gold }} />
      </Box>
    );
  }

  if (error || !room) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <Alert severity="error" sx={{ borderRadius: "12px", mb: 3 }}>
          {error || "Không tìm thấy thông tin phòng!"}
        </Alert>
        <Button
          variant="outlined"
          sx={{ color: LUXURY.navy, borderColor: LUXURY.navy }}
          onClick={() => navigate("/rooms")}
        >
          Quay lại danh sách phòng
        </Button>
      </Box>
    );
  }

  // TỐI ƯU ẢNH CLOUDINARY
  const optimizeImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE;
    if (url.includes("cloudinary.com") && !url.includes("/upload/w_")) {
      return url.replace("/upload/", "/upload/w_1920,q_100,f_auto/");
    }
    return url;
  };

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

  const imagesList = [...baseImages, ...defaultFillers].slice(
    0,
    Math.max(5, baseImages.length),
  );

  // TẠO THẺ CHIP ĐỘNG
  const getDynamicChips = (roomName = "") => {
    const chips = [];
    const nameLower = roomName.toLowerCase();

    if (nameLower.includes("suite") || nameLower.includes("vip")) {
      chips.push({ label: "SUITE CAO CẤP", color: LUXURY.navy });
    } else if (nameLower.includes("deluxe") || nameLower.includes("premium")) {
      chips.push({ label: "PREMIUM", color: LUXURY.navy });
    } else if (nameLower.includes("family") || nameLower.includes("gia đình")) {
      chips.push({ label: "GIA ĐÌNH", color: "#2e7d32" });
    } else {
      chips.push({ label: "TIÊU CHUẨN", color: LUXURY.warmGray });
    }

    if (nameLower.includes("city") || nameLower.includes("thành phố")) {
      chips.push({ label: "🏙 Hướng Thành Phố", color: LUXURY.charcoal });
    } else if (nameLower.includes("river") || nameLower.includes("sông")) {
      chips.push({ label: "🏞 Hướng Sông Hương", color: LUXURY.charcoal });
    } else if (nameLower.includes("couple")) {
      chips.push({ label: "💕 Lãng Mạn", color: "#be185d" });
    }
    return chips;
  };

  const dynamicChips = getDynamicChips(room.type_name || room.name);

  const getBedInfo = (capacity) => {
    if (capacity >= 4) return "2 Giường Đôi cỡ lớn";
    if (capacity === 1) return "1 Giường Đơn";
    return "1 Giường King cỡ lớn";
  };

  return (
    <Box
      sx={{
        bgcolor: LUXURY.white,
        minHeight: "100vh",
        pb: { xs: 8, md: 12 },
        pt: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
        <Fade in={true} timeout={600}>
          <Box>
            {/* BREADCRUMBS */}
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{
                mb: 4,
                "& .MuiBreadcrumbs-separator": { color: LUXURY.gold },
              }}
            >
              <MuiLink
                component={Link}
                to="/"
                underline="hover"
                color={LUXURY.warmGray}
                fontSize="0.85rem"
                fontWeight="600"
                letterSpacing="1px"
                textTransform="uppercase"
              >
                Trang chủ
              </MuiLink>
              <MuiLink
                component={Link}
                to="/rooms"
                underline="hover"
                color={LUXURY.warmGray}
                fontSize="0.85rem"
                fontWeight="600"
                letterSpacing="1px"
                textTransform="uppercase"
              >
                Phòng & Suite
              </MuiLink>
              <Typography
                color={LUXURY.charcoal}
                fontSize="0.85rem"
                fontWeight="700"
                letterSpacing="1px"
                textTransform="uppercase"
              >
                {room.type_name || room.name}
              </Typography>
            </Breadcrumbs>

            {/* HEADER PHÒNG */}
            <Box
              sx={{
                mb: 4,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { md: "flex-end" },
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h2"
                  fontWeight="900"
                  color={LUXURY.charcoal}
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    mb: 2,
                    fontSize: { xs: "2.2rem", md: "3.5rem" },
                    letterSpacing: "-0.02em",
                  }}
                >
                  {room.type_name || room.name}
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  {dynamicChips.map((chip, index) => (
                    <Chip
                      key={index}
                      label={chip.label}
                      size="small"
                      sx={{
                        bgcolor: chip.color,
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: "8px",
                        px: 1,
                        letterSpacing: "0.5px",
                      }}
                    />
                  ))}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      ml: { xs: 0, md: 2 },
                      color: LUXURY.charcoal,
                    }}
                  >
                    <StarIcon sx={{ color: LUXURY.gold, fontSize: 18 }} />
                    <Typography variant="body2" fontWeight="700">
                      {averageRating}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={LUXURY.warmGray}
                      sx={{ textDecoration: "underline", cursor: "pointer" }}
                    >
                      ({reviews.length} đánh giá)
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* ============================================================== */}
            {/* LƯỚI ẢNH (MASONRY GALLERY) - CHUẨN AIRBNB LUXE */}
            {/* ============================================================== */}
            <Box sx={{ position: "relative", mb: { xs: 6, md: 8 } }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" },
                  gridTemplateRows: { md: "1fr 1fr" },
                  gap: 2,
                  height: { xs: 300, md: 560 },
                  borderRadius: "24px",
                  overflow: "hidden",
                }}
              >
                {/* Ảnh lớn bên trái */}
                <Box
                  onClick={() => setOpenGallery(true)}
                  sx={{
                    gridColumn: { md: "1 / 2" },
                    gridRow: { md: "1 / 3" },
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <Box
                    component="img"
                    src={imagesList[0]}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition:
                        "transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(0,0,0,0.03)",
                      transition: "0.3s",
                      "&:hover": { bgcolor: "rgba(0,0,0,0)" },
                    }}
                  />
                </Box>

                {/* 4 Ảnh nhỏ bên phải */}
                {imagesList.slice(1, 5).map((img, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setOpenGallery(true)}
                    sx={{
                      display: { xs: "none", md: "block" },
                      overflow: "hidden",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition:
                          "transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)",
                        "&:hover": { transform: "scale(1.05)" },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: "rgba(0,0,0,0.03)",
                        transition: "0.3s",
                        "&:hover": { bgcolor: "rgba(0,0,0,0)" },
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <Button
                variant="contained"
                startIcon={<AppsIcon />}
                onClick={() => setOpenGallery(true)}
                sx={{
                  position: "absolute",
                  bottom: 24,
                  right: 24,
                  bgcolor: LUXURY.white,
                  color: LUXURY.charcoal,
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "12px",
                  px: 3,
                  py: 1,
                  boxShadow: "0 8px 24px rgba(26,26,26,0.12)",
                  "&:hover": {
                    bgcolor: LUXURY.offwhite,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Hiển thị tất cả ảnh
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* ============================================================== */}
        {/* MAIN CONTENT VỚI FLEXBOX (RESPONSIVE CHUẨN) */}
        {/* ============================================================== */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" }, // Mobile dọc, Tablet/PC ngang
            gap: { xs: 4, lg: 8 },
            alignItems: "flex-start", // Rất quan trọng để thẻ bên phải có thể trôi (sticky) được
          }}
        >
          {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
          <Slide direction="up" in={true} timeout={800}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* THỐNG KÊ NHANH */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: { xs: 3, md: 6 },
                  mb: 6,
                  pb: 4,
                  borderBottom: `1px solid ${LUXURY.softGray}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <AspectRatioIcon sx={{ fontSize: 32, color: LUXURY.gold }} />
                  <Box>
                    <Typography
                      variant="body2"
                      color={LUXURY.warmGray}
                      fontWeight="600"
                    >
                      DIỆN TÍCH
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="800"
                      color={LUXURY.charcoal}
                    >
                      {room.area || "25"} m²
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <PeopleAltIcon sx={{ fontSize: 32, color: LUXURY.gold }} />
                  <Box>
                    <Typography
                      variant="body2"
                      color={LUXURY.warmGray}
                      fontWeight="600"
                    >
                      SỨC CHỨA
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="800"
                      color={LUXURY.charcoal}
                    >
                      Tối đa {room.capacity || 2} Khách
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <BedIcon sx={{ fontSize: 32, color: LUXURY.gold }} />
                  <Box>
                    <Typography
                      variant="body2"
                      color={LUXURY.warmGray}
                      fontWeight="600"
                    >
                      LOẠI GIƯỜNG
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="800"
                      color={LUXURY.charcoal}
                    >
                      {getBedInfo(room.capacity)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* TỔNG QUAN */}
              <Box sx={{ mb: 6 }}>
                <Typography
                  variant="h4"
                  fontWeight="800"
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    mb: 3,
                    color: LUXURY.navy,
                  }}
                >
                  Không Gian Của Bạn
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: LUXURY.charcoal,
                    lineHeight: 1.9,
                    fontSize: "1.05rem",
                    opacity: 0.85,
                  }}
                >
                  {room.description ||
                    `Phòng ${room.type_name || room.name} mang đến cho bạn không gian lưu trú lý tưởng với đầy đủ các tiện ích tiêu chuẩn 5 sao. Thiết kế hài hòa giữa nét truyền thống kiến trúc cung đình Huế và sự tiện nghi hiện đại phương Tây sẽ giúp kỳ nghỉ của bạn trở nên hoàn hảo.`}
                </Typography>
              </Box>

              {/* TIỆN NGHI */}
              <Box sx={{ mb: 8 }}>
                <Typography
                  variant="h4"
                  fontWeight="800"
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    mb: 4,
                    color: LUXURY.navy,
                  }}
                >
                  Tiện Nghi Cao Cấp
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr 1fr",
                      sm: "repeat(3, 1fr)",
                    },
                    gap: 3,
                  }}
                >
                  {[
                    { label: "Wi-Fi tốc độ cao", icon: <WifiIcon /> },
                    { label: "Smart TV giải trí", icon: <TvIcon /> },
                    { label: "Ban công góc rộng", icon: <BalconyIcon /> },
                    { label: "Điều hòa độc lập", icon: <AcUnitIcon /> },
                    { label: "Máy pha Espresso", icon: <CoffeeMakerIcon /> },
                    { label: "Bồn tắm & vòi sen", icon: <BathtubIcon /> },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      <Box sx={{ color: LUXURY.gold }}>{item.icon}</Box>
                      <Typography
                        variant="body1"
                        fontWeight="500"
                        color={LUXURY.charcoal}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* ĐÁNH GIÁ */}
              <Box sx={{ pt: 6, borderTop: `1px solid ${LUXURY.softGray}` }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}
                >
                  <StarIcon sx={{ fontSize: 36, color: LUXURY.gold }} />
                  <Typography
                    variant="h3"
                    fontWeight="900"
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      color: LUXURY.charcoal,
                    }}
                  >
                    {averageRating}
                  </Typography>
                  <Typography
                    variant="h6"
                    color={LUXURY.warmGray}
                    sx={{ mt: 1 }}
                  >
                    · {reviews.length} Đánh giá
                  </Typography>
                </Box>

                {reviews.length > 0 ? (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 4,
                    }}
                  >
                    {reviews.map((review) => (
                      <Box
                        key={review.id}
                        sx={{
                          p: 3,
                          borderRadius: "16px",
                          bgcolor: LUXURY.offwhite,
                          height: "100%",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{ mb: 2 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: LUXURY.navy,
                              color: LUXURY.gold,
                              width: 48,
                              height: 48,
                              fontWeight: "bold",
                            }}
                          >
                            {review.full_name?.substring(0, 2).toUpperCase() ||
                              "KH"}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="subtitle1"
                              fontWeight="700"
                              color={LUXURY.charcoal}
                            >
                              {review.full_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={LUXURY.warmGray}
                            >
                              {new Date(review.created_at).toLocaleDateString(
                                "vi-VN",
                              )}
                            </Typography>
                          </Box>
                        </Stack>
                        <Rating
                          value={review.rating}
                          readOnly
                          size="small"
                          sx={{
                            mb: 2,
                            "& .MuiRating-iconFilled": { color: LUXURY.gold },
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: LUXURY.charcoal,
                            fontStyle: "italic",
                            lineHeight: 1.7,
                            opacity: 0.8,
                          }}
                        >
                          "{review.comment}"
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography
                    variant="body1"
                    color={LUXURY.warmGray}
                    sx={{ fontStyle: "italic" }}
                  >
                    Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm!
                  </Typography>
                )}
              </Box>
            </Box>
          </Slide>

          {/* CỘT PHẢI: FLOATING BOOKING CARD */}
          <Slide direction="up" in={true} timeout={1000}>
            <Box
              sx={{
                width: { xs: "100%", md: "360px", lg: "420px" }, // Giữ chiều rộng cố định trên PC
                flexShrink: 0,
                position: { md: "sticky" }, // Trôi lơ lửng khi cuộn
                top: 100,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: "24px",
                  border: `1px solid ${LUXURY.softGray}`,
                  boxShadow: "0 24px 48px rgba(26,26,26,0.08)",
                  bgcolor: LUXURY.white,
                }}
              >
                <Typography
                  variant="caption"
                  color={LUXURY.warmGray}
                  fontWeight="700"
                  letterSpacing={1}
                >
                  GIÁ CHỈ TỪ
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 1,
                    mb: 1,
                    mt: 0.5,
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight="900"
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      color: LUXURY.charcoal,
                    }}
                  >
                    {Number(room.base_price)?.toLocaleString("vi-VN")}đ
                  </Typography>
                  <Typography variant="body1" color={LUXURY.warmGray}>
                    / đêm
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 4,
                    color: LUXURY.warmGray,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                  <Typography variant="body2" fontWeight="500">
                    Đã bao gồm thuế & phí phục vụ
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mb: 4,
                    borderRadius: "12px",
                    border: `1px solid ${LUXURY.softGray}`,
                    overflow: "hidden",
                  }}
                >
                  <Stack
                    direction="row"
                    sx={{ borderBottom: `1px solid ${LUXURY.softGray}` }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        flex: 1,
                        borderRight: `1px solid ${LUXURY.softGray}`,
                        cursor: "pointer",
                        "&:hover": { bgcolor: LUXURY.offwhite },
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight="800"
                        display="block"
                        color={LUXURY.charcoal}
                      >
                        NHẬN PHÒNG
                      </Typography>
                      <Typography
                        variant="body2"
                        color={LUXURY.warmGray}
                        mt={0.5}
                      >
                        Chọn ngày đến
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        flex: 1,
                        cursor: "pointer",
                        "&:hover": { bgcolor: LUXURY.offwhite },
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight="800"
                        display="block"
                        color={LUXURY.charcoal}
                      >
                        TRẢ PHÒNG
                      </Typography>
                      <Typography
                        variant="body2"
                        color={LUXURY.warmGray}
                        mt={0.5}
                      >
                        Chọn ngày đi
                      </Typography>
                    </Box>
                  </Stack>
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      "&:hover": { bgcolor: LUXURY.offwhite },
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        fontWeight="800"
                        display="block"
                        color={LUXURY.charcoal}
                      >
                        KHÁCH
                      </Typography>
                      <Typography
                        variant="body2"
                        color={LUXURY.charcoal}
                        mt={0.5}
                      >
                        Tối đa {room.capacity || 2} Người
                      </Typography>
                    </Box>
                    <KeyboardArrowDownIcon sx={{ color: LUXURY.charcoal }} />
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleBooking}
                  sx={{
                    py: 2,
                    background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                    color: LUXURY.white,
                    fontWeight: "800",
                    fontSize: "1.05rem",
                    borderRadius: "12px",
                    textTransform: "none",
                    letterSpacing: "0.5px",
                    mb: 2,
                    boxShadow: `0 12px 24px ${LUXURY.gold}40`,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 16px 32px ${LUXURY.gold}60`,
                    },
                  }}
                >
                  ĐẶT PHÒNG NGAY
                </Button>
                <Typography
                  variant="caption"
                  display="block"
                  textAlign="center"
                  color={LUXURY.warmGray}
                >
                  Bạn sẽ không bị trừ tiền cho đến khi nhận phòng.
                </Typography>
              </Paper>
            </Box>
          </Slide>
        </Box>
      </Box>

      {/* DIALOG XEM TOÀN BỘ ẢNH */}
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
            bgcolor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            zIndex: 10,
            borderBottom: `1px solid ${LUXURY.softGray}`,
          }}
        >
          <IconButton
            onClick={() => setOpenGallery(false)}
            sx={{ bgcolor: LUXURY.offwhite }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              ml: 2,
              fontWeight: "800",
              fontFamily: '"Playfair Display", serif',
            }}
          >
            {room.type_name || room.name}
          </Typography>
        </Box>
        <Box sx={{ py: 6, bgcolor: LUXURY.offwhite, minHeight: "100vh" }}>
          <Box sx={{ maxWidth: 800, mx: "auto", px: 2 }}>
            <Stack spacing={4}>
              {imagesList.map((img, idx) => (
                <Box
                  component="img"
                  key={idx}
                  src={img}
                  sx={{
                    width: "100%",
                    borderRadius: "16px",
                    objectFit: "cover",
                    boxShadow: "0 12px 32px rgba(26,26,26,0.1)",
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default RoomDetail;
