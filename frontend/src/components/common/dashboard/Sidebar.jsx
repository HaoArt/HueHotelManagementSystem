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

// ĐÃ THÊM: Định nghĩa rõ quyền truy cập (roles) cho từng menu
const menuItems = [
  {
    text: "Tổng quan",
    icon: <DashboardIcon />,
    path: "/dashboard",
    roles: ["Admin", "Receptionist"],
  },
  {
    text: "Quản lý đơn đặt phòng",
    icon: <BookOnlineIcon />,
    path: "/dashboard/bookings",
    roles: ["Admin", "Receptionist"],
  },
  {
    text: "Sơ đồ Phòng",
    icon: <MeetingRoomIcon />,
    path: "/dashboard/rooms",
    roles: ["Admin", "Receptionist"],
  },

  // CÁC CHỨC NĂNG CẤU HÌNH (Chỉ Admin mới được thấy)
  {
    text: "Phòng & Loại phòng",
    icon: <SettingsIcon />,
    path: "/dashboard/room-settings",
    roles: ["Admin"],
  },
  {
    text: "Dịch vụ & Tiện ích",
    icon: <RoomServiceIcon />,
    path: "/dashboard/services",
    roles: ["Admin"],
  },
  {
    text: "Phiếu giảm giá",
    icon: <DiscountIcon />,
    path: "/dashboard/coupon",
    roles: ["Admin"],
  },
  {
    text: "Quản lý tài khoản",
    icon: <PeopleIcon />,
    path: "/dashboard/customers",
    roles: ["Admin", "Receptionist"],
  },

  {
    text: "Khách hàng liên hệ",
    icon: <ContactMailIcon />,
    path: "/dashboard/contacts",
    roles: ["Admin", "Receptionist"],
  },
  {
    text: "Giá động theo mùa",
    icon: <PriceChangeIcon />,
    path: "/dashboard/pricing",
    roles: ["Admin"],
  },
  {
    text: "Cấu hình hệ thống",
    icon: <SettingsIcon />,
    path: "/dashboard/system-config",
    roles: ["Admin"],
  },
  {
    text: "Nhật kí hệ thống",
    icon: <EditCalendarIcon />,
    path: "/dashboard/audit",
    roles: ["Admin"],
  },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  // ĐÃ SỬA: Lấy thêm thuộc tính 'user' từ AuthContext để check role
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  // TỰ ĐỘNG LỌC MENU DỰA TRÊN ROLE CỦA USER ĐANG ĐĂNG NHẬP
  const allowedMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

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
      <Toolbar
        sx={{
          minHeight: "48px !important",
          mt: 2,
          mb: 1,
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          fontWeight="900"
          sx={{ letterSpacing: "1px", color: "white" }}
        >
          HUẾ HOTEL
        </Typography>
      </Toolbar>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 1 }} />

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
        {allowedMenuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
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
                  py: 0.8,
                  px: 2,
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? COLORS.accent : COLORS.textMuted,
                    minWidth: "36px",
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? "bold" : "500",
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, pt: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "6px",
              bgcolor: "#d32f2f",
              color: "#ffffff",
              "&:hover": { bgcolor: "#b71c1c" },
              py: 1,
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
