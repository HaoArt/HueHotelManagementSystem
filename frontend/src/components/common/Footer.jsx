import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  Divider,
} from "@mui/material"; // Đã xóa Grid

// Icons
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import ConfigService from "../../services/configService";

const COLORS = {
  primary: "#1a237e",
  secondary: "#ff9800",
  textLight: "#e2e8f0",
  textMuted: "#94a3b8",
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
          email: email || "contact@huehotel.vn",
        });
      } catch (error) {
        console.error("Lỗi khi tải thông tin Footer:", error);
      }
    };

    fetchHotelInfo();
  }, []);

  return (
    <Box
      sx={{ bgcolor: COLORS.primary, color: "white", pt: 8, pb: 4, mt: "auto" }}
    >
      <Container maxWidth="lg">
        {/* SỬ DỤNG FLEXBOX CHIA 3 Ô ĐỀU NHAU */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" }, // Mobile xếp dọc, PC xếp ngang
            gap: 6, // Khoảng cách giữa các ô
            justifyContent: "space-between",
          }}
        >
          {/* Ô 1: GIỚI THIỆU */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              fontWeight="900"
              sx={{ color: COLORS.secondary, mb: 2, letterSpacing: "1px" }}
            >
              {hotelInfo.name.toUpperCase()}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: COLORS.textLight, mb: 3, lineHeight: 1.8 }}
            >
              Trải nghiệm kỳ nghỉ dưỡng mang đậm dấu ấn văn hóa và kiến trúc Cố
              Đô. Mang đến cho bạn không gian thư giãn tuyệt đối với dịch vụ
              đẳng cấp 5 sao.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                sx={{
                  color: COLORS.textLight,
                  "&:hover": { color: COLORS.secondary },
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: COLORS.textLight,
                  "&:hover": { color: COLORS.secondary },
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: COLORS.textLight,
                  "&:hover": { color: COLORS.secondary },
                }}
              >
                <YouTubeIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Ô 2: LIÊN KẾT NHANH */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 3, color: "white" }}
            >
              Liên kết nhanh
            </Typography>
            <Stack spacing={2}>
              <Typography
                component={Link}
                to="/"
                sx={{
                  color: COLORS.textLight,
                  textDecoration: "none",
                  "&:hover": { color: COLORS.secondary, pl: 1 },
                  transition: "all 0.3s",
                }}
              >
                Trang chủ
              </Typography>
              <Typography
                component={Link}
                to="/rooms"
                sx={{
                  color: COLORS.textLight,
                  textDecoration: "none",
                  "&:hover": { color: COLORS.secondary, pl: 1 },
                  transition: "all 0.3s",
                }}
              >
                Phòng & Suite
              </Typography>
              <Typography
                component={Link}
                to="/discover-hue"
                sx={{
                  color: COLORS.textLight,
                  textDecoration: "none",
                  "&:hover": { color: COLORS.secondary, pl: 1 },
                  transition: "all 0.3s",
                }}
              >
                Khám phá Huế
              </Typography>
              <Typography
                component={Link}
                to="/contact"
                sx={{
                  color: COLORS.textLight,
                  textDecoration: "none",
                  "&:hover": { color: COLORS.secondary, pl: 1 },
                  transition: "all 0.3s",
                }}
              >
                Liên hệ với chúng tôi
              </Typography>
            </Stack>
          </Box>

          {/* Ô 3: THÔNG TIN LIÊN HỆ */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 3, color: "white" }}
            >
              Thông tin liên hệ
            </Typography>
            <Stack spacing={2.5}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <LocationOnIcon sx={{ color: COLORS.secondary }} />
                <Typography variant="body2" sx={{ color: COLORS.textLight }}>
                  {hotelInfo.address}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <PhoneIcon sx={{ color: COLORS.secondary }} />
                <Typography
                  variant="body2"
                  sx={{ color: COLORS.textLight, fontWeight: "bold" }}
                >
                  {hotelInfo.phone}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <EmailIcon sx={{ color: COLORS.secondary }} />
                <Typography variant="body2" sx={{ color: COLORS.textLight }}>
                  {hotelInfo.email}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 4 }} />

        {/* BẢN QUYỀN */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
            &copy; {new Date().getFullYear()} {hotelInfo.name}. Đã đăng ký bản
            quyền.
          </Typography>
          <Stack direction="row" spacing={3} sx={{ mt: { xs: 2, sm: 0 } }}>
            <Typography
              variant="body2"
              sx={{
                color: COLORS.textMuted,
                cursor: "pointer",
                "&:hover": { color: "white" },
              }}
            >
              Điều khoản sử dụng
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: COLORS.textMuted,
                cursor: "pointer",
                "&:hover": { color: "white" },
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
