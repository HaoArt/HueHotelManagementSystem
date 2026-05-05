import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import Topbar from "../../components/common/dashboard/Topbar";
import Sidebar from "../../components/common/dashboard/Sidebar";



const DashboardLayout = () => {
  // State quản lý việc đóng/mở Sidebar trên điện thoại
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Topbar handleDrawerToggle={handleDrawerToggle} />

      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 }, // Đệm content
          bgcolor: "#f5f7fa", // Nền xám nhẹ cho toàn bộ Dashboard
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <Toolbar />

        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
