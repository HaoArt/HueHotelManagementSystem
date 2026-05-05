import { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Stack,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "../../../context/AuthContext";

const drawerWidth = 260;

const Topbar = ({ handleDrawerToggle }) => {
  const { user } = useContext(AuthContext);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: "white",
        color: "black",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar>
        {/* Nút bấm Menu cho bản Mobile */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, fontWeight: "bold" }}
        >
          Bảng Điều Khiển
        </Typography>

        {/* Thông tin Admin */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {user?.full_name}
          </Typography>
          <Avatar
            sx={{
              bgcolor: "warning.main",
              width: 36,
              height: 36,
              fontWeight: "bold",
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
