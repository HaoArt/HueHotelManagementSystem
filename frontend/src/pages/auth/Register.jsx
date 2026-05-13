/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";

import {
  ArrowBack,
  Person,
  Email,
  Phone,
  Badge as BadgeIcon,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import AuthService from "../../services/authService";

const Register = () => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cccd_number: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handlePreRegister = async (e) => {
    e.preventDefault();

    // 1. Kiểm tra Email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError(
        "Định dạng email không hợp lệ (VD: nguyenvan@gmail.com).",
      );
    }

    // 2. Kiểm tra Số điện thoại (Chuẩn Việt Nam: 10 số, đầu 03/05/07/08/09)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone)) {
      return setError(
        "Số điện thoại không hợp lệ (Phải có 10 số và bắt đầu bằng 03, 05, 07, 08 hoặc 09).",
      );
    }

    // 3. Kiểm tra CCCD (Chỉ chứa số, đúng 12 ký tự)
    const cccdRegex = /^\d{12}$/;
    if (!cccdRegex.test(formData.cccd_number)) {
      return setError(
        "Số CCCD phải bao gồm chính xác 12 chữ số (không chứa chữ cái).",
      );
    }

    // 4. Kiểm tra độ mạnh Mật khẩu
    // Tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setError(
        "Mật khẩu yếu! Phải từ 8 ký tự, gồm chữ HOA, chữ thường, số và ký tự đặc biệt (@$!%*?&).",
      );
    }

    // 5. Kiểm tra Xác nhận mật khẩu
    if (formData.password !== formData.confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp!");
    }

    setLoading(true);
    try {
      await AuthService.preRegister({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        cccd_number: formData.cccd_number,
        password: formData.password,
      });
      setSuccess("Mã OTP đã được gửi đến Email của bạn.");
      setStep(2);
    } catch (err) {
      setError(err || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.verifyRegister({
        email: formData.email,
        otp_code: otp,
      });
      setSuccess("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err || "Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex bg-light">
      <Row className="w-100 m-0">
        {/* CỘT TRÁI: FORM ĐĂNG KÝ */}
        <Col
          lg={6}
          className="d-flex align-items-center justify-content-center p-4"
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 4,
              width: "100%",
              maxWidth: "550px",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}>
              <Button
                component={Link}
                to="/"
                startIcon={<ArrowBack />}
                sx={{
                  color: "text.secondary",
                  textTransform: "none",
                  fontWeight: "medium",
                }}
              >
                Về trang chủ
              </Button>
            </Box>

            <Typography
              variant="h4"
              fontWeight="bold"
              align="center"
              color="#1a237e"
              gutterBottom
            >
              {step === 1 ? "Đăng Ký" : "Xác Thực"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              {step === 1
                ? "Tạo tài khoản để trải nghiệm dịch vụ đẳng cấp"
                : `Chúng tôi đã gửi mã xác thực đến ${formData.email}`}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: "8px" }}>
                {success}
              </Alert>
            )}

            {step === 1 ? (
              <form onSubmit={handlePreRegister}>
                <Stack spacing={2.5}>
                  {/* HÀNG 1: HỌ TÊN (FULL) */}
                  <TextField
                    fullWidth
                    label="Họ và Tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* HÀNG 2: EMAIL (FULL) */}
                  <TextField
                    fullWidth
                    label="Địa chỉ Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* HÀNG 3: ĐIỆN THOẠI & CCCD (CHIA ĐÔI) */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Số CCCD (12 số)"
                      name="cccd_number"
                      value={formData.cccd_number}
                      onChange={handleChange}
                      inputProps={{ maxLength: 12 }}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* HÀNG 4: MẬT KHẨU & XÁC NHẬN (CHIA ĐÔI) */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Mật khẩu"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      helperText="Từ 8 ký tự, có Hoa, thường, số, ký tự đặc biệt" // Thêm Helper Text gợi ý
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Xác nhận mật khẩu"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  color="warning"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 4,
                    mb: 2,
                    py: 1.5,
                    fontWeight: "bold",
                    borderRadius: 2,
                    fontSize: "1rem",
                  }}
                >
                  {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ NGAY"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerify}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nhập mã OTP 6 số"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: "center",
                      fontSize: "1.5rem",
                      letterSpacing: "10px",
                      fontWeight: "bold",
                    },
                  }}
                  required
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  color="warning"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, py: 1.5, fontWeight: "bold", borderRadius: 2 }}
                >
                  {loading ? "ĐANG XÁC THỰC..." : "XÁC NHẬN MÃ OTP"}
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  sx={{ mt: 2, width: "100%", fontWeight: "bold" }}
                >
                  Quay lại
                </Button>
              </form>
            )}

            {step === 1 && (
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  style={{
                    fontWeight: "bold",
                    color: "#ff9800",
                    textDecoration: "none",
                  }}
                >
                  Đăng nhập ngay
                </Link>
              </Typography>
            )}
          </Paper>
        </Col>

        {/* CỘT PHẢI: HÌNH ẢNH */}
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
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "rgba(26, 35, 126, 0.6)",
              }}
            >
              <Typography
                variant="h2"
                color="white"
                fontWeight="bold"
                sx={{ color: "#fff", textAlign: "center", px: 4 }}
              >
                Tạo Dấu Ấn Riêng
              </Typography>
              <Typography
                variant="h6"
                color="white"
                sx={{
                  mt: 2,
                  color: "#fff",
                  opacity: 0.9,
                  textAlign: "center",
                  px: 4,
                }}
              >
                Khám phá nét đẹp Cố đô Huế qua từng không gian kiến trúc tại
                HuếHotel.
              </Typography>
            </Box>
          </Box>
        </Col>
      </Row>
    </div>
  );
};

export default Register;
