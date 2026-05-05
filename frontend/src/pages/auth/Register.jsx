/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
} from "@mui/material";
// THÊM ICON Ở ĐÂY:
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AuthService from "../../services/authService";

const Register = () => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handlePreRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp!");
    }

    setLoading(true);
    try {
      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };

      await AuthService.preRegister(payload);
      setSuccess("Mã OTP đã được gửi đến Email của bạn!");
      setStep(2);
    } catch (err) {
      setError(err);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await AuthService.verifyAndCreate(formData.email, otp);
      setSuccess("Tạo tài khoản thành công! Đang chuyển hướng...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex bg-light">
      <Row className="w-100 m-0">
        <Col
          lg={6}
          className="d-flex align-items-center justify-content-center p-4"
        >
          <Paper
            elevation={3}
            sx={{ p: 5, borderRadius: 4, width: "100%", maxWidth: "500px" }}
          >
            {/* NÚT QUAY LẠI TRANG CHỦ */}
            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
              <Button
                component={Link}
                to="/"
                startIcon={<ArrowBackIcon />}
                sx={{
                  color: "text.secondary",
                  textTransform: "none",
                  fontWeight: "medium",
                }}
              >
                Về trang chủ
              </Button>
            </Box>

            {step === 1 ? (
              <>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  align="center"
                  color="#1a237e"
                  gutterBottom
                >
                  Tạo Tài Khoản
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mb: 4 }}
                >
                  Đăng ký để trải nghiệm dịch vụ tốt nhất từ HuếHotel
                </Typography>

                {error && (
                  <Alert
                    severity="error"
                    onClose={() => setError("")}
                    sx={{ mb: 3 }}
                  >
                    {error}
                  </Alert>
                )}

                <form onSubmit={handlePreRegister}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    name="fullName"
                    variant="outlined"
                    margin="normal"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                  <Row>
                    <Col md={6}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        name="phone"
                        variant="outlined"
                        margin="normal"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        variant="outlined"
                        margin="normal"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Row>
                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    name="password"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="warning"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 4, mb: 2, py: 1.5, fontWeight: "bold" }}
                  >
                    {loading ? "ĐANG GỬI MÃ OTP..." : "ĐĂNG KÝ"}
                  </Button>
                </form>
              </>
            ) : (
              <Box textAlign="center">
                <MarkEmailReadIcon
                  sx={{ fontSize: 60, color: "#4caf50", mb: 2 }}
                />
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="#1a237e"
                  gutterBottom
                >
                  Xác thực Email
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Vui lòng kiểm tra hộp thư <b>{formData.email}</b> và nhập mã
                  OTP 6 số để hoàn tất.
                </Typography>

                {error && (
                  <Alert
                    severity="error"
                    onClose={() => setError("")}
                    sx={{ mb: 3 }}
                  >
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                )}

                <form onSubmit={handleVerifyOTP}>
                  <TextField
                    fullWidth
                    label="Nhập mã OTP"
                    variant="outlined"
                    margin="normal"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    inputProps={{
                      maxLength: 6,
                      style: {
                        textAlign: "center",
                        fontSize: "24px",
                        letterSpacing: "10px",
                      },
                    }}
                    required
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: "bold" }}
                  >
                    {loading ? "ĐANG XÁC THỰC..." : "XÁC NHẬN MÃ OTP"}
                  </Button>
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    Quay lại
                  </Button>
                </form>
              </Box>
            )}

            {step === 1 && (
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  style={{
                    fontWeight: "bold",
                    color: "#1a237e",
                    textDecoration: "none",
                  }}
                >
                  Đăng nhập ngay
                </Link>
              </Typography>
            )}
          </Paper>
        </Col>

        <Col lg={6} className="d-none d-lg-block p-0">
          <Box
            sx={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1350")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "100%",
            }}
          >
            <Box sx={{ height: "100%", bgcolor: "rgba(0, 0, 0, 0.4)" }} />
          </Box>
        </Col>
      </Row>
    </div>
  );
};

export default Register;
