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

// Đồng bộ Theme Colors
const COLORS = {
  primary: "#4a148c",
  border: "#e0e0e0",
  textMain: "#333",
  textSecondary: "#666",
};

const RoomCard = ({ room, badge, description }) => {
  const navigate = useNavigate();

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
      }}
    >
      {/* HÌNH ẢNH CÓ CHỨA BADGE */}
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="240"
          image={
            room.image_url ||
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
          }
          alt={room.type_name || room.name}
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
          sx={{ mb: 1, color: COLORS.textMain }}
        >
          {room.type_name || room.name}
        </Typography>

        {/* ICONS THÔNG SỐ */}
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
            <Typography variant="body2">1 Giường Đôi</Typography>
          </Box>
        </Stack>

        {/* MÔ TẢ NGẮN */}
        {description && (
          <Typography
            variant="body2"
            color={COLORS.textSecondary}
            sx={{ mb: 3, flexGrow: 1, lineHeight: 1.6 }}
          >
            {description}
          </Typography>
        )}

        {/* KHU VỰC GIÁ VÀ NÚT BẤM (Giá 1 hàng, Nút 1 hàng chia đều) */}
        <Box sx={{ mt: "auto" }}>
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Từ
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: COLORS.primary, fontWeight: "bold" }}
            >
              {Number(room.base_price || room.price).toLocaleString("vi-VN")}{" "}
              VNĐ
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
              >
                {" "}
                / đêm
              </Typography>
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/rooms/${room.id}`, { state: { room } })}
              sx={{
                flex: 1, // Chia đều không gian
                borderRadius: "4px",
                color: COLORS.textMain,
                borderColor: COLORS.border,
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  borderColor: COLORS.textMain,
                  bgcolor: "transparent",
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
                flex: 1, // Chia đều không gian
                borderRadius: "4px",
                bgcolor: COLORS.primary,
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#311b92" },
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
