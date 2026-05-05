/* eslint-disable react-hooks/static-components */
// src/pages/Contact.jsx
import { useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SendIcon from "@mui/icons-material/Send";
import ContactService from "../../services/contactService";

// Đồng bộ Theme Colors theo thiết kế
const COLORS = {
  primary: "#5e35b1", // Màu Tím chủ đạo (gần với thiết kế)
  primaryLight: "#ede7f6", // Màu Tím nhạt cho nền icon
  border: "#e0e0e0", // Viền xám mỏng
  borderRadius: "8px", // Bo góc nhỏ, thanh lịch
  textMain: "#333",
  textSecondary: "#666",
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
      setSuccess(res.message);
      setFormData({ name: "", email: "", subject: "", message: "" }); // Reset form
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Component tái sử dụng cho các khối thông tin liên hệ bên trái
  const InfoCard = ({ icon, title, content }) => (
    <Paper
      sx={{
        p: 3,
        borderRadius: COLORS.borderRadius,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "none",
        display: "flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          bgcolor: COLORS.primaryLight,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: COLORS.primary,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography fontWeight="bold" color="text.primary">
          {content}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", pb: 0 }}>
      {/* KHU VỰC HERO BANNER */}
      {/* KHU VỰC HERO BANNER - ĐỒNG BỘ */}
      <Box
        sx={{
          height: { xs: "40vh", md: "50vh" },
          backgroundImage: `linear-gradient(to bottom, rgba(74, 20, 140, 0.7), rgba(49, 27, 146, 0.85)), url("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          mb: 6,
        }}
      >
        <Container>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="800"
            letterSpacing={2}
            gutterBottom
            sx={{
              textTransform: "uppercase",
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Liên Hệ Với Chúng Tôi
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              opacity: 0.9,
              maxWidth: "650px",
              mx: "auto",
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ quý khách để mang đến
            trải nghiệm nghỉ dưỡng hoàn hảo nhất tại Hue Hotel.
          </Typography>
        </Container>
      </Box>

      <Container sx={{ mb: 8 }}>
        <Row className="g-4">
          {/* CỘT TRÁI: Thông tin liên hệ dạng thẻ phẳng */}
          <Col lg={4}>
            <Stack spacing={3} sx={{ height: "100%" }}>
              <InfoCard
                icon={<LocationOnOutlinedIcon />}
                title="Địa chỉ"
                content="01 Lê Lợi, TP. Huế"
              />
              <InfoCard
                icon={<PhoneOutlinedIcon />}
                title="Điện thoại"
                content="+84 234 3822 222"
              />
              <InfoCard
                icon={<EmailOutlinedIcon />}
                title="Email"
                content="info@huehospitality.com"
              />
            </Stack>
          </Col>

          {/* CỘT PHẢI: Form liên hệ */}
          <Col lg={8}>
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: COLORS.borderRadius,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "none",
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: COLORS.primary, mb: 4, fontWeight: "500" }}
              >
                Gửi Tin Nhắn
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: "4px" }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert
                  severity="success"
                  sx={{ mb: 3, borderRadius: "4px" }}
                  onClose={() => setSuccess("")}
                >
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Typography variant="body2" color={COLORS.textMain} mb={1}>
                      Họ và Tên
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Nhập họ và tên"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "4px" },
                      }}
                    />
                  </Col>
                  <Col md={6}>
                    <Typography variant="body2" color={COLORS.textMain} mb={1}>
                      Email
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="email"
                      placeholder="Nhập địa chỉ email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "4px" },
                      }}
                    />
                  </Col>
                  <Col xs={12}>
                    <Typography variant="body2" color={COLORS.textMain} mb={1}>
                      Chủ đề
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Nhập chủ đề tin nhắn"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "4px" },
                      }}
                    />
                  </Col>
                  <Col xs={12}>
                    <Typography variant="body2" color={COLORS.textMain} mb={1}>
                      Nội dung
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "4px" },
                      }}
                    />
                  </Col>
                  <Col xs={12} sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      endIcon={<SendIcon sx={{ fontSize: 18 }} />}
                      sx={{
                        bgcolor: COLORS.primary,
                        color: "white",
                        py: 1.2,
                        px: 3,
                        fontWeight: "500",
                        borderRadius: "6px",
                        textTransform: "none", // Giữ nguyên chữ hoa/thường theo thiết kế
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "#4527a0",
                          boxShadow: "none",
                        },
                      }}
                    >
                      {loading ? "Đang gửi..." : "Gửi Tin Nhắn"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Paper>
          </Col>
        </Row>
      </Container>

      {/* KHU VỰC BẢN ĐỒ (Thêm vào để khớp với ảnh thiết kế) */}
      <Box sx={{ width: "100%", height: "400px", bgcolor: "#e0e0e0", mt: 4 }}>
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
  );
};

export default Contact;
