import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

// Icons
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import PeopleIcon from "@mui/icons-material/People";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import LogoutIcon from "@mui/icons-material/Logout";
import DiscountIcon from "@mui/icons-material/Discount";
import SettingsIcon from "@mui/icons-material/Settings";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import { AuthContext } from "../../../context/AuthContext";

const drawerWidth = 280;

const COLORS = {
  sidebarBg: "#2b1977",
  activeBg: "rgba(255, 255, 255, 0.12)",
  accent: "#4db6ac",
  textMain: "#ffffff",
  textMuted: "rgba(255, 255, 255, 0.75)",
};

const menuItems = [
  { text: "Tổng quan", icon: <DashboardIcon />, path: "/dashboard" },
  {
    text: "Quản lý Đặt phòng",
    icon: <BookOnlineIcon />,
    path: "/dashboard/bookings",
  },
  { text: "Sơ đồ Phòng", icon: <MeetingRoomIcon />, path: "/dashboard/rooms" },

  {
    text: "Phòng & Loại phòng",
    icon: <SettingsIcon />,
    path: "/dashboard/room-settings",
  },
  {
    text: "Dịch vụ & Tiện ích",
    icon: <RoomServiceIcon />,
    path: "/dashboard/services",
  },
  {
    text: "Phiếu giảm giá",
    icon: <DiscountIcon />,
    path: "/dashboard/coupon",
  },
  { text: "Khách hàng", icon: <PeopleIcon />, path: "/dashboard/customers" },

  {
    text: "Khách hàng liên hệ",
    icon: <ContactMailIcon />,
    path: "/dashboard/contacts",
  },
  {
    text: "Giá động theo mùa",
    icon: <PriceChangeIcon />,
    path: "/dashboard/pricing",
  },
  {
    text: "Nhật kí hệ thống",
    icon: <EditCalendarIcon />,
    path: "/dashboard/audit",
  },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const drawerContent = (
    <Box
      sx={{
        bgcolor: COLORS.sidebarBg,
        height: "100%",
        color: COLORS.textMain,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* HEADER LOGO ĐÃ THU GỌN CHIỀU CAO */}
      <Toolbar
        sx={{
          minHeight: "48px !important",
          mt: 2,
          mb: 1,
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6" // Giảm từ h5 xuống h6
          fontWeight="900"
          sx={{ letterSpacing: "1px", color: "white" }}
        >
          HUẾ HOTEL
        </Typography>
      </Toolbar>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 1 }} />

      {/* DANH SÁCH MENU */}
      <List
        sx={{
          flexGrow: 1,
          px: 2,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: "4px",
          },
        }}
      >
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem
              key={item.text}
              disablePadding
              sx={{ mb: 0.25 }} // Giảm margin bottom để thu gọn khoảng cách
            >
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={handleDrawerToggle}
                sx={{
                  borderRadius: "6px",
                  bgcolor: isActive ? COLORS.activeBg : "transparent",
                  color: isActive ? "white" : COLORS.textMuted,
                  borderLeft: isActive
                    ? `4px solid ${COLORS.accent}`
                    : "4px solid transparent",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.08)",
                    color: "white",
                    "& .MuiListItemIcon-root": { color: "white" },
                  },
                  py: 0.8, // Giảm padding dọc (top, bottom)
                  px: 2,
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? COLORS.accent : COLORS.textMuted,
                    minWidth: "36px", // Giảm khoảng cách giữa icon và chữ một chút
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? "bold" : "500",
                    fontSize: "0.9rem", // Thu nhỏ font-size chút xíu
                    whiteSpace: "nowrap",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* NÚT ĐĂNG XUẤT */}
      <Box sx={{ p: 2, pt: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "6px",
              bgcolor: "#d32f2f",
              color: "#ffffff",
              "&:hover": { bgcolor: "#b71c1c" },
              py: 1, // Giảm độ dày nút
              px: 2,
            }}
          >
            <ListItemIcon sx={{ color: "#ffffff", minWidth: "36px" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Đăng xuất"
              primaryTypographyProps={{
                fontWeight: "bold",
                fontSize: "0.9rem",
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
