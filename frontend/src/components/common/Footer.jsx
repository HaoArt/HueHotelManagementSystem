import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";

// Icons
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import ConfigService from "../../services/configService";

// LUXURY DESIGN TOKENS (Đồng bộ toàn hệ thống)
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

const Footer = () => {
  const [hotelInfo, setHotelInfo] = useState({
    name: "Huế Hotel",
    address: "Đang cập nhật...",
    phone: "Đang cập nhật...",
    email: "Đang cập nhật...",
  });

  useEffect(() => {
    const fetchHotelInfo = async () => {
      try {
        const name = await ConfigService.getConfigByKey("hotel_name");
        const address = await ConfigService.getConfigByKey("hotel_address");
        const phone = await ConfigService.getConfigByKey("hotel_phone");
        const email = await ConfigService.getConfigByKey("hotel_email");

        setHotelInfo({
          name: name || "Huế Hotel",
          address: address || "Trung tâm Cố Đô Huế, Việt Nam",
          phone: phone || "1900 xxxx",
          email: email || "contact@huehotel.com",
        });
      } catch (error) {
        console.error("Lỗi khi tải thông tin Footer:", error);
      }
    };

    fetchHotelInfo();
  }, []);

  return (
    <Box
      sx={{
        bgcolor: LUXURY.navy,
        color: LUXURY.white,
        pt: { xs: 8, md: 10 },
        pb: 4,
        mt: "auto",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: `linear-gradient(90deg, ${LUXURY.gold} 0%, ${LUXURY.goldLight} 50%, ${LUXURY.gold} 100%)`,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 6, md: 8 },
            justifyContent: "space-between",
          }}
        >
          {/* Ô 1: GIỚI THIỆU */}
          <Box sx={{ flex: 1.2 }}>
            <Typography
              variant="h4"
              sx={{
                color: LUXURY.gold,
                mb: 3,
                fontFamily: '"Playfair Display", serif',
                fontWeight: 900,
                letterSpacing: "2px",
              }}
            >
              {hotelInfo.name.toUpperCase()}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "rgba(255,255,255,0.8)", mb: 4, lineHeight: 1.9 }}
            >
              Trải nghiệm kỳ nghỉ dưỡng mang đậm dấu ấn văn hóa và kiến trúc Cố
              Đô. Mang đến cho bạn không gian thư giãn tuyệt đối với dịch vụ
              đẳng cấp 5 sao.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <IconButton
                sx={{
                  color: LUXURY.softGray,
                  bgcolor: "rgba(255,255,255,0.05)",
                  "&:hover": {
                    color: LUXURY.charcoal,
                    bgcolor: LUXURY.gold,
                    transform: "translateY(-3px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: LUXURY.softGray,
                  bgcolor: "rgba(255,255,255,0.05)",
                  "&:hover": {
                    color: LUXURY.charcoal,
                    bgcolor: LUXURY.gold,
                    transform: "translateY(-3px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: LUXURY.softGray,
                  bgcolor: "rgba(255,255,255,0.05)",
                  "&:hover": {
                    color: LUXURY.charcoal,
                    bgcolor: LUXURY.gold,
                    transform: "translateY(-3px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <YouTubeIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Ô 2: LIÊN KẾT NHANH */}
          <Box sx={{ flex: 0.8 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                color: LUXURY.white,
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
              }}
            >
              Liên Kết Nhanh
            </Typography>
            <Stack spacing={2}>
              {[
                { label: "Trang chủ", path: "/" },
                { label: "Phòng & Suite", path: "/rooms" },
                { label: "Khám phá Huế", path: "/discover-hue" },
                { label: "Liên hệ với chúng tôi", path: "/contact" },
              ].map((link) => (
                <Typography
                  key={link.path}
                  component={Link}
                  to={link.path}
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                    fontWeight: 500,
                    display: "inline-block",
                    width: "fit-content",
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: LUXURY.gold,
                      transform: "translateX(6px)",
                    },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>
          </Box>

          {/* Ô 3: THÔNG TIN LIÊN HỆ */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                color: LUXURY.white,
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
              }}
            >
              Thông Tin Liên Hệ
            </Typography>
            <Stack spacing={3}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <LocationOnIcon sx={{ color: LUXURY.gold, mt: 0.5 }} />
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}
                >
                  {hotelInfo.address}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <PhoneIcon sx={{ color: LUXURY.gold }} />
                <Typography
                  variant="body1"
                  sx={{
                    color: LUXURY.white,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  {hotelInfo.phone}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <EmailIcon sx={{ color: LUXURY.gold }} />
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {hotelInfo.email}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 5 }} />

        {/* BẢN QUYỀN */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}
          >
            &copy; {new Date().getFullYear()} {hotelInfo.name}. Đã đăng ký bản
            quyền.
          </Typography>
          <Stack direction="row" spacing={4} sx={{ mt: { xs: 3, sm: 0 } }}>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                fontWeight: 500,
                transition: "color 0.3s ease",
                "&:hover": { color: LUXURY.gold },
              }}
            >
              Điều khoản sử dụng
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                fontWeight: 500,
                transition: "color 0.3s ease",
                "&:hover": { color: LUXURY.gold },
              }}
            >
              Chính sách bảo mật
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
