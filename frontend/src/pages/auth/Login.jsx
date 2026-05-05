import { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Typography,
  Box,
  Alert,
  Paper,
} from "@mui/material";
// THÊM ICON ArrowBack ở đây:
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

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

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
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err);
      // Tự động xóa lỗi sau 5 giây (5000 milliseconds)
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex bg-light">
      <Row className="w-100 m-0">
        <Col lg={6} className="d-none d-lg-block p-0">
          <Box
            sx={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1350")',
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
                sx={{ color: "#fff" }}
              >
                HUẾHOTEL
              </Typography>
              <Typography
                variant="h6"
                color="white"
                sx={{ mt: 2, color: "#fff" }}
              >
                Trải nghiệm nghỉ dưỡng mang đậm dấu ấn Cố Đô
              </Typography>
            </Box>
          </Box>
        </Col>

        <Col
          lg={6}
          className="d-flex align-items-center justify-content-center p-4"
        >
          <Paper
            elevation={3}
            sx={{ p: 5, borderRadius: 4, width: "100%", maxWidth: "450px" }}
          >
            {/* NÚT QUAY LẠI TRANG CHỦ */}
            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
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
              Đăng Nhập
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              Chào mừng bạn quay trở lại với hệ thống
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

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Địa chỉ Email"
                name="email"
                type="email"
                variant="outlined"
                margin="normal"
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
              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                value={formData.password}
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
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "14px",
                    color: "#1a237e",
                    textDecoration: "none",
                  }}
                >
                  Quên mật khẩu?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="warning"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontWeight: "bold",
                  borderRadius: 2,
                }}
              >
                {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
              </Button>

              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  style={{
                    fontWeight: "bold",
                    color: "#ff9800",
                    textDecoration: "none",
                  }}
                >
                  Đăng ký ngay
                </Link>
              </Typography>
            </form>
          </Paper>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
