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
import SettingsIcon from "@mui/icons-material/Settings";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import { AuthContext } from "../../../context/AuthContext";

const drawerWidth = 260;

const menuItems = [
  { text: "Tổng quan", icon: <DashboardIcon />, path: "/dashboard" },
  {
    text: "Quản lý Đặt phòng",
    icon: <BookOnlineIcon />,
    path: "/dashboard/bookings",
  },
  { text: "Sơ đồ Phòng", icon: <MeetingRoomIcon />, path: "/dashboard/rooms" },
  {
    text: "Dịch vụ & Tiện ích",
    icon: <RoomServiceIcon />,
    path: "/dashboard/services",
  },
  {
    text: "Phòng & Loại phòng",
    icon: <SettingsIcon />,
    path: "/dashboard/room-settings",
  },
  { text: "Khách hàng", icon: <PeopleIcon />, path: "/dashboard/customers" },

  {
    text: "Khách hàng liên hệ",
    icon: <ContactMailIcon />,
    path: "/dashboard/contacts",
  },
  {
    text: "Nhật kí kiểm duyệt",
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
        // bgcolor: "#1a237e",
        background: "linear-gradient(180deg, #1e3a8a 0%, #1a237e 100%)",
        height: "100%",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar sx={{ my: 2, justifyContent: "center" }}>
        <Typography variant="h5" fontWeight="bold" color="warning.main">
          HUẾ HOTEL
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={handleDrawerToggle} // Đóng sidebar trên mobile khi bấm link
              sx={{
                "&.Mui-selected": {
                  bgcolor: "rgba(255, 152, 0, 0.15)",
                  borderRight: "4px solid #ff9800",
                  "&:hover": { bgcolor: "rgba(255, 152, 0, 0.25)" },
                },
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.08)" },
                py: 1.5,
                px: 3,
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? "#ff9800" : "white",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            bgcolor: "rgba(211, 47, 47, 0.1)",
            "&:hover": { bgcolor: "rgba(211, 47, 47, 0.2)" },
          }}
        >
          <ListItemIcon sx={{ color: "#f44336" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Đăng xuất" sx={{ color: "#f44336" }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Bản Mobile (Ẩn hiện khi bấm nút Hamburger) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Bản Desktop (Lúc nào cũng hiện) */}
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
