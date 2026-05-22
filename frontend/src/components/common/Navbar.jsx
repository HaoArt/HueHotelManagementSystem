import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Container,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useScrollTrigger,
} from "@mui/material";

// Icons
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { AuthContext } from "../../context/AuthContext";
import ConfigService from "../../services/configService";

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

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [hotelName, setHotelName] = useState("HUẾ HOTEL");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hiệu ứng mờ/đổ bóng khi cuộn trang
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20,
  });

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
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    handleClose();
    navigate("/");
  };

  // Logic tạo style cho Link (Hiệu ứng gạch dưới bằng Vàng Gold)
  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? LUXURY.gold : LUXURY.charcoal,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "1px",
      fontSize: "0.85rem",
      textDecoration: "none",
      position: "relative",
      padding: "8px 0",
      transition: "color 0.3s ease",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: 0,
        left: 0,
        width: isActive ? "100%" : "0%",
        height: "2px",
        backgroundColor: LUXURY.gold,
        transition: "width 0.3s ease",
      },
      "&:hover": {
        color: LUXURY.gold,
        "&::after": {
          width: "100%",
        },
      },
    };
  };

  const navLinks = [
    { title: "Trang chủ", path: "/" },
    { title: "Phòng & Suite", path: "/rooms" },
    { title: "Khám phá Huế", path: "/discover-hue" },
    { title: "Liên hệ", path: "/contact" },
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={trigger ? 4 : 0}
        sx={{
          bgcolor: trigger ? "rgba(255,255,255,0.95)" : LUXURY.white,
          backdropFilter: trigger ? "blur(10px)" : "none",
          borderBottom: trigger ? "none" : `1px solid ${LUXURY.softGray}`,
          transition: "all 0.3s ease",
          zIndex: 1100,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ height: 80, justifyContent: "space-between" }}
          >
            {/* 1. BRAND LOGO */}
            <Typography
              component={Link}
              to="/"
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 900,
                color: LUXURY.navy,
                fontSize: { xs: "1.5rem", md: "1.8rem" },
                letterSpacing: "1px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              {hotelName.toUpperCase()}
            </Typography>

            {/* 2. DESKTOP NAVIGATION */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 5,
                alignItems: "center",
              }}
            >
              {navLinks.map((link) => (
                <Box
                  key={link.path}
                  component={Link}
                  to={link.path}
                  sx={getLinkStyle(link.path)}
                >
                  {link.title}
                </Box>
              ))}
            </Box>

            {/* 3. USER ACTIONS & MOBILE TOGGLE */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {user ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={handleClick}
                >
                  <Box
                    sx={{
                      display: { xs: "none", md: "flex" },
                      flexDirection: "row",
                      alignItems: "center",
                      mr: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color={LUXURY.warmGray}
                      fontWeight="700"
                      letterSpacing={1}
                      sx={{ mr: "5px" }}
                    >
                      XIN CHÀO,
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="800"
                      color={LUXURY.charcoal}
                    >
                      {user.full_name?.split(" ").pop()}
                    </Typography>
                  </Box>

                  <Avatar
                    src={user.avatar_url}
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: LUXURY.navy,
                      color: LUXURY.gold,
                      fontWeight: 800,
                      border: `2px solid ${LUXURY.gold}`,
                    }}
                  >
                    {!user.avatar_url &&
                      user.full_name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <KeyboardArrowDownIcon
                    sx={{
                      color: LUXURY.charcoal,
                      ml: 0.5,
                      display: { xs: "none", md: "block" },
                    }}
                  />
                </Box>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate("/login")}
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                    color: LUXURY.white,
                    fontWeight: 800,
                    borderRadius: "12px",
                    px: 3,
                    py: 1.2,
                    textTransform: "none",
                    boxShadow: `0 8px 16px ${LUXURY.gold}40`,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 12px 24px ${LUXURY.gold}60`,
                    },
                  }}
                >
                  Đăng Nhập
                </Button>
              )}

              {/* Mobile Hamburger Icon */}
              <IconButton
                color="inherit"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ display: { md: "none" }, color: LUXURY.charcoal, ml: 1 }}
              >
                <MenuIcon fontSize="large" />
              </IconButton>
            </Box>

            {/* 4. USER DROPDOWN MENU */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 2,
                  minWidth: 240,
                  borderRadius: "16px",
                  border: `1px solid ${LUXURY.softGray}`,
                  boxShadow: "0 24px 48px rgba(26,26,26,0.1)",
                  overflow: "hidden",
                },
              }}
            >
              <Box sx={{ px: 2.5, py: 2, bgcolor: LUXURY.offwhite }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="800"
                  color={LUXURY.charcoal}
                >
                  {user?.full_name}
                </Typography>
                <Typography variant="body2" color={LUXURY.warmGray}>
                  {user?.email}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: LUXURY.softGray }} />

              {(user?.role === "Admin" || user?.role === "Receptionist") && (
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/dashboard");
                  }}
                  sx={{ py: 1.5, "&:hover": { bgcolor: `${LUXURY.gold}15` } }}
                >
                  <ListItemIcon>
                    <DashboardIcon
                      fontSize="small"
                      sx={{ color: LUXURY.navy }}
                    />
                  </ListItemIcon>
                  <Typography
                    variant="body2"
                    fontWeight="700"
                    color={LUXURY.charcoal}
                  >
                    Trang Quản Trị
                  </Typography>
                </MenuItem>
              )}

              {(user?.role === "Customer" || !user?.role) && (
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/profile");
                  }}
                  sx={{ py: 1.5, "&:hover": { bgcolor: `${LUXURY.gold}15` } }}
                >
                  <ListItemIcon>
                    <AccountCircleIcon
                      fontSize="small"
                      sx={{ color: LUXURY.navy }}
                    />
                  </ListItemIcon>
                  <Typography
                    variant="body2"
                    fontWeight="700"
                    color={LUXURY.charcoal}
                  >
                    Hồ Sơ & Lịch sử lưu trú
                  </Typography>
                </MenuItem>
              )}

              <Divider sx={{ borderColor: LUXURY.softGray }} />

              <MenuItem
                onClick={handleLogout}
                sx={{ py: 1.5, "&:hover": { bgcolor: "#fee2e2" } }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography color="error" variant="body2" fontWeight="800">
                  Đăng Xuất
                </Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      {/* 5. MOBILE DRAWER MENU */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{ sx: { width: 280, bgcolor: LUXURY.white } }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ color: LUXURY.charcoal }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ px: 2 }}>
          {navLinks.map((link) => (
            <ListItem
              button
              key={link.title}
              component={Link}
              to={link.path}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: "12px",
                mb: 1,
                bgcolor:
                  location.pathname === link.path
                    ? `${LUXURY.gold}15`
                    : "transparent",
              }}
            >
              <ListItemText
                primary={link.title}
                primaryTypographyProps={{
                  fontWeight: location.pathname === link.path ? 800 : 600,
                  color:
                    location.pathname === link.path
                      ? LUXURY.gold
                      : LUXURY.charcoal,
                  textTransform: "uppercase",
                  fontSize: "0.9rem",
                }}
              />
            </ListItem>
          ))}
          {!user && (
            <ListItem sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  handleDrawerToggle();
                  navigate("/login");
                }}
                sx={{
                  background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                  color: LUXURY.white,
                  fontWeight: 800,
                  py: 1.5,
                  borderRadius: "12px",
                }}
              >
                ĐĂNG NHẬP
              </Button>
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Header;
