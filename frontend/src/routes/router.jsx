import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/client/Home";
import MainLayout from "../layouts/MainLayout/MainLayout";
import Rooms from "../pages/client/Rooms";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import RoomDetail from "../pages/client/RoomDetail";
import Profile from "../pages/client/Profile";
import Booking from "../pages/client/Booking";
import Contact from "../pages/client/Contact";
import DashboardLayout from "../layouts/AdminLayout/DashboardLayout";
import DashboardOverview from "../pages/admin/DashboardOverview";
import AdminRoomsPage from "../pages/admin/AdminRoomsPage";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";
import AdminServicesPage from "../pages/admin/AdminServicesPage";
import AdminRoomSettingsPage from "../pages/admin/AdminRoomSettingPage";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";
import AdminContacts from "../pages/admin/AdminContacts";
import AdminCouponsPage from "../pages/admin/AdminCouponsPage";
import AdminPricingPage from "../pages/admin/AdminPricingPage";
import DiscoverHue from "../pages/client/DiscoverHue";
import AdminSystemConfig from "../pages/admin/AdminSystemConfig";
import ForgotPassword from "../pages/auth/ForgotPassword";
import AdminAccountsPage from "../pages/admin/AdminAccountsPage";

const AppRouter = () => {
  return (
    <Routes>
      {/* Tuyến đường công khai & Khách hàng */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="discover-hue" element={<DiscoverHue />} />
        <Route path="contact" element={<Contact />} />
        <Route path="rooms/:id" element={<RoomDetail />} />

        <Route
          path="booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
      {/*Tuyến đường private cho nội bộ quản trị và lễ tân */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Receptionist"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="rooms" element={<AdminRoomsPage />} />
        <Route path="room-settings" element={<AdminRoomSettingsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="customers" element={<AdminAccountsPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="audit" element={<AdminAuditLogs />} />
        <Route path="coupon" element={<AdminCouponsPage />} />
        <Route path="pricing" element={<AdminPricingPage />} />
        <Route path="system-config" element={<AdminSystemConfig />} />
      </Route>

      {/* Xác thực */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
