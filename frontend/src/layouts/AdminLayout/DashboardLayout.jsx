import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import Topbar from "../../components/common/dashboard/Topbar";
import Sidebar from "../../components/common/dashboard/Sidebar";

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 20% 5%, rgba(0,150,136,0.08), transparent 28%), radial-gradient(circle at 95% 95%, rgba(11,27,63,0.08), transparent 24%)",
      }}
    >
      <Topbar
        handleDrawerToggle={handleDrawerToggle}
        isCollapsed={isCollapsed}
      />
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 1.5, sm: 2 },
          pb: { xs: 2.5, sm: 3 },
          px: { xs: 1.5, sm: 2.5, md: 3.5 },
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          width: "100%",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 }, mb: { xs: 0, sm: 1 } }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
