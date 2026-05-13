import { useState, useContext, useEffect } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import {
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  IconButton,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Icons
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { AuthContext } from "../../context/AuthContext";
import ConfigService from "../../services/configService";

// Đồng bộ Theme Colors
const COLORS = {
  primary: "#5e35b1",
  primaryDark: "#4527a0",
  primaryLight: "#ede7f6",
  border: "#e0e0e0",
  textMain: "#333333",
  textSecondary: "#666666",
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [hotelName, setHotelName] = useState("HUẾ HOTEL");

  useEffect(() => {
    const fetchHotelName = async () => {
      try {
        const name = await ConfigService.getConfigByKey("hotel_name");
        if (name) setHotelName(name);
      } catch (error) {
        console.error("Lỗi tải tên khách sạn:", error);
      }
    };
    fetchHotelName();
  }, []);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? COLORS.primary : COLORS.textMain,
      fontWeight: isActive ? "700" : "500",
      borderBottom: isActive
        ? `2px solid ${COLORS.primary}`
        : "2px solid transparent",
      paddingBottom: "4px",
      transition: "all 0.2s ease",
      textDecoration: "none",
    };
  };

  return (
    <Navbar
      bg="white"
      expand="lg"
      className="sticky-top py-3"
      style={{ borderBottom: `1px solid ${COLORS.border}` }}
    >
      <Container>
        {/* ĐÃ SỬA: Hiển thị tên khách sạn lấy từ Database */}
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            color: COLORS.primary,
            fontWeight: "900",
            letterSpacing: "1px",
            fontSize: "1.5rem",
          }}
        >
          {hotelName.toUpperCase()}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto me-4 align-items-center gap-3">
            <Nav.Link as={Link} to="/" style={getLinkStyle("/")}>
              Trang chủ
            </Nav.Link>
            <Nav.Link as={Link} to="/rooms" style={getLinkStyle("/rooms")}>
              Phòng & Suite
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/discover-hue"
              style={getLinkStyle("/discover-hue")}
            >
              Khám phá Huế
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" style={getLinkStyle("/contact")}>
              Liên hệ
            </Nav.Link>
          </Nav>

          {user ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body2"
                fontWeight="bold"
                color={COLORS.textMain}
                sx={{ mr: 1, display: { xs: "none", md: "block" } }}
              >
                Xin chào, {user.full_name?.split(" ").pop()}
              </Typography>

              <IconButton onClick={handleClick} size="small" sx={{ ml: 1 }}>
                <Avatar
                  src={user.avatar_url}
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: COLORS.primaryLight,
                    color: COLORS.primary,
                    fontWeight: "bold",
                  }}
                >
                  {!user.avatar_url && user.full_name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    mt: 1.5,
                    minWidth: 220,
                    borderRadius: "12px",
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color={COLORS.textMain}
                  >
                    {user.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: COLORS.border }} />

                {(user.role === "Admin" || user.role === "Receptionist") && (
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate("/dashboard");
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <DashboardIcon
                        fontSize="small"
                        sx={{ color: COLORS.primary }}
                      />
                    </ListItemIcon>
                    <Typography variant="body2" fontWeight="500">
                      Trang quản trị
                    </Typography>
                  </MenuItem>
                )}

                {(user.role === "Customer" || !user.role) && (
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate("/profile");
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <AccountCircleIcon
                        fontSize="small"
                        sx={{ color: COLORS.textSecondary }}
                      />
                    </ListItemIcon>
                    <Typography variant="body2" fontWeight="500">
                      Lịch sử đặt phòng
                    </Typography>
                  </MenuItem>
                )}

                <Divider sx={{ borderColor: COLORS.border }} />

                <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography color="error" variant="body2" fontWeight="bold">
                    Đăng xuất
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              variant="contained"
              disableElevation
              startIcon={<LoginIcon />}
              onClick={() => navigate("/login")}
              sx={{
                bgcolor: COLORS.primary,
                fontWeight: "bold",
                borderRadius: "8px",
                textTransform: "none",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: COLORS.primaryDark },
              }}
            >
              Đăng nhập
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
