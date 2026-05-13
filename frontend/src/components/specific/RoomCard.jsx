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

// Đồng bộ Theme Colors (Thầy đổi màu primary về #5e35b1 cho chuẩn bộ nhận diện Huế Hotel)
const COLORS = {
  primary: "#5e35b1",
  border: "#e0e0e0",
  textMain: "#333",
  textTitle: "#fff",
  textSecondary: "#666",
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
    "Trải nghiệm không gian lưu trú sang trọng với đầy đủ tiện nghi.";

  return (
    <Card
      sx={{
        borderRadius: "8px",
        border: `1px solid ${COLORS.border}`,
        overflow: "hidden",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        position: "relative",
        height: "100%", // Đảm bảo thẻ giãn đều trong lưới Flexbox
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* HÌNH ẢNH CÓ CHỨA BADGE */}
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <CardMedia
          component="img"
          height="240"
          image={optimizeImageUrl(room.image_url)}
          alt={room.type_name || room.name}
          sx={{
            transition: "transform 0.5s ease",
            "&:hover": { transform: "scale(1.05)" },
          }}
        />
        {badge && (
          <Chip
            icon={badge.icon}
            label={badge.label}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              bgcolor: badge.bgcolor,
              color: badge.color,
              fontWeight: "bold",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          />
        )}
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: 3,
        }}
      >
        {/* TÊN PHÒNG */}
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 1.5, color: COLORS.textMain }}
        >
          {room.type_name || room.name}
        </Typography>

        {/* ICONS THÔNG SỐ (SỬ DỤNG DỮ LIỆU ĐỘNG) */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 2, color: COLORS.textSecondary }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AspectRatioIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">{room.area || 32} m²</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">{room.capacity || 2} Khách</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <BedIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">{getBedInfo(room.capacity)}</Typography>
          </Box>
        </Stack>

        {/* MÔ TẢ NGẮN (DÙNG CLAMP ĐỂ CẮT CHỮ GỌN GÀNG) */}
        <Typography
          variant="body2"
          color={COLORS.textSecondary}
          sx={{
            mb: 3,
            flexGrow: 1,
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2, // Chỉ cho hiển thị tối đa 2 dòng
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {displayDescription}
        </Typography>

        {/* KHU VỰC GIÁ VÀ NÚT BẤM */}
        <Box sx={{ mt: "auto" }}>
          <Box sx={{ mb: 2, display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Từ
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: COLORS.primary, fontWeight: "bold" }}
            >
              {Number(room.base_price || room.price).toLocaleString("vi-VN")} đ
            </Typography>
            <Typography variant="caption" color="text.secondary">
              / đêm
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/rooms/${room.id}`, { state: { room } })}
              sx={{
                flex: 1,
                borderRadius: "4px",
                color: COLORS.primary,
                borderColor: COLORS.border,
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  borderColor: COLORS.primary,
                  bgcolor: "rgba(94, 53, 177, 0.04)", // Nhấn màu tím nhạt khi hover
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
                borderRadius: "4px",
                bgcolor: COLORS.primary,
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#4527a0" },
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
