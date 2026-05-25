import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Fade,
} from "@mui/material";

import {
  ArrowBack,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import AuthService from "../../services/authService";


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

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    bgcolor: LUXURY.offwhite,
    transition: "all 0.3s ease",
    "& fieldset": { borderColor: LUXURY.softGray },
    "&:hover fieldset": { borderColor: `${LUXURY.gold}80` },
    "&.Mui-focused fieldset": { borderColor: LUXURY.gold, borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": { color: LUXURY.warmGray, fontSize: "0.9rem" },
  "& .MuiInputLabel-root.Mui-focused": {
    color: LUXURY.gold,
    fontWeight: "bold",
  },
};

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();


  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError("Định dạng email không hợp lệ.");
    }

    setLoading(true);
    try {
      await AuthService.forgotPassword(email);
      setSuccess("Mã OTP khôi phục đã được gửi đến email của bạn.");
      setStep(2); 
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Có lỗi xảy ra, vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };


  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      return setError("Mã OTP phải bao gồm 6 chữ số.");
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return setError(
        "Mật khẩu yếu! Phải từ 8 ký tự, gồm chữ Hoa, thường, số và ký tự đặc biệt (@$!%*?&).",
      );
    }

    if (newPassword !== confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp!");
    }

    setLoading(true);
    try {
      await AuthService.verifyForgotPassword({
        email,
        otp_code: otp,
        new_password: newPassword,
      });
      setSuccess("Đổi mật khẩu thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Mã OTP không chính xác hoặc đã hết hạn.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        width: "100%",
        bgcolor: LUXURY.white,
      }}
    >
  
      <Box
        sx={{
          flex: { xs: "0", md: "1 1 50%" },
          display: { xs: "none", md: "block" },
          position: "relative",
          backgroundImage:
            'url("https://images.unsplash.com/photo-1551882547-ff40c6d5e266?w=1920")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, rgba(27,45,79,0.9) 0%, rgba(26,26,26,0.6) 100%)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            px: 6,
          }}
        >
          <Fade in={true} timeout={1000}>
            <Box>
              <Typography
                variant="h1"
                sx={{
                  color: LUXURY.white,
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 900,
                  mb: 2,
                }}
              >
                Trợ Giúp Nhanh Chóng
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: LUXURY.goldLight,
                  fontWeight: 400,
                  maxWidth: "500px",
                  mx: "auto",
                  lineHeight: 1.8,
                }}
              >
                Đừng lo lắng! Chúng tôi sẽ giúp bạn khôi phục quyền truy cập vào
                tài khoản một cách an toàn nhất.
              </Typography>
            </Box>
          </Fade>
        </Box>
      </Box>

   
      <Box
        sx={{
          flex: { xs: "1 1 100%", md: "1 1 50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 4 },
        }}
      >
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "24px",
              width: "100%",
              maxWidth: "500px",
              border: `1px solid ${LUXURY.softGray}`,
              boxShadow: "0 20px 40px rgba(26,26,26,0.04)",
              bgcolor: LUXURY.white,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
              <Button
                component={Link}
                to="/login"
                startIcon={<ArrowBack />}
                size="small"
                sx={{
                  color: LUXURY.warmGray,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { color: LUXURY.gold, bgcolor: "transparent" },
                }}
              >
                Quay lại Đăng nhập
              </Button>
            </Box>

            <Typography
              variant="h4"
              align="center"
              sx={{
                color: LUXURY.navy,
                fontFamily: '"Playfair Display", serif',
                fontWeight: 900,
                mb: 1,
              }}
            >
              {step === 1 ? "Quên Mật Khẩu?" : "Tạo Mật Khẩu Mới"}
            </Typography>
            <Typography
              variant="body2"
              align="center"
              sx={{ color: LUXURY.warmGray, mb: 3 }}
            >
              {step === 1
                ? "Vui lòng nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi mã xác thực (OTP) để đặt lại mật khẩu."
                : `Mã xác thực 6 số đã được gửi đến email ${email}. Vui lòng kiểm tra hộp thư.`}
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
              <form onSubmit={handleRequestOTP}>
                <TextField
                  fullWidth
                  label="Nhập địa chỉ Email của bạn"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                  sx={inputStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: LUXURY.gold }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 4,
                    mb: 1,
                    py: 1.5,
                    fontWeight: "800",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                    color: LUXURY.white,
                    boxShadow: `0 8px 20px ${LUXURY.gold}40`,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 12px 24px ${LUXURY.gold}60`,
                    },
                  }}
                >
                  {loading ? "ĐANG XỬ LÝ..." : "GỬI MÃ XÁC THỰC OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Nhập mã OTP 6 số"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setError("");
                    }}
                    sx={inputStyle}
                    inputProps={{
                      maxLength: 6,
                      style: {
                        textAlign: "center",
                        fontSize: "1.2rem",
                        letterSpacing: "10px",
                        fontWeight: "bold",
                        color: LUXURY.charcoal,
                      },
                    }}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Mật khẩu mới"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    required
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: LUXURY.gold }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: LUXURY.warmGray }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu mới"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    required
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: LUXURY.gold }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                            sx={{ color: LUXURY.warmGray }}
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
                  <Typography
                    variant="caption"
                    sx={{ color: LUXURY.warmGray, ml: 1, mt: "0px !important" }}
                  >
                    * Mật khẩu phải từ 8 ký tự, gồm chữ Hoa, thường, số, ký tự
                    đặc biệt.
                  </Typography>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 4,
                    mb: 1.5,
                    py: 1.5,
                    fontWeight: "800",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                    color: LUXURY.white,
                    boxShadow: `0 8px 20px ${LUXURY.gold}40`,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 12px 24px ${LUXURY.gold}60`,
                    },
                  }}
                >
                  {loading ? "ĐANG XÁC THỰC..." : "CẬP NHẬT MẬT KHẨU"}
                </Button>
                <Button
                  variant="text"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  sx={{
                    width: "100%",
                    fontWeight: "700",
                    color: LUXURY.warmGray,
                  }}
                >
                  Nhập lại Email
                </Button>
              </form>
            )}
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
