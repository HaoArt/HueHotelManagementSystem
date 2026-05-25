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
  Chip,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";


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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { AuthContext } from "../../../context/AuthContext";

const drawerWidth = 284;
const collapsedDrawerWidth = 92;

const COLORS = {
  sidebarBg:
    "linear-gradient(180deg, rgba(11,27,63,0.94) 0%, rgba(14,34,76,0.92) 52%, rgba(10,22,51,0.95) 100%)",
  activeBg:
    "linear-gradient(90deg, rgba(0,150,136,0.26) 0%, rgba(255,255,255,0.16) 100%)",
  activeGlow: "rgba(0, 150, 136, 0.42)",
  accent: "#009688",
  textMain: "#ffffff",
  textMuted: "rgba(235, 242, 255, 0.8)",
};

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

const Sidebar = ({
  mobileOpen,
  handleDrawerToggle,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();

  const isCompactScreen = useMediaQuery(muiTheme.breakpoints.down("lg"));


  const currentCollapsed = isCollapsed || isCompactScreen;

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  const allowedMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  const toggleDesktopCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const drawerContent = (
    <Box
      sx={{
        background: COLORS.sidebarBg,
        height: "100%",
        color: COLORS.textMain,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        backdropFilter: "blur(14px)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -120,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,150,136,0.3) 0%, rgba(0,150,136,0) 70%)",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          left: -70,
          bottom: -90,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
        },
      }}
    >
      <Toolbar
        sx={{
          minHeight: "68px !important",
          mt: 1.75,
          mb: 0.75,
          px: currentCollapsed ? 1.25 : 2.25,
          justifyContent: currentCollapsed ? "center" : "space-between",
          alignItems: "center",
          transition: "padding 0.24s ease",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            fontWeight={800}
            sx={{
              letterSpacing: "0.06em",
              color: "white",
              lineHeight: 1.1,
              fontSize: currentCollapsed ? "0.95rem" : "1.02rem",
              textAlign: currentCollapsed ? "center" : "left",
            }}
          >
            {currentCollapsed ? "HH" : "HUE HOTEL"}
          </Typography>
          {!currentCollapsed && (
            <Typography
              variant="caption"
              sx={{ color: COLORS.textMuted, letterSpacing: "0.04em" }}
            >
              Management Suite
            </Typography>
          )}
        </Box>
        {!currentCollapsed && (
          <Chip
            label={user?.role || "Admin"}
            size="small"
            sx={{
              height: 24,
              fontWeight: 700,
              color: "#d7fff8",
              bgcolor: "rgba(0,150,136,0.2)",
              border: "1px solid rgba(0,150,136,0.35)",
            }}
          />
        )}
      </Toolbar>

      {!isCompactScreen && (
        <Box
          sx={{
            px: currentCollapsed ? 0.5 : 1,
            mb: 0.8,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <IconButton
            onClick={toggleDesktopCollapse}
            size="small"
            sx={{
              color: "rgba(255,255,255,0.86)",
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "rgba(255,255,255,0.08)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.16)",
              },
            }}
          >
            {currentCollapsed ? (
              <ChevronRightIcon fontSize="small" />
            ) : (
              <ChevronLeftIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      )}

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.14)", mb: 1 }} />

      <List
        sx={{
          flexGrow: 1,
          px: currentCollapsed ? 0.9 : 1.5,
          overflowY: "auto",
          overflowX: "hidden",
          transition: "padding 0.24s ease",
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
            <ListItem key={item.text} disablePadding sx={{ mb: 0.4 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={handleDrawerToggle}
                sx={{
                  minHeight: 44,
                  borderRadius: "14px",
                  bgcolor: isActive ? COLORS.activeBg : "transparent",
                  color: isActive ? "white" : COLORS.textMuted,
                  border: "1px solid",
                  borderColor: isActive
                    ? "rgba(255,255,255,0.24)"
                    : "transparent",
                  justifyContent: currentCollapsed ? "center" : "flex-start",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.11)",
                    color: "white",
                    transform: currentCollapsed
                      ? "translateY(-1px)"
                      : "translateX(3px)",
                    "& .MuiListItemIcon-root": {
                      color: "white",
                      transform: "scale(1.07)",
                    },
                  },
                  ...(isActive && {
                    boxShadow: `inset 0 0 0 1px ${COLORS.activeGlow}, 0 8px 20px rgba(0,150,136,0.18)`,
                  }),
                  py: 1.05,
                  px: currentCollapsed ? 0.6 : 1.6,
                  transition: "all 0.24s ease-in-out",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? COLORS.accent : COLORS.textMuted,
                    minWidth: currentCollapsed ? 0 : "38px",
                    justifyContent: "center",
                    "& .MuiSvgIcon-root": {
                      fontSize: "1.25rem",
                    },
                    transition: "all 0.24s ease",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!currentCollapsed && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "0.92rem",
                      letterSpacing: "0.01em",
                      whiteSpace: "nowrap",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: currentCollapsed ? 1.2 : 2, pt: 1 }}>
        {!currentCollapsed && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: "12px",
              bgcolor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              display="block"
              color="rgba(255,255,255,0.5)"
              mb={0.5} 
            >
              Phiên bản hệ thống
            </Typography>
            <Chip
              label="HueHotel v2.1.0"
              size="small"
              sx={{
                bgcolor: "rgba(0,150,136,0.2)",
                color: "#80cbc4",
                fontWeight: 700,
                fontSize: "0.7rem",
                height: 22,
              }}
            />
          </Box>
        )}

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "14px",
              bgcolor: "rgba(220,38,38,0.92)",
              color: "#ffffff",
              justifyContent: currentCollapsed ? "center" : "flex-start",
              "&:hover": {
                bgcolor: "rgba(220,38,38,1)",
                transform: "translateY(-1px)",
              },
              py: 1.1,
              px: currentCollapsed ? 0.6 : 2,
              transition: "all 0.24s ease",
            }}
          >
            <ListItemIcon
              sx={{
                color: "#ffffff",
                minWidth: currentCollapsed ? 0 : "36px",
                justifyContent: "center",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!currentCollapsed && (
              <ListItemText
                primary="Đăng xuất"
                primaryTypographyProps={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: currentCollapsed ? collapsedDrawerWidth : drawerWidth },
        flexShrink: { sm: 0 },
        transition: "width 0.24s ease",
      }}
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
            width: "min(82vw, 320px)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "12px 0 28px rgba(7,18,43,0.35)",
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
            width: currentCollapsed ? collapsedDrawerWidth : drawerWidth,
            transition: "width 0.24s ease",
            overflowX: "hidden",
            borderRight: "none",
            boxShadow: "12px 0 30px rgba(7,18,43,0.2)",
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
