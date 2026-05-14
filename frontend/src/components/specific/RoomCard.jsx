import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Icons
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import PersonIcon from "@mui/icons-material/Person";
import BedIcon from "@mui/icons-material/Bed";

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

const RoomCard = ({ room, badge, description }) => {
  const navigate = useNavigate();

  // ==========================================
  // 1. Hàm tối ưu ảnh Cloudinary cho Card (w_800 là đủ nét)
  // ==========================================
  const optimizeImageUrl = (url) => {
    if (!url)
      return "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80";
    if (url.includes("cloudinary.com") && !url.includes("/upload/w_")) {
      return url.replace("/upload/", "/upload/w_800,q_100,f_auto/");
    }
    return url;
  };

  // ==========================================
  // 2. Hàm tính loại giường tự động
  // ==========================================
  const getBedInfo = (capacity) => {
    if (capacity >= 4) return "2 Giường Đôi";
    if (capacity === 1) return "1 Giường Đơn";
    return "1 Giường King";
  };

  // ==========================================
  // 3. Xử lý hiển thị mô tả (Cắt ngắn để Card không bị méo)
  // ==========================================
  const displayDescription =
    description ||
    room.description ||
    "Trải nghiệm không gian lưu trú sang trọng với đầy đủ tiện nghi tiêu chuẩn 5 sao dành riêng cho bạn.";

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "24px",
        border: `1px solid ${LUXURY.softGray}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        bgcolor: LUXURY.white,
        position: "relative",
        height: "100%", // Đảm bảo thẻ giãn đều trong lưới Flexbox
        transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 24px 48px rgba(26,26,26,0.08)",
          borderColor: LUXURY.goldLight,
          "& .MuiCardMedia-root": {
            transform: "scale(1.05)",
          },
        },
      }}
    >
      {/* HÌNH ẢNH CÓ CHỨA BADGE */}
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <CardMedia
          component="img"
          height="260"
          image={optimizeImageUrl(room.image_url)}
          alt={room.type_name || room.name}
          sx={{
            transition: "transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)",
          }}
        />
        {/* Lớp phủ đen mờ mỏng ở dưới đáy ảnh để số/chữ trắng nổi bật hơn (nếu có) */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%)",
            pointerEvents: "none",
          }}
        />

        {badge && (
          <Chip
            icon={badge.icon}
            label={badge.label}
            size="small"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: badge.bgcolor || LUXURY.navy,
              color: badge.color || LUXURY.gold,
              fontWeight: "800",
              borderRadius: "8px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              px: 1,
              py: 2,
              letterSpacing: "0.5px",
            }}
          />
        )}
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: { xs: 3, md: 4 },
        }}
      >
        {/* TÊN PHÒNG */}
        <Typography
          variant="h5"
          sx={{
            mb: 2.5,
            color: LUXURY.charcoal,
            fontFamily: '"Playfair Display", serif',
            fontWeight: 900,
            letterSpacing: "-0.02em",
          }}
        >
          {room.type_name || room.name}
        </Typography>

        {/* ICONS THÔNG SỐ (SỬ DỤNG DỮ LIỆU ĐỘNG) */}
        <Stack
          direction="row"
          spacing={2.5}
          sx={{ mb: 3, color: LUXURY.charcoal }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AspectRatioIcon sx={{ fontSize: 20, color: LUXURY.gold }} />
            <Typography variant="body2" fontWeight="700">
              {room.area || 32} m²
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon sx={{ fontSize: 20, color: LUXURY.gold }} />
            <Typography variant="body2" fontWeight="700">
              {room.capacity || 2} Khách
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BedIcon sx={{ fontSize: 20, color: LUXURY.gold }} />
            <Typography variant="body2" fontWeight="700">
              {getBedInfo(room.capacity)}
            </Typography>
          </Box>
        </Stack>

        {/* MÔ TẢ NGẮN (DÙNG CLAMP ĐỂ CẮT CHỮ GỌN GÀNG) */}
        <Typography
          variant="body2"
          color={LUXURY.warmGray}
          sx={{
            mb: 4,
            flexGrow: 1,
            lineHeight: 1.8,
            display: "-webkit-box",
            WebkitLineClamp: 2, // Chỉ cho hiển thị tối đa 2 dòng
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: "0.95rem",
          }}
        >
          {displayDescription}
        </Typography>

        {/* KHU VỰC GIÁ VÀ NÚT BẤM */}
        <Box sx={{ mt: "auto" }}>
          <Box sx={{ mb: 3, display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              variant="caption"
              color={LUXURY.warmGray}
              fontWeight="800"
              letterSpacing={1}
            >
              TỪ
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: LUXURY.navy,
                fontWeight: 900,
                fontFamily: '"Playfair Display", serif',
              }}
            >
              {Number(room.base_price || room.price).toLocaleString("vi-VN")} đ
            </Typography>
            <Typography
              variant="caption"
              color={LUXURY.warmGray}
              fontWeight="700"
            >
              / ĐÊM
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/rooms/${room.id}`, { state: { room } })}
              sx={{
                flex: 1,
                borderRadius: "12px",
                color: LUXURY.charcoal,
                borderColor: LUXURY.softGray,
                textTransform: "none",
                fontWeight: "800",
                py: 1.2,
                "&:hover": {
                  borderColor: LUXURY.charcoal,
                  bgcolor: LUXURY.offwhite,
                },
              }}
            >
              CHI TIẾT
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={() => navigate("/booking", { state: { room } })}
              sx={{
                flex: 1,
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                color: LUXURY.white,
                textTransform: "none",
                fontWeight: "800",
                py: 1.2,
                boxShadow: `0 8px 16px ${LUXURY.gold}40`,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 24px ${LUXURY.gold}60`,
                },
              }}
            >
              ĐẶT NGAY
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
