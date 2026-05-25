import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import PersonIcon from "@mui/icons-material/Person";
import BedIcon from "@mui/icons-material/Bed";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

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
  const { user } = useContext(AuthContext);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBookNow = () => {
    // Biến user ở đây đã có sẵn dữ liệu từ Context rồi
    if (!user) {
      setSnackbar({
        open: true,
        message: "Vui lòng đăng nhập để tiếp tục đặt phòng!",
        severity: "warning",
      });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    navigate("/booking", { state: { room } });
  };

  const optimizeImageUrl = (url) => {
    if (!url)
      return "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80";
    if (url.includes("cloudinary.com") && !url.includes("/upload/w_")) {
      return url.replace("/upload/", "/upload/w_800,q_100,f_auto/");
    }
    return url;
  };

  const getBedInfo = (capacity) => {
    if (capacity >= 4) return "2 Giường Đôi";
    if (capacity === 1) return "1 Giường Đơn";
    return "1 Giường King";
  };

  const displayDescription =
    description ||
    room.description ||
    "Trải nghiệm không gian lưu trú sang trọng với đầy đủ tiện nghi tiêu chuẩn 5 sao dành riêng cho bạn.";

  return (
    <>
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
          height: "100%",
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
        <Box sx={{ position: "relative", overflow: "hidden" }}>
          <CardMedia
            component="img"
            height="250"
            image={optimizeImageUrl(room.image_url)}
            alt={room.type_name || room.name}
            sx={{
              transition: "transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)",
            }}
          />
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
            p: { xs: 2.5, md: 3 },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              color: LUXURY.charcoal,
              fontFamily: '"Playfair Display", serif',
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            {room.type_name || room.name}
          </Typography>{" "}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
              color: LUXURY.charcoal,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AspectRatioIcon sx={{ fontSize: 18, color: LUXURY.gold }} />
              <Typography
                variant="body2"
                fontWeight="700"
                sx={{ fontSize: "0.85rem" }}
              >
                {room.area || 32} m²
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PersonIcon sx={{ fontSize: 18, color: LUXURY.gold }} />
              <Typography
                variant="body2"
                fontWeight="700"
                sx={{ fontSize: "0.85rem" }}
              >
                {room.capacity || 2} Khách
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <BedIcon sx={{ fontSize: 18, color: LUXURY.gold }} />
              <Typography
                variant="body2"
                fontWeight="700"
                sx={{ fontSize: "0.85rem" }}
              >
                {getBedInfo(room.capacity)}
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="body2"
            color={LUXURY.warmGray}
            sx={{
              mb: 3,
              flexGrow: 1,
              lineHeight: 1.7,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: "0.9rem",
            }}
          >
            {displayDescription}
          </Typography>
          <Box sx={{ mt: "auto" }}>
            <Box
              sx={{ mb: 2.5, display: "flex", alignItems: "baseline", gap: 1 }}
            >
              <Typography
                variant="caption"
                color={LUXURY.warmGray}
                fontWeight="800"
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
                {Number(room.base_price || room.price).toLocaleString("vi-VN")}{" "}
                đ
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
                onClick={() =>
                  navigate(`/rooms/${room.id}`, { state: { room } })
                }
                sx={{
                  flex: 1,
                  borderRadius: "10px",
                  color: LUXURY.charcoal,
                  borderColor: LUXURY.softGray,
                  textTransform: "none",
                  fontWeight: "800",
                  fontSize: "0.85rem",
                  py: 1,
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
                onClick={handleBookNow}
                sx={{
                  flex: 1,
                  borderRadius: "10px",
                  background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                  color: LUXURY.white,
                  textTransform: "none",
                  fontWeight: "800",
                  fontSize: "0.85rem",
                  py: 1,
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "12px", fontWeight: "600" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RoomCard;
