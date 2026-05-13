import { useContext } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Stack,
  Avatar,
  Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
// import HotelRoundedIcon from "@mui/icons-material/HotelRounded";
import { AuthContext } from "../../../context/AuthContext";

// NHẬN PROPS isCollapsed ĐỂ TÍNH TOÁN WIDTH
const Topbar = ({ handleDrawerToggle, isCollapsed }) => {
  const { user } = useContext(AuthContext);

  // Xác định chính xác width giống với bên Sidebar
  const currentDrawerWidth = isCollapsed ? 92 : 284;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
        ml: { sm: `${currentDrawerWidth}px` },
        // THÊM TRANSITION ĐỂ TOPBAR CHUYỂN ĐỘNG MƯỢT MÀ CÙNG SIDEBAR
        transition: "width 0.24s ease, margin-left 0.24s ease",
        bgcolor: "rgba(255,255,255,0.86)",
        color: "text.primary",
        boxShadow: "0 8px 24px rgba(11,27,63,0.08)",
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(12px)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, sm: 72 },
          px: { xs: 1, sm: 2.5 },
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 1,
              display: { sm: "none" },
              color: "text.secondary",
              bgcolor: "rgba(11,27,63,0.04)",
              borderRadius: "10px",
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              fontWeight={800}
              sx={{
                color: "#0b1b3f",
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}
            >
              Hotel Admin
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: { xs: "none", md: "block" },
              }}
            >
              Bảng Điều Khiển
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.25} alignItems="center">
          <Chip
            label={user?.role || "Admin"}
            size="small"
            sx={{
              display: { xs: "none", md: "inline-flex" },
              fontWeight: 600,
              bgcolor: "rgba(0,150,136,0.12)",
              color: "primary.dark",
              border: "1px solid rgba(0,150,136,0.28)",
            }}
          />
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              display: { xs: "none", sm: "block" },
              color: "text.secondary",
            }}
          >
            {user?.full_name}
          </Typography>
          <Avatar
            sx={{
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              width: 38,
              height: 38,
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(0,150,136,0.25)",
              border: "2px solid #fff",
            }}
          >
            {user?.full_name?.charAt(0).toUpperCase() || "A"}
          </Avatar>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
