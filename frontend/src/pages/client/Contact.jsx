/* eslint-disable react-hooks/static-components */
import { useState } from "react";
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Stack,
  Container,
  Fade,
  Slide,
} from "@mui/material";

// Icons
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SendIcon from "@mui/icons-material/Send";

import ContactService from "../../services/contactService";

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

// ĐÃ SỬA LẠI: Thêm viền xám nhẹ để ô nhập liệu không bị "tàng hình"
const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    bgcolor: "#ffffff",
    transition: "all 0.3s ease",
    "& fieldset": { borderColor: "#d1d5db", borderWidth: "1px" }, // Viền xám nhạt
    "&:hover fieldset": { borderColor: LUXURY.gold },
    "&.Mui-focused fieldset": { borderColor: LUXURY.gold, borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": {
    color: "#6b7280",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: LUXURY.gold,
    fontWeight: "bold",
  },
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await ContactService.submitContact(formData);
      setSuccess(res.message || "Gửi tin nhắn thành công!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  // Component Thẻ thông tin
  const InfoCard = ({ icon, title, content }) => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: "20px",
        border: `1px solid ${LUXURY.softGray}`,
        bgcolor: LUXURY.white,
        display: "flex",
        alignItems: "center",
        gap: 3,
        transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 20px 40px rgba(26,26,26,0.06)",
          borderColor: LUXURY.gold,
        },
      }}
    >
      <Box
        sx={{
          width: { xs: 56, md: 64 },
          height: { xs: 56, md: 64 },
          borderRadius: "16px",
          bgcolor: `${LUXURY.gold}15`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: LUXURY.gold,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant="body2"
          color={LUXURY.warmGray}
          fontWeight="700"
          letterSpacing="1px"
          sx={{ mb: 0.5, textTransform: "uppercase" }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          color={LUXURY.charcoal}
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 800,
            fontSize: { xs: "1.1rem", md: "1.25rem" },
          }}
        >
          {content}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box
      sx={{ bgcolor: LUXURY.white, minHeight: "100vh", pb: { xs: 8, md: 12 } }}
    >
      {/* =========================================================================
          HERO HEADER SECTION
         ========================================================================= */}
      <Box
        sx={{
          height: { xs: "40vh", md: "50vh" },
          backgroundImage: `linear-gradient(to bottom, rgba(26,26,26,0.6), rgba(27,45,79,0.4)), url("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          mb: { xs: 8, md: 12 },
        }}
      >
        <Container>
          <Fade in={true} timeout={1000}>
            <Box>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 900,
                  letterSpacing: "1px",
                  mb: 2,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  textShadow: "0 4px 16px rgba(0,0,0,0.4)",
                }}
              >
                Liên Hệ Huế Hotel
              </Typography>
              <Typography
                variant="h6"
                component="p"
                sx={{
                  opacity: 0.9,
                  maxWidth: "700px",
                  mx: "auto",
                  fontWeight: 300,
                  lineHeight: 1.8,
                  fontSize: { xs: "1rem", md: "1.2rem" },
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ quý khách để mang
                đến trải nghiệm nghỉ dưỡng hoàn hảo nhất tại Cố đô.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* =========================================================================
            BỐ CỤC CHÍNH BẰNG FLEXBOX (Đảm bảo Side-by-side trên Laptop)
           ========================================================================= */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" }, // Điện thoại dọc, Laptop ngang
            gap: { xs: 6, lg: 8 },
          }}
        >
          {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
          <Slide direction="right" in={true} timeout={800}>
            <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 40%" } }}>
              <Stack
                spacing={3}
                sx={{ height: "100%", justifyContent: "center" }}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      color: LUXURY.charcoal,
                      fontWeight: 800,
                      mb: 2,
                    }}
                  >
                    Kết Nối Với Chúng Tôi
                  </Typography>
                  <Typography
                    variant="body1"
                    color={LUXURY.warmGray}
                    sx={{ lineHeight: 1.8, fontSize: "1.05rem" }}
                  >
                    Dù bạn có câu hỏi về việc đặt phòng, tổ chức sự kiện hay cần
                    những gợi ý đặc biệt cho chuyến đi, đội ngũ chuyên gia của
                    chúng tôi luôn ở đây để giúp đỡ.
                  </Typography>
                </Box>

                <InfoCard
                  icon={<LocationOnOutlinedIcon fontSize="large" />}
                  title="Địa chỉ"
                  content="01 Lê Lợi, TP. Huế"
                />
                <InfoCard
                  icon={<PhoneOutlinedIcon fontSize="large" />}
                  title="Điện thoại"
                  content="+84 234 3822 222"
                />
                <InfoCard
                  icon={<EmailOutlinedIcon fontSize="large" />}
                  title="Email"
                  content="info@huehotel.com"
                />
              </Stack>
            </Box>
          </Slide>

          {/* CỘT PHẢI: FORM LIÊN HỆ */}
          <Slide direction="left" in={true} timeout={1000}>
            <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 0%" } }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 4, md: 5, lg: 6 },
                  borderRadius: "24px",
                  border: `1px solid ${LUXURY.softGray}`,
                  bgcolor: LUXURY.white,
                  boxShadow: "0 24px 48px rgba(26,26,26,0.06)",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: LUXURY.navy,
                    mb: 1,
                    fontWeight: "900",
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  Gửi Thông Điệp
                </Typography>
                <Typography
                  variant="body1"
                  color={LUXURY.warmGray}
                  sx={{ mb: 4 }}
                >
                  Vui lòng điền thông tin bên dưới, chúng tôi sẽ phản hồi sớm
                  nhất.
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 4, borderRadius: "12px" }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert
                    severity="success"
                    sx={{
                      mb: 4,
                      borderRadius: "12px",
                      bgcolor: `${LUXURY.gold}15`,
                      color: LUXURY.charcoal,
                      border: `1px solid ${LUXURY.gold}40`,
                    }}
                    onClose={() => setSuccess("")}
                  >
                    {success}
                  </Alert>
                )}

                {/* SỬ DỤNG STACK THAY VÌ GRID ĐỂ FORM KHÔNG BỊ VỠ */}
                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {/* Hàng 1: Tên & Email (Xếp ngang trên PC, Dọc trên Mobile) */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                      <TextField
                        fullWidth
                        label="Họ và Tên"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        sx={inputStyle}
                      />
                      <TextField
                        fullWidth
                        type="email"
                        label="Địa chỉ Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        sx={inputStyle}
                      />
                    </Stack>

                    {/* Hàng 2 & 3: Chủ đề & Nội dung */}
                    <TextField
                      fullWidth
                      label="Chủ đề quan tâm"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      sx={inputStyle}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      label="Nội dung chi tiết"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      sx={inputStyle}
                    />

                    {/* Nút Gửi */}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        endIcon={<SendIcon />}
                        fullWidth
                        sx={{
                          background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                          color: LUXURY.white,
                          py: 2,
                          fontWeight: "800",
                          fontSize: "1.05rem",
                          letterSpacing: "1px",
                          borderRadius: "12px",
                          boxShadow: `0 12px 24px ${LUXURY.gold}40`,
                          textTransform: "none",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: `0 16px 32px ${LUXURY.gold}60`,
                          },
                        }}
                      >
                        {loading ? "ĐANG XỬ LÝ..." : "GỬI YÊU CẦU"}
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </Paper>
            </Box>
          </Slide>
        </Box>

        {/* =========================================================================
            KHU VỰC BẢN ĐỒ
           ========================================================================= */}
        <Fade in={true} timeout={1200}>
          <Box sx={{ mt: { xs: 8, md: 12 } }}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  color: LUXURY.charcoal,
                  fontWeight: 800,
                  mb: 2,
                }}
              >
                Bản Đồ Chỉ Đường
              </Typography>
              <Box
                sx={{
                  width: "60px",
                  height: "3px",
                  background: LUXURY.gold,
                  mx: "auto",
                }}
              />
            </Box>
            <Box
              sx={{
                width: "100%",
                height: { xs: "350px", md: "500px" },
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 24px 48px rgba(26,26,26,0.08)",
                border: `1px solid ${LUXURY.softGray}`,
              }}
            >
              <iframe
                title="Hue Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.225571618151!2d107.58550181533663!3d16.464161733111072!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a13b63290615%3A0x67396cdd441366dc!2zMDEgTMOqIEzhu6NpLCBWxKluaCBOaW5oLCBUaMOgbmggcGjhu5EgSHXhur8sIFRo4burYSBUaGnDqm4gSHXhur8sIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1689000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default Contact;
