import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Typography,
  Box,
  Alert,
  Paper,
  Fade,
} from "@mui/material";


import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowBack,
} from "@mui/icons-material";

import AuthService from "../../services/authService";
import { jwtDecode } from "jwt-decode";
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


const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    bgcolor: LUXURY.offwhite,
    transition: "all 0.3s ease",
    "& fieldset": { borderColor: "LUXURY.softGray" },
    "&:hover fieldset": { borderColor: `${LUXURY.gold}80` },
    "&.Mui-focused fieldset": { borderColor: LUXURY.gold, borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": {
    color: LUXURY.warmGray,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: LUXURY.gold,
    fontWeight: "bold",
  },
};

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await AuthService.login(formData.email, formData.password);
      localStorage.setItem("token", data.token);

      const decodedToken = jwtDecode(data.token);
      const userInfo = {
        ...data.user,
        role: decodedToken.role,
      };

      setUser(userInfo);

      if (
        decodedToken.role === "Admin" ||
        decodedToken.role === "Receptionist"
      ) {
        navigate("/dashboard", { replace: true });
      } else {
  
        if (from.startsWith("/dashboard")) {
          navigate("/", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError(err);
      setTimeout(() => {
        setError("");
      }, 5000);
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
          flex: { xs: "1 1 100%", md: "1 1 50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, md: 6 },
        }}
      >
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: "24px",
              width: "100%",
              maxWidth: "480px",
              border: `1px solid ${LUXURY.softGray}`,
              boxShadow: "0 24px 48px rgba(26,26,26,0.06)",
              bgcolor: LUXURY.white,
            }}
          >
                        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 4 }}>
              <Button
                component={Link}
                to="/"
                startIcon={<ArrowBack />}
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
              variant="h3"
              align="center"
              sx={{
                color: LUXURY.navy,
                fontFamily: '"Playfair Display", serif',
                fontWeight: 900,
                mb: 1,
              }}
            >
              Đăng Nhập
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{ color: LUXURY.warmGray, mb: 4 }}
            >
              Chào mừng bạn quay trở lại với hệ thống
            </Typography>

            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{ mb: 4, borderRadius: "12px" }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Địa chỉ Email"
                name="email"
                type="email"
                margin="normal"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ ...inputStyle, borderColor: LUXURY.gold }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: LUXURY.gold }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type={showPassword ? "text" : "password"}
                margin="normal"
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ ...inputStyle, mt: 3, borderColor: LUXURY.gold }}
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

              <Box
                sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}
              >
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "0.9rem",
                    color: LUXURY.navy,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Quên mật khẩu?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 5,
                  mb: 3,
                  py: 1.8,
                  fontWeight: "800",
                  borderRadius: "12px",
                  fontSize: "1.05rem",
                  background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                  color: LUXURY.white,
                  boxShadow: `0 8px 24px ${LUXURY.gold}40`,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 12px 32px ${LUXURY.gold}60`,
                  },
                }}
              >
                {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐĂNG NHẬP"}
              </Button>

              <Typography
                variant="body1"
                align="center"
                sx={{ color: LUXURY.charcoal }}
              >
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  style={{
                    fontWeight: "800",
                    color: LUXURY.gold,
                    textDecoration: "none",
                  }}
                >
                  Đăng ký ngay
                </Link>
              </Typography>
            </form>
          </Paper>
        </Fade>
      </Box>


      <Box
        sx={{
          flex: { xs: "0", md: "1 1 50%" },
          display: { xs: "none", md: "block" },
          position: "relative",
          backgroundImage:
            'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920")',
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
                  letterSpacing: "4px",
                  mb: 2,
                  textShadow: "0 10px 30px rgba(0,0,0,0.5)",
                }}
              >
                HUẾ HOTEL
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: LUXURY.goldLight,
                  fontWeight: 400,
                  letterSpacing: "2px",
                  maxWidth: "500px",
                  mx: "auto",
                  lineHeight: 1.8,
                }}
              >
                Nơi di sản hội tụ cùng đẳng cấp nghỉ dưỡng. Trải nghiệm không
                gian Đông Dương sang trọng.
              </Typography>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
