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
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
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

// Style cho ô nhập liệu chuẩn 5 sao (Đã thu gọn để tránh scroll)
const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    bgcolor: LUXURY.offwhite,
    transition: "all 0.3s ease",
    "& fieldset": { borderColor: "transparent" },
    "&:hover fieldset": { borderColor: `${LUXURY.gold}80` },
    "&.Mui-focused fieldset": { borderColor: LUXURY.gold, borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": {
    color: LUXURY.warmGray,
    fontSize: "0.9rem",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: LUXURY.gold,
    fontWeight: "bold",
  },
};

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    identity_number: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State cho quy định khách sạn
  const [agreed, setAgreed] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handlePreRegister = async (e) => {
    e.preventDefault();

    if (!agreed) {
      return setError("Vui lòng đọc và đồng ý với các quy định của khách sạn.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError(
        "Định dạng email không hợp lệ (VD: nguyenvan@gmail.com).",
      );
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone)) {
      return setError(
        "Số điện thoại không hợp lệ (Phải có 10 số và bắt đầu bằng 03, 05, 07, 08 hoặc 09).",
      );
    }

    const identityRegex = /^\d{12}$/;
    if (!identityRegex.test(formData.identity_number)) {
      return setError(
        "Số CCCD phải bao gồm chính xác 12 chữ số (không chứa chữ cái).",
      );
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setError(
        "Mật khẩu yếu! Phải từ 8 ký tự, gồm chữ HOA, thường, số và ký tự đặc biệt (@$!%*?&).",
      );
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp!");
    }

    setLoading(true);
    try {
      await AuthService.preRegister({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        identity_number: formData.identity_number,
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
      await AuthService.verifyAndCreate(formData.email, otp);
      setSuccess("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err || "Mã OTP không chính xác hoặc đã hết hạn.");
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
      {/* =========================================================
          CỘT TRÁI: HÌNH ẢNH BANNER (ZIGZAG)
          ========================================================= */}
      <Box
        sx={{
          flex: { xs: "0", md: "1 1 50%" },
          display: { xs: "none", md: "block" },
          position: "relative",
          backgroundImage:
            'url("https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1920")',
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
                  letterSpacing: "2px",
                  mb: 2,
                  textShadow: "0 10px 30px rgba(0,0,0,0.5)",
                }}
              >
                Tạo Dấu Ấn Riêng
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: LUXURY.goldLight,
                  fontWeight: 400,
                  letterSpacing: "1.5px",
                  maxWidth: "500px",
                  mx: "auto",
                  lineHeight: 1.8,
                }}
              >
                Khám phá nét đẹp Cố đô Huế qua từng không gian kiến trúc tại Huế
                Hotel.
              </Typography>
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* =========================================================
          CỘT PHẢI: FORM ĐĂNG KÝ (ĐÃ LÀM GỌN ANTI-SCROLL)
          ========================================================= */}
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
              maxWidth: "550px",
              border: `1px solid ${LUXURY.softGray}`,
              boxShadow: "0 20px 40px rgba(26,26,26,0.04)",
              bgcolor: LUXURY.white,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}>
              <Button
                component={Link}
                to="/"
                startIcon={<ArrowBack />}
                size="small"
                sx={{
                  color: LUXURY.warmGray,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { color: LUXURY.gold, bgcolor: "transparent" },
                }}
              >
                Trang chủ
              </Button>
            </Box>

            <Typography
              variant="h4"
              align="center"
              sx={{
                color: LUXURY.navy,
                fontFamily: '"Playfair Display", serif',
                fontWeight: 900,
                mb: 0.5,
              }}
            >
              {step === 1 ? "Đăng Ký" : "Xác Thực"}
            </Typography>
            <Typography
              variant="body2"
              align="center"
              sx={{ color: LUXURY.warmGray, mb: 2 }}
            >
              {step === 1
                ? "Tạo tài khoản để trải nghiệm dịch vụ đẳng cấp"
                : `Chúng tôi đã gửi mã xác thực đến email ${formData.email}`}
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2, py: 0, borderRadius: "8px" }}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert
                severity="success"
                sx={{ mb: 2, py: 0, borderRadius: "8px" }}
              >
                {success}
              </Alert>
            )}

            {step === 1 ? (
              <form onSubmit={handlePreRegister}>
                <Stack spacing={2}>
                  {/* HỌ TÊN */}
                  <TextField
                    fullWidth
                    size="small"
                    label="Họ và Tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person
                            fontSize="small"
                            sx={{ color: LUXURY.gold }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* EMAIL */}
                  <TextField
                    fullWidth
                    size="small"
                    label="Địa chỉ Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email fontSize="small" sx={{ color: LUXURY.gold }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* ĐIỆN THOẠI & CCCD (CHIA ĐÔI) */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Số điện thoại"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      sx={inputStyle}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone
                              fontSize="small"
                              sx={{ color: LUXURY.gold }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Số CMND/CCCD (12 số)"
                      name="identity_number"
                      value={formData.identity_number}
                      onChange={handleChange}
                      inputProps={{ maxLength: 12 }}
                      required
                      sx={inputStyle}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon
                              fontSize="small"
                              sx={{ color: LUXURY.gold }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* MẬT KHẨU & XÁC NHẬN (CHIA ĐÔI) */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Mật khẩu"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      sx={inputStyle}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock
                              fontSize="small"
                              sx={{ color: LUXURY.gold }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: LUXURY.warmGray }}
                            >
                              {showPassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Xác nhận mật khẩu"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      sx={inputStyle}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock
                              fontSize="small"
                              sx={{ color: LUXURY.gold }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                              sx={{ color: LUXURY.warmGray }}
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: LUXURY.warmGray,
                      ml: 1,
                      mt: "0px !important",
                      fontSize: "0.75rem",
                    }}
                  >
                    * Mật khẩu từ 8 ký tự, gồm chữ Hoa, thường, số, ký tự đặc
                    biệt.
                  </Typography>

                  {/* CHECKBOX QUY ĐỊNH */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={agreed}
                        onChange={(e) => {
                          setAgreed(e.target.checked);
                          setError("");
                        }}
                        sx={{
                          color: LUXURY.softGray,
                          "&.Mui-checked": { color: LUXURY.gold },
                        }}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{ color: LUXURY.charcoal, fontSize: "0.85rem" }}
                      >
                        Tôi đã đọc và đồng ý với{" "}
                        <Box
                          component="span"
                          onClick={() => setOpenTerms(true)}
                          sx={{
                            color: LUXURY.navy,
                            fontWeight: "bold",
                            cursor: "pointer",
                            textDecoration: "underline",
                            "&:hover": { color: LUXURY.gold },
                          }}
                        >
                          quy định của khách sạn
                        </Box>
                      </Typography>
                    }
                    sx={{ mt: "-5px !important", ml: 0 }}
                  />
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    mb: 1.5,
                    py: 1.2,
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
                  {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ TÀI KHOẢN"}
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
                  sx={inputStyle}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: "center",
                      fontSize: "1.5rem",
                      letterSpacing: "10px",
                      fontWeight: "bold",
                      color: LUXURY.charcoal,
                    },
                  }}
                  required
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 1.5,
                    py: 1.2,
                    fontWeight: "800",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                    color: LUXURY.white,
                    boxShadow: `0 8px 20px ${LUXURY.gold}40`,
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  {loading ? "ĐANG XÁC THỰC..." : "XÁC NHẬN MÃ OTP"}
                </Button>
                <Button
                  variant="text"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  sx={{
                    mt: 1,
                    width: "100%",
                    fontWeight: "700",
                    color: LUXURY.warmGray,
                  }}
                >
                  Quay lại
                </Button>
              </form>
            )}

            {step === 1 && (
              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 1, color: LUXURY.charcoal }}
              >
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  style={{
                    fontWeight: "800",
                    color: LUXURY.gold,
                    textDecoration: "none",
                  }}
                >
                  Đăng nhập ngay
                </Link>
              </Typography>
            )}
          </Paper>
        </Fade>
      </Box>

      {/* =========================================================
          DIALOG: QUY ĐỊNH KHÁCH SẠN
          ========================================================= */}
      <Dialog
        open={openTerms}
        onClose={() => setOpenTerms(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", bgcolor: LUXURY.offwhite } }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 900,
            color: LUXURY.navy,
            textAlign: "center",
            fontSize: "1.8rem",
            pt: 3,
          }}
        >
          Quy Định Khách Sạn
        </DialogTitle>
        <Divider sx={{ borderColor: LUXURY.softGray }} />
        <DialogContent sx={{ px: 4, py: 3 }}>
          <Typography
            variant="subtitle1"
            fontWeight="800"
            color={LUXURY.charcoal}
            gutterBottom
          >
            1. Thời gian Nhận / Trả phòng
          </Typography>
          <Typography
            variant="body2"
            color={LUXURY.warmGray}
            paragraph
            sx={{ lineHeight: 1.8 }}
          >
            - Giờ nhận phòng (Check-in) quy định là từ <b>14:00</b>.<br />- Giờ
            trả phòng (Check-out) quy định là trước <b>12:00</b> trưa.
            <br />
            Việc nhận phòng sớm hoặc trả phòng trễ sẽ tùy thuộc vào tình trạng
            phòng trống và có thể phát sinh phụ phí.
          </Typography>

          <Typography
            variant="subtitle1"
            fontWeight="800"
            color={LUXURY.charcoal}
            gutterBottom
          >
            2. Quy định Lưu trú
          </Typography>
          <Typography
            variant="body2"
            color={LUXURY.warmGray}
            paragraph
            sx={{ lineHeight: 1.8 }}
          >
            - Vui lòng xuất trình Căn cước công dân hoặc Hộ chiếu khi làm thủ
            tục nhận phòng.
            <br />
            - Tuyệt đối nghiêm cấm mang theo vũ khí, chất cháy nổ, ma túy và thú
            cưng vào khuôn viên khách sạn.
            <br />- Khách sạn là không gian không hút thuốc (ngoại trừ khu vực
            ban công hoặc khu vực được chỉ định).
          </Typography>

          <Typography
            variant="subtitle1"
            fontWeight="800"
            color={LUXURY.charcoal}
            gutterBottom
          >
            3. Tài sản và Trách nhiệm
          </Typography>
          <Typography
            variant="body2"
            color={LUXURY.warmGray}
            paragraph
            sx={{ lineHeight: 1.8 }}
          >
            Mọi hư hỏng đối với tài sản, trang thiết bị trong phòng do lỗi của
            quý khách sẽ được yêu cầu bồi thường theo đúng bảng giá quy định của
            khách sạn.
          </Typography>
        </DialogContent>
        <Divider sx={{ borderColor: LUXURY.softGray }} />
        <DialogActions sx={{ p: 3, justifyContent: "center" }}>
          <Button
            onClick={() => {
              setAgreed(true);
              setOpenTerms(false);
            }}
            variant="contained"
            sx={{
              background: LUXURY.navy,
              color: LUXURY.gold,
              fontWeight: "800",
              borderRadius: "10px",
              px: 4,
              "&:hover": { background: "black" },
            }}
          >
            TÔI ĐÃ ĐỌC VÀ ĐỒNG Ý
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Register;
