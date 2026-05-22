/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/purity */
import { useState, useEffect, useContext, useMemo } from "react";
import {
  Typography,
  Box,
  Paper,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  Container,
  CardMedia,
  IconButton,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Tooltip,
  Fade,
  Slide,
} from "@mui/material";

// Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import MailIcon from "@mui/icons-material/Mail";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import DeleteIcon from "@mui/icons-material/Delete";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import LinearProgress from "@mui/material/LinearProgress";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import VerifiedIcon from "@mui/icons-material/Verified";
import BadgeIcon from "@mui/icons-material/Badge";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import StarIcon from "@mui/icons-material/Star";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { AuthContext } from "../../context/AuthContext";
import ConfigService from "../../services/configService";
import AuthService from "../../services/authService";
import BookingService from "../../services/bookingService";
import UserService from "../../services/userService";
import ServiceService from "../../services/serviceService";
import FolioService from "../../services/folioService";

// =========================================================================
// LUXURY DESIGN TOKENS
// =========================================================================
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

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    bgcolor: LUXURY.white,
    transition: "all 0.3s ease",
    "& fieldset": { borderColor: LUXURY.softGray, borderWidth: "1px" },
    "&:hover fieldset": { borderColor: LUXURY.gold },
    "&.Mui-focused fieldset": { borderColor: LUXURY.gold, borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": { color: LUXURY.warmGray },
  "& .MuiInputLabel-root.Mui-focused": {
    color: LUXURY.gold,
    fontWeight: "bold",
  },
};

const RANK_THRESHOLDS = [
  { name: "Đồng (Bronze)", min: 0, color: "#cd7f32" },
  { name: "Bạc (Silver)", min: 5000000, color: "#9ca3af" },
  { name: "Vàng (Gold)", min: 15000000, color: LUXURY.gold },
  { name: "Kim Cương (Diamond)", min: 30000000, color: "#38bdf8" },
];

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [qrModal, setQrModal] = useState({ open: false, booking: null });
  const [sysConfigs, setSysConfigs] = useState({});

  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All"); // THÊM STATE CHO BỘ LỌC
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");

  const [detailModal, setDetailModal] = useState({
    open: false,
    booking: null,
    folioData: [],
  });
  const [orderForm, setOrderForm] = useState({ serviceId: "", quantity: 1 });

  const [reviewModal, setReviewModal] = useState({
    open: false,
    bookingId: null,
    roomName: "",
  });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [cancelModal, setCancelModal] = useState({
    open: false,
    bookingId: null,
  });

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    cccd_number: "",
    avatar_url: "",
  });
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);

  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const nextRankInfo = useMemo(() => {
    if (!profileData) return null;
    const spent = parseFloat(profileData.total_spent || 0);
    const next = RANK_THRESHOLDS.find((r) => r.min > spent);

    if (!next) return { isMax: true };

    const remaining = next.min - spent;
    const currentRankMin =
      RANK_THRESHOLDS.slice()
        .reverse()
        .find((r) => r.min <= spent)?.min || 0;
    const progress =
      ((spent - currentRankMin) / (next.min - currentRankMin)) * 100;

    return {
      nextName: next.name,
      remaining,
      progress: Math.min(progress, 100),
      isMax: false,
      nextMin: next.min,
    };
  }, [profileData]);

  // LỌC DANH SÁCH BOOKING THEO TRẠNG THÁI
  const filteredBookings = useMemo(() => {
    if (filterStatus === "All") return bookings;
    return bookings.filter((b) => b.status === filterStatus);
  }, [bookings, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setGlobalError("");

      // Thêm ConfigService.getConfigs() vào Promise.all
      const [profileRes, bookingsRes, servicesRes, configRes] =
        await Promise.all([
          UserService.getProfile(),
          BookingService.getUserBookings(),
          ServiceService.getAllServices(),
          ConfigService.getConfigs(), // <--- THÊM VÀO ĐÂY
        ]);

      const { userInfo, rank } = profileRes.data || profileRes;
      setProfileData(userInfo);
      setUserRank(rank);

      setEditForm({
        full_name: userInfo?.full_name || "",
        phone: userInfo?.phone || "",
        cccd_number: userInfo?.cccd_number || "",
        avatar_url: userInfo?.avatar_url || "",
      });
      setBookings(bookingsRes.data || bookingsRes || []);
      setAvailableServices(servicesRes.data || servicesRes || []);

      const configsArray = configRes.data || configRes || [];
      const configMap = {};
      configsArray.forEach((c) => {
        configMap[c.config_key] = c.config_value;
      });
      setSysConfigs(configMap);
    } catch (err) {
      setGlobalError("Có lỗi xảy ra ở phần tải dữ liệu hồ sơ và lịch sử.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    fetchData();
  }, []);

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedAvatarFile(file);
    setEditForm((prev) => ({ ...prev, avatar_url: URL.createObjectURL(file) }));
  };

  const handleUpdateProfile = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("full_name", editForm.full_name);
      formData.append("phone", editForm.phone || "");
      formData.append("cccd_number", editForm.cccd_number || "");

      if (selectedAvatarFile) formData.append("avatar", selectedAvatarFile);
      else formData.append("avatar_url", profileData?.avatar_url || "");

      const res = await UserService.updateProfile(formData);

      setGlobalSuccess("Cập nhật hồ sơ thành công!");
      setEditModal(false);

      if (res.data) {
        setUser((prev) => ({
          ...prev,
          full_name: res.data.full_name,
          avatar_url: res.data.avatar_url,
        }));
      }

      setSelectedAvatarFile(null);
      fetchData();
    } catch (err) {
      setGlobalError(
        err.response?.data?.message ||
          "Có lỗi xảy ra ở phần cập nhật thông tin cá nhân.",
      );
      setEditModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetails = async (booking) => {
    try {
      setIsSubmitting(true);
      const folioRes = await FolioService.getFolio(booking.id);
      setDetailModal({
        open: true,
        booking,
        folioData: folioRes.data?.services || folioRes.data || [],
      });
      setOrderForm({ serviceId: "", quantity: 1 });
    } catch (err) {
      setGlobalError("Không thể tải chi tiết hóa đơn dịch vụ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderService = async () => {
    if (!orderForm.serviceId || orderForm.quantity < 1) return;
    try {
      setIsSubmitting(true);
      await FolioService.orderService({
        booking_id: detailModal.booking.id,
        service_id: orderForm.serviceId,
        quantity: orderForm.quantity,
      });
      setGlobalSuccess("Đã gửi yêu cầu! Lễ tân đang chuẩn bị dịch vụ cho bạn.");

      const folioRes = await FolioService.getFolio(detailModal.booking.id);
      setDetailModal((prev) => ({
        ...prev,
        folioData: folioRes.data?.services || folioRes.data || [],
      }));
      setOrderForm({ serviceId: "", quantity: 1 });
      fetchData();
    } catch (err) {
      setGlobalError("Lỗi khi gọi thêm dịch vụ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelService = async (folioItemId) => {
    try {
      setIsSubmitting(true);
      await FolioService.deleteFolioItem(folioItemId);
      setGlobalSuccess("Đã hủy dịch vụ thành công.");

      const folioRes = await FolioService.getFolio(detailModal.booking.id);
      setDetailModal((prev) => ({
        ...prev,
        folioData: folioRes.data?.services || folioRes.data || [],
      }));
      fetchData();
    } catch (err) {
      setGlobalError("Không thể hủy dịch vụ này (Có thể lễ tân đã phục vụ).");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleOpenCancelConfirm = (bookingId) => {
    setCancelModal({ open: true, bookingId });
  };
  const confirmCancelBooking = async () => {
    if (!cancelModal.bookingId) return;
    try {
      setIsSubmitting(true);
      const res = await BookingService.cancelBooking(cancelModal.bookingId);
      setGlobalSuccess(res.message || "Đã hủy đơn thành công.");
      setCancelModal({ open: false, bookingId: null });
      fetchData(); // Tải lại danh sách
    } catch (err) {
      setGlobalError(
        err.response?.data?.message || err.toString() || "Lỗi khi hủy đơn.",
      );
      setCancelModal({ open: false, bookingId: null });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSubmitReview = async () => {
    try {
      setIsSubmitting(true);
      await BookingService.addReview(reviewModal.bookingId, reviewForm);
      setGlobalSuccess("Gửi đánh giá thành công!");
      setReviewModal({ open: false, bookingId: null, roomName: "" });
      fetchData();
    } catch (err) {
      setGlobalError(
        err.response?.data?.message || "Có lỗi xảy ra ở phần gửi đánh giá.",
      );
      setReviewModal({ ...reviewModal, open: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return setGlobalError("Mật khẩu xác nhận không khớp!");
    }
    try {
      setIsSubmitting(true);
      await AuthService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setGlobalSuccess("Đổi mật khẩu thành công!");
      setPasswordModal(false);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setGlobalError(
        err.response?.data?.message || "Có lỗi xảy ra ở phần đổi mật khẩu.",
      );
      setPasswordModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Chip
            label="Chờ thanh toán"
            sx={{
              bgcolor: "#fef08a",
              color: "#854d0e",
              fontWeight: "bold",
              borderRadius: "8px",
            }}
          />
        );
      case "Confirmed":
        return (
          <Chip
            label="Đã xác nhận"
            sx={{
              bgcolor: "#e0e7ff",
              color: "#3730a3",
              fontWeight: "bold",
              borderRadius: "8px",
            }}
          />
        );
      case "Checked_in":
        return (
          <Chip
            label="Đang lưu trú"
            sx={{
              bgcolor: "#dcfce7",
              color: "#166534",
              fontWeight: "bold",
              borderRadius: "8px",
            }}
          />
        );
      case "Checked_out":
        return (
          <Chip
            label="Đã hoàn tất"
            sx={{
              bgcolor: "#f3f4f6",
              color: "#374151",
              fontWeight: "bold",
              borderRadius: "8px",
            }}
          />
        );
      case "Cancelled":
        return (
          <Chip
            label="Đã hủy"
            sx={{
              bgcolor: "#fee2e2",
              color: "#991b1b",
              fontWeight: "bold",
              borderRadius: "8px",
            }}
          />
        );
      default:
        return <Chip label={status} sx={{ borderRadius: "8px" }} />;
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          bgcolor: LUXURY.offwhite,
        }}
      >
        <CircularProgress sx={{ color: LUXURY.gold }} />
      </Box>
    );

  return (
    <Box
      sx={{
        bgcolor: LUXURY.offwhite,
        minHeight: "100vh",
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        {globalSuccess && (
          <Alert
            severity="success"
            onClose={() => setGlobalSuccess("")}
            sx={{
              mb: 4,
              borderRadius: "12px",
              bgcolor: `${LUXURY.gold}15`,
              border: `1px solid ${LUXURY.gold}40`,
              color: LUXURY.charcoal,
            }}
          >
            {globalSuccess}
          </Alert>
        )}
        {globalError && (
          <Alert
            severity="error"
            onClose={() => setGlobalError("")}
            sx={{ mb: 4, borderRadius: "12px" }}
          >
            {globalError}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, lg: 6 },
            alignItems: "flex-start",
          }}
        >
          {/* =========================================================================
              CỘT TRÁI: THÔNG TIN CÁ NHÂN & THẺ THÀNH VIÊN VIP
             ========================================================================= */}
          <Box
            sx={{
              width: { xs: "100%", md: "360px" },
              flexShrink: 0,
              position: { md: "sticky" },
              top: 100,
            }}
          >
            <Slide direction="right" in={true} timeout={600}>
              <Box>
                {/* 1. THẺ HẠNG THÀNH VIÊN (VIP CARD) */}
                <Paper
                  elevation={0}
                  sx={{
                    background: `linear-gradient(135deg, ${LUXURY.charcoal} 0%, ${LUXURY.navy} 100%)`,
                    borderRadius: "24px",
                    p: 4,
                    mb: 3,
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 24px 48px rgba(27,45,79,0.2)",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      opacity: 0.1,
                      transform: "rotate(15deg)",
                    }}
                  >
                    <WorkspacePremiumIcon
                      sx={{ fontSize: 160, color: LUXURY.gold }}
                    />
                  </Box>
                  <Typography
                    variant="overline"
                    sx={{ color: LUXURY.softGray, letterSpacing: 2 }}
                  >
                    THẺ THÀNH VIÊN
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      color: LUXURY.gold,
                      fontWeight: 900,
                      mb: 1,
                      textShadow: "0 2px 8px rgba(212,175,55,0.3)",
                    }}
                  >
                    {userRank?.rank_name || "Thành Viên Mới"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.8, mb: 4, color: LUXURY.white }}
                  >
                    Đặc quyền: Giảm{" "}
                    <b style={{ color: LUXURY.gold }}>
                      {userRank?.discount_percent || 0}%
                    </b>{" "}
                    toàn hệ thống
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: LUXURY.softGray }}
                    >
                      Đến{" "}
                      {nextRankInfo?.isMax
                        ? "Max"
                        : nextRankInfo?.nextName?.split(" ")[0]}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{ color: LUXURY.gold }}
                    >
                      {nextRankInfo?.isMax
                        ? "Max"
                        : `${Number(profileData?.total_spent || 0).toLocaleString("vi-VN")} / ${Number(nextRankInfo?.nextMin || 0).toLocaleString("vi-VN")} đ`}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={
                      nextRankInfo?.isMax ? 100 : nextRankInfo?.progress || 0
                    }
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "rgba(255,255,255,0.1)",
                      "& .MuiLinearProgress-bar": {
                        background: `linear-gradient(90deg, ${LUXURY.goldLight}, ${LUXURY.gold})`,
                      },
                    }}
                  />
                </Paper>

                {/* 2. THÔNG TIN HỒ SƠ CHÍNH */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: "24px",
                    border: `1px solid ${LUXURY.softGray}`,
                    bgcolor: LUXURY.white,
                    boxShadow: "0 20px 40px rgba(26,26,26,0.04)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mb: 4,
                    }}
                  >
                    <Avatar
                      src={profileData?.avatar_url || ""}
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: LUXURY.charcoal,
                        fontSize: "2.5rem",
                        mb: 2,
                        border: `3px solid ${LUXURY.gold}`,
                        boxShadow: `0 8px 24px ${LUXURY.gold}40`,
                      }}
                    >
                      {!profileData?.avatar_url &&
                        profileData?.full_name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 800,
                        color: LUXURY.charcoal,
                      }}
                    >
                      {profileData?.full_name}
                      {profileData?.cccd_number && (
                        <Tooltip title="Đã xác minh danh tính">
                          <VerifiedIcon
                            sx={{
                              color: LUXURY.gold,
                              ml: 1,
                              fontSize: 22,
                              verticalAlign: "middle",
                            }}
                          />
                        </Tooltip>
                      )}
                    </Typography>
                    <Typography variant="body2" color={LUXURY.warmGray}>
                      Thành viên từ{" "}
                      {new Date(
                        profileData?.created_at || Date.now(),
                      ).getFullYear()}
                    </Typography>
                  </Box>

                  <Stack spacing={2} sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        color: LUXURY.charcoal,
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: LUXURY.offwhite,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: LUXURY.gold,
                        }}
                      >
                        <MailIcon fontSize="small" />
                      </Box>
                      <Typography variant="body2" fontWeight="500">
                        {profileData?.email}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        color: LUXURY.charcoal,
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: LUXURY.offwhite,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: LUXURY.gold,
                        }}
                      >
                        <PhoneIcon fontSize="small" />
                      </Box>
                      <Typography variant="body2" fontWeight="500">
                        {profileData?.phone || "Chưa cập nhật SĐT"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        color: LUXURY.charcoal,
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: LUXURY.offwhite,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: LUXURY.gold,
                        }}
                      >
                        <BadgeIcon fontSize="small" />
                      </Box>
                      <Typography variant="body2" fontWeight="500">
                        {profileData?.cccd_number
                          ? `CCCD: ${profileData.cccd_number}`
                          : "Chưa cập nhật CCCD"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ mb: 3, borderColor: LUXURY.softGray }} />

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 4 }}
                  >
                    <Box textAlign="center">
                      <Typography
                        variant="caption"
                        color={LUXURY.warmGray}
                        display="block"
                        letterSpacing={1}
                      >
                        TỔNG CHI TIÊU
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="800"
                        color={LUXURY.charcoal}
                      >
                        {Number(profileData?.total_spent || 0).toLocaleString(
                          "vi-VN",
                        )}
                        đ
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography
                        variant="caption"
                        color={LUXURY.warmGray}
                        display="block"
                        letterSpacing={1}
                      >
                        TÍN NHIỆM
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="800"
                        sx={{ color: "#16a34a" }}
                      >
                        {profileData?.trust_score || 0}/100
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => setEditModal(true)}
                      sx={{
                        background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                        color: LUXURY.white,
                        borderRadius: "12px",
                        fontWeight: "800",
                        py: 1.5,
                        boxShadow: `0 8px 24px ${LUXURY.gold}40`,
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: `0 12px 32px ${LUXURY.gold}60`,
                        },
                      }}
                    >
                      CẬP NHẬT HỒ SƠ
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LockOutlinedIcon />}
                      onClick={() => setPasswordModal(true)}
                      sx={{
                        borderRadius: "12px",
                        fontWeight: "700",
                        color: LUXURY.charcoal,
                        borderColor: LUXURY.softGray,
                        py: 1.5,
                        "&:hover": {
                          borderColor: LUXURY.charcoal,
                          bgcolor: LUXURY.offwhite,
                        },
                      }}
                    >
                      Đổi mật khẩu
                    </Button>
                  </Stack>
                </Paper>
              </Box>
            </Slide>
          </Box>

          {/* =========================================================================
              CỘT PHẢI: LỊCH SỬ ĐẶT PHÒNG
             ========================================================================= */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Slide direction="left" in={true} timeout={800}>
              <Box>
                {/* HEADER & FILTER TRẠNG THÁI */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "flex-end" },
                    mb: 4,
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h3"
                      fontWeight="900"
                      sx={{
                        fontFamily: '"Playfair Display", serif',
                        color: LUXURY.charcoal,
                        mb: 1,
                        fontSize: { xs: "2rem", md: "2.5rem" },
                      }}
                    >
                      Lịch sử đặt phòng
                    </Typography>
                    <Typography variant="body1" color={LUXURY.warmGray}>
                      Ghi dấu những khoảnh khắc tuyệt vời tại Huế Hotel
                    </Typography>
                  </Box>
                  <FormControl
                    size="small"
                    sx={{ minWidth: 180, ...inputStyle }}
                  >
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: "12px",
                        bgcolor: LUXURY.white,
                        fontWeight: 700,
                      }}
                    >
                      <MenuItem value="All">Tất cả trạng thái</MenuItem>
                      <MenuItem value="Pending">Chờ thanh toán</MenuItem>
                      <MenuItem value="Confirmed">Đã xác nhận</MenuItem>
                      <MenuItem value="Checked_in">Đang lưu trú</MenuItem>
                      <MenuItem value="Checked_out">Đã hoàn tất</MenuItem>
                      <MenuItem value="Cancelled">Đã hủy</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {filteredBookings.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      textAlign: "center",
                      py: 10,
                      borderRadius: "24px",
                      bgcolor: LUXURY.white,
                      border: `1px solid ${LUXURY.softGray}`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      color={LUXURY.warmGray}
                      sx={{ fontFamily: '"Playfair Display", serif' }}
                    >
                      {filterStatus === "All"
                        ? "Bạn chưa có kỳ nghỉ nào cùng chúng tôi."
                        : "Không có giao dịch nào ở trạng thái này."}
                    </Typography>
                  </Paper>
                ) : (
                  // BỌC TRONG BOX SCROLL CỐ ĐỊNH CHIỀU CAO
                  <Box
                    sx={{
                      maxHeight: { xs: "600px", md: "800px" },
                      overflowY: "auto",
                      pr: 1.5,
                      mr: -1.5, // Kéo ra một chút để thanh scroll không đè vào thẻ
                      "&::-webkit-scrollbar": { width: "6px" },
                      "&::-webkit-scrollbar-track": {
                        background: "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: LUXURY.softGray,
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        background: LUXURY.warmGray,
                      },
                    }}
                  >
                    <Stack spacing={4}>
                      {filteredBookings.map((booking) => (
                        <Paper
                          key={booking.id}
                          elevation={0}
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            borderRadius: "24px",
                            border: `1px solid ${LUXURY.softGray}`,
                            overflow: "hidden",
                            bgcolor: LUXURY.white,
                            transition: "all 0.4s ease",
                            "&:hover": {
                              boxShadow: "0 24px 48px rgba(26,26,26,0.08)",
                              transform: "translateY(-4px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: { xs: "100%", sm: 280 },
                              flexShrink: 0,
                              position: "relative",
                            }}
                          >
                            <CardMedia
                              component="img"
                              sx={{
                                width: "100%",
                                height: { xs: 220, sm: "100%" },
                                objectFit: "cover",
                              }}
                              image={
                                booking.image_url ||
                                "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
                              }
                              alt={booking.type_name}
                            />
                          </Box>

                          <Box
                            sx={{
                              p: { xs: 3, md: 4 },
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="h5"
                                fontWeight="800"
                                color={LUXURY.charcoal}
                                sx={{ fontFamily: '"Playfair Display", serif' }}
                              >
                                {booking.type_name}
                              </Typography>
                              <Box>{getStatusChip(booking.status)}</Box>
                            </Box>

                            <Typography
                              variant="body2"
                              color={LUXURY.warmGray}
                              sx={{ mb: 3 }}
                            >
                              Mã đặt phòng: #{booking.id}{" "}
                              {booking.room_number
                                ? `• Phòng ${booking.room_number}`
                                : ""}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={{ xs: 4, md: 8 }}
                              sx={{
                                mb: 4,
                                py: 2,
                                borderTop: `1px solid ${LUXURY.softGray}`,
                                borderBottom: `1px solid ${LUXURY.softGray}`,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color={LUXURY.warmGray}
                                  fontWeight="700"
                                  letterSpacing={1}
                                >
                                  CHECK-IN
                                </Typography>
                                <Typography
                                  variant="h6"
                                  fontWeight="700"
                                  color={LUXURY.charcoal}
                                >
                                  {new Date(
                                    booking.check_in_date,
                                  ).toLocaleDateString("vi-VN", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color={LUXURY.warmGray}
                                  fontWeight="700"
                                  letterSpacing={1}
                                >
                                  CHECK-OUT
                                </Typography>
                                <Typography
                                  variant="h6"
                                  fontWeight="700"
                                  color={LUXURY.charcoal}
                                >
                                  {new Date(
                                    booking.check_out_date,
                                  ).toLocaleDateString("vi-VN", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </Typography>
                              </Box>
                            </Stack>

                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                mt: "auto",
                                flexWrap: "wrap",
                                gap: 2,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color={LUXURY.warmGray}
                                  display="block"
                                  mb={0.5}
                                >
                                  TỔNG THANH TOÁN
                                </Typography>
                                <Typography
                                  variant="h5"
                                  fontWeight="900"
                                  sx={{
                                    color:
                                      booking.status === "Cancelled"
                                        ? LUXURY.warmGray
                                        : LUXURY.charcoal,
                                    textDecoration:
                                      booking.status === "Cancelled"
                                        ? "line-through"
                                        : "none",
                                  }}
                                >
                                  {Number(
                                    booking.grand_total ||
                                      booking.total_amount ||
                                      0,
                                  ).toLocaleString("vi-VN")}
                                  đ
                                </Typography>
                              </Box>
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Button
                                  variant="outlined"
                                  startIcon={<ReceiptLongIcon />}
                                  onClick={() => handleOpenDetails(booking)}
                                  disabled={isSubmitting}
                                  sx={{
                                    borderRadius: "10px",
                                    textTransform: "none",
                                    fontWeight: "700",
                                    color: LUXURY.charcoal,
                                    borderColor: LUXURY.softGray,
                                    "&:hover": {
                                      borderColor: LUXURY.charcoal,
                                      bgcolor: LUXURY.offwhite,
                                    },
                                  }}
                                >
                                  Xem Hóa Đơn
                                </Button>

                                {/* NÚT THANH TOÁN CỌC (Chỉ hiện khi Pending) */}
                                {booking.status === "Pending" && (
                                  <Button
                                    variant="contained"
                                    startIcon={<QrCodeIcon />}
                                    onClick={() =>
                                      setQrModal({ open: true, booking })
                                    }
                                    sx={{
                                      bgcolor: LUXURY.navy,
                                      color: LUXURY.gold,
                                      fontWeight: "800",
                                      borderRadius: "10px",
                                      boxShadow: "none",
                                      "&:hover": {
                                        bgcolor: "black",
                                        boxShadow: "none",
                                      },
                                    }}
                                  >
                                    Thanh Toán Cọc
                                  </Button>
                                )}

                                {/* NÚT HỦY ĐƠN (Hiện khi Pending hoặc Confirmed) */}
                                {(booking.status === "Pending" ||
                                  booking.status === "Confirmed") && (
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CancelIcon />}
                                    onClick={() =>
                                      handleOpenCancelConfirm(booking.id)
                                    } // <-- SỬA DÒNG NÀY
                                    disabled={isSubmitting}
                                    sx={{
                                      borderRadius: "10px",
                                      fontWeight: "700",
                                      textTransform: "none",
                                    }}
                                  >
                                    Hủy Đơn
                                  </Button>
                                )}
                                {booking.status === "Checked_out" && (
                                  <Button
                                    variant="contained"
                                    onClick={() => {
                                      setReviewModal({
                                        open: true,
                                        bookingId: booking.id,
                                        roomName: booking.type_name,
                                      });
                                      setReviewForm({ rating: 5, comment: "" });
                                    }}
                                    sx={{
                                      bgcolor: LUXURY.charcoal,
                                      color: LUXURY.gold,
                                      fontWeight: "800",
                                      borderRadius: "10px",
                                      boxShadow: "none",
                                      "&:hover": {
                                        bgcolor: "black",
                                        boxShadow: "none",
                                      },
                                    }}
                                  >
                                    Đánh Giá
                                  </Button>
                                )}
                              </Stack>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Slide>
          </Box>
        </Box>

        {/* ======================================================= */}
        {/* MODALS - LUXURY RESTYLING */}
        {/* ======================================================= */}

        {/* 1. SỬA HỒ SƠ */}
        <Dialog
          open={editModal}
          onClose={() => setEditModal(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "24px", bgcolor: LUXURY.white } }}
        >
          <DialogTitle
            sx={{
              fontWeight: "900",
              fontFamily: '"Playfair Display", serif',
              color: LUXURY.charcoal,
              pt: 4,
              textAlign: "center",
              fontSize: "1.8rem",
            }}
          >
            Hồ Sơ Cá Nhân
          </DialogTitle>
          <DialogContent sx={{ pb: 1, px: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
                mt: 2,
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <IconButton
                    component="label"
                    sx={{
                      bgcolor: LUXURY.gold,
                      color: "white",
                      "&:hover": { bgcolor: LUXURY.goldLight },
                      width: 36,
                      height: 36,
                      boxShadow: `0 4px 12px ${LUXURY.gold}60`,
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 18 }} />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarSelect}
                    />
                  </IconButton>
                }
              >
                <Avatar
                  src={editForm.avatar_url}
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: LUXURY.charcoal,
                    border: `2px solid ${LUXURY.gold}`,
                  }}
                >
                  {!editForm.avatar_url &&
                    editForm.full_name?.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
            </Box>

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Họ và Tên"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                sx={inputStyle}
              />
              <TextField
                fullWidth
                label="Số điện thoại"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                sx={inputStyle}
              />
              <TextField
                fullWidth
                label="Căn cước công dân"
                value={editForm.cccd_number}
                disabled={!!profileData?.cccd_number}
                onChange={(e) =>
                  setEditForm({ ...editForm, cccd_number: e.target.value })
                }
                inputProps={{ maxLength: 12 }}
                helperText={
                  profileData?.cccd_number
                    ? "🔒 Thông tin đã được xác thực."
                    : "Nhập 12 số CCCD để định danh bảo vệ tài khoản."
                }
                sx={{
                  ...inputStyle,
                  bgcolor: profileData?.cccd_number
                    ? LUXURY.offwhite
                    : "transparent",
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 2, justifyContent: "center" }}>
            <Button
              onClick={() => setEditModal(false)}
              sx={{ fontWeight: "700", color: LUXURY.warmGray, mr: 1 }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={isSubmitting}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                color: LUXURY.white,
                fontWeight: "800",
                px: 4,
                py: 1.2,
                borderRadius: "10px",
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "LƯU THAY ĐỔI"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 2. ĐỔI MẬT KHẨU */}
        <Dialog
          open={passwordModal}
          onClose={() => setPasswordModal(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "24px", bgcolor: LUXURY.white } }}
        >
          <DialogTitle
            sx={{
              fontWeight: "900",
              fontFamily: '"Playfair Display", serif',
              color: LUXURY.charcoal,
              pt: 4,
              textAlign: "center",
              fontSize: "1.8rem",
            }}
          >
            Đổi mật khẩu
          </DialogTitle>
          <DialogContent sx={{ px: 4, pt: 2 }}>
            <Stack spacing={3} mt={1}>
              <TextField
                fullWidth
                label="Mật khẩu hiện tại"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    current_password: e.target.value,
                  })
                }
                sx={inputStyle}
              />
              <TextField
                fullWidth
                label="Mật khẩu mới"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
                sx={inputStyle}
              />
              <TextField
                fullWidth
                label="Xác nhận mật khẩu mới"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirm_password: e.target.value,
                  })
                }
                sx={inputStyle}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 2, justifyContent: "center" }}>
            <Button
              onClick={() => setPasswordModal(false)}
              sx={{ fontWeight: "700", color: LUXURY.warmGray, mr: 1 }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isSubmitting}
              variant="contained"
              sx={{
                background: LUXURY.charcoal,
                color: LUXURY.gold,
                fontWeight: "800",
                px: 4,
                py: 1.2,
                borderRadius: "10px",
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "XÁC NHẬN"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 3. ĐÁNH GIÁ (REVIEW) */}
        <Dialog
          open={reviewModal.open}
          onClose={() => setReviewModal({ ...reviewModal, open: false })}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "24px", bgcolor: LUXURY.white } }}
        >
          <DialogTitle
            sx={{
              fontWeight: "900",
              fontFamily: '"Playfair Display", serif',
              color: LUXURY.charcoal,
              textAlign: "center",
              pt: 5,
              fontSize: "2rem",
            }}
          >
            Đánh giá trải nghiệm
          </DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pb: 1,
              px: { xs: 3, md: 6 },
            }}
          >
            <Typography variant="body1" sx={{ mb: 3, color: LUXURY.warmGray }}>
              Cảm nhận của bạn về{" "}
              <b style={{ color: LUXURY.charcoal }}>{reviewModal.roomName}</b>
            </Typography>
            <Rating
              value={reviewForm.rating}
              onChange={(e, newValue) =>
                setReviewForm({ ...reviewForm, rating: newValue })
              }
              size="large"
              sx={{ mb: 4, "& .MuiRating-iconFilled": { color: LUXURY.gold } }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Chia sẻ trải nghiệm của bạn"
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              sx={inputStyle}
            />
          </DialogContent>
          <DialogActions sx={{ p: 5, pt: 3, justifyContent: "center" }}>
            <Button
              onClick={() => setReviewModal({ ...reviewModal, open: false })}
              sx={{ fontWeight: "700", color: LUXURY.warmGray, mr: 2 }}
            >
              Để sau
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                color: LUXURY.white,
                fontWeight: "800",
                px: 5,
                py: 1.5,
                borderRadius: "12px",
                boxShadow: `0 12px 24px ${LUXURY.gold}40`,
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "GỬI ĐÁNH GIÁ"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 4. HOÁ ĐƠN DỊCH VỤ VÀ GỌI MÓN (FOLIO) */}
        <Dialog
          disableScrollLock={true}
          open={detailModal.open}
          onClose={() =>
            setDetailModal({ open: false, booking: null, folioData: [] })
          }
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "24px",
              bgcolor: LUXURY.offwhite,
              overflow: "hidden",
            },
          }}
        >
          <Box
            sx={{
              background: LUXURY.navy,
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "white",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: "bold",
              }}
            >
              Hoá Đơn #{detailModal.booking?.id}
            </Typography>
            {getStatusChip(detailModal.booking?.status)}
          </Box>
          <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
              <Box
                sx={{
                  flex:
                    detailModal.booking?.status === "Checked_out" ||
                    detailModal.booking?.status === "Cancelled"
                      ? 1
                      : 1.5,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    border: `1px solid ${LUXURY.softGray}`,
                    bgcolor: LUXURY.white,
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="800"
                    color={LUXURY.charcoal}
                    mb={2}
                  >
                    <RoomServiceIcon
                      sx={{
                        verticalAlign: "middle",
                        mr: 1,
                        color: LUXURY.gold,
                      }}
                    />{" "}
                    Dịch Vụ Phát Sinh
                  </Typography>
                  <Divider sx={{ mb: 2, borderColor: LUXURY.softGray }} />
                  <Box sx={{ maxHeight: "250px", overflowY: "auto", pr: 1 }}>
                    <List disablePadding>
                      {detailModal.folioData.length === 0 ? (
                        <Typography
                          variant="body2"
                          color={LUXURY.warmGray}
                          textAlign="center"
                          py={3}
                        >
                          Chưa phát sinh dịch vụ nào.
                        </Typography>
                      ) : (
                        detailModal.folioData.map((item, index) => (
                          <ListItem
                            key={index}
                            disablePadding
                            sx={{
                              mb: 2,
                              bgcolor:
                                item.status === "Pending"
                                  ? `${LUXURY.gold}10`
                                  : LUXURY.offwhite,
                              p: 2,
                              borderRadius: "12px",
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  fontWeight="700"
                                  color={LUXURY.charcoal}
                                >
                                  {item.services_name ||
                                    item.service_name ||
                                    item.name}{" "}
                                  (x{item.quantity})
                                </Typography>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  fontWeight="600"
                                  color={
                                    item.status === "Pending"
                                      ? "warning.main"
                                      : "success.main"
                                  }
                                >
                                  {item.status === "Pending"
                                    ? "⏳ Đang chuẩn bị"
                                    : "✅ Đã phục vụ"}
                                </Typography>
                              }
                            />
                            <Box
                              sx={{
                                textAlign: "right",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                fontWeight="800"
                                mr={2}
                                color={LUXURY.charcoal}
                              >
                                {parseFloat(
                                  item.total_price || item.amount || 0,
                                ).toLocaleString()}
                                đ
                              </Typography>
                              {item.status === "Pending" &&
                                detailModal.booking?.status !==
                                  "Checked_out" && (
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleCancelService(item.id)}
                                    sx={{
                                      bgcolor: "#fee2e2",
                                      borderRadius: "8px",
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                            </Box>
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Box>
                  <Divider
                    sx={{
                      my: 3,
                      borderStyle: "dashed",
                      borderColor: LUXURY.softGray,
                    }}
                  />
                  <Stack spacing={1.5}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color={LUXURY.warmGray}>
                        Tiền phòng (sau ưu đãi):
                      </Typography>
                      <Typography variant="body2" fontWeight="700">
                        {parseFloat(
                          detailModal.booking?.total_amount || 0,
                        ).toLocaleString()}{" "}
                        đ
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color={LUXURY.warmGray}>
                        Tiền dịch vụ phát sinh:
                      </Typography>
                      <Typography variant="body2" fontWeight="700">
                        {detailModal.folioData
                          .reduce(
                            (sum, item) =>
                              sum +
                              parseFloat(item.total_price || item.amount || 0),
                            0,
                          )
                          .toLocaleString()}{" "}
                        đ
                      </Typography>
                    </Box>
                    {parseFloat(detailModal.booking?.deposit_amount || 0) >
                      0 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="success.main">
                          Đã đặt cọc/Thanh toán:
                        </Typography>
                        <Typography
                          variant="body2"
                          color="success.main"
                          fontWeight="700"
                        >
                          -{" "}
                          {parseFloat(
                            detailModal.booking?.deposit_amount || 0,
                          ).toLocaleString()}{" "}
                          đ
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2,
                        pt: 2,
                        borderTop: `1px solid ${LUXURY.softGray}`,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="800"
                        color={LUXURY.charcoal}
                      >
                        TỔNG CÒN LẠI:
                      </Typography>
                      <Typography variant="h5" color="#dc2626" fontWeight="900">
                        {(
                          parseFloat(detailModal.booking?.total_amount || 0) +
                          detailModal.folioData.reduce(
                            (sum, item) =>
                              sum +
                              parseFloat(item.total_price || item.amount || 0),
                            0,
                          ) -
                          parseFloat(detailModal.booking?.deposit_amount || 0)
                        ).toLocaleString()}{" "}
                        đ
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>

              {detailModal.booking?.status !== "Checked_out" &&
                detailModal.booking?.status !== "Cancelled" && (
                  <Box sx={{ flex: 1 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: "16px",
                        border: `1px solid ${LUXURY.softGray}`,
                        bgcolor: LUXURY.white,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="800"
                        color={LUXURY.charcoal}
                        mb={2}
                      >
                        <AddShoppingCartIcon
                          sx={{
                            verticalAlign: "middle",
                            mr: 1,
                            color: LUXURY.gold,
                          }}
                        />{" "}
                        Đặt Thêm Dịch Vụ
                      </Typography>
                      <Divider sx={{ mb: 3, borderColor: LUXURY.softGray }} />
                      <FormControl
                        fullWidth
                        size="small"
                        sx={{ mb: 3, ...inputStyle }}
                      >
                        <InputLabel>Chọn dịch vụ</InputLabel>
                        <Select
                          value={orderForm.serviceId}
                          label="Chọn dịch vụ"
                          onChange={(e) =>
                            setOrderForm({
                              ...orderForm,
                              serviceId: e.target.value,
                            })
                          }
                        >
                          {availableServices.map((svc) => (
                            <MenuItem key={svc.id} value={svc.id}>
                              {svc.name} -{" "}
                              {parseFloat(svc.price).toLocaleString()}đ
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        type="number"
                        label="Số lượng"
                        size="small"
                        value={orderForm.quantity}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            quantity: parseInt(e.target.value),
                          })
                        }
                        inputProps={{ min: 1 }}
                        sx={{ mb: 4, ...inputStyle }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleOrderService}
                        disabled={isSubmitting || !orderForm.serviceId}
                        sx={{
                          mt: "auto",
                          background: LUXURY.charcoal,
                          color: LUXURY.gold,
                          fontWeight: "800",
                          py: 1.5,
                          borderRadius: "12px",
                          "&:hover": { bgcolor: "black" },
                        }}
                      >
                        {isSubmitting ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "GỬI YÊU CẦU"
                        )}
                      </Button>
                    </Paper>
                  </Box>
                )}
            </Stack>
          </DialogContent>
          <DialogActions
            sx={{
              p: 3,
              bgcolor: LUXURY.white,
              borderTop: `1px solid ${LUXURY.softGray}`,
              justifyContent: "center",
            }}
          >
            <Button
              onClick={() =>
                setDetailModal({ open: false, booking: null, folioData: [] })
              }
              sx={{ fontWeight: "700", color: LUXURY.charcoal, px: 5, py: 1 }}
            >
              ĐÓNG TÓM TẮT
            </Button>
          </DialogActions>
        </Dialog>
        {/* 5. DIALOG HIỂN THỊ LẠI MÃ QR THANH TOÁN */}
        <Dialog
          open={qrModal.open}
          onClose={() => setQrModal({ open: false, booking: null })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "32px",
              bgcolor: LUXURY.white,
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle sx={{ pt: 4, pb: 1, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 900,
                color: LUXURY.charcoal,
              }}
            >
              Thanh Toán Đặt Cọc
            </Typography>
            <Typography variant="body2" color={LUXURY.warmGray} sx={{ mt: 1 }}>
              Mã đơn:{" "}
              <b style={{ color: LUXURY.navy }}>#{qrModal.booking?.id}</b>
            </Typography>
          </DialogTitle>

          <DialogContent
            sx={{ px: { xs: 3, md: 5 }, pb: 4, textAlign: "center" }}
          >
            <Box
              sx={{
                p: 3,
                bgcolor: LUXURY.offwhite,
                borderRadius: "20px",
                border: `2px dashed ${LUXURY.gold}`,
                mb: 3,
              }}
            >
              <Typography
                variant="caption"
                fontWeight="800"
                color={LUXURY.warmGray}
                letterSpacing={1}
              >
                SỐ TIỀN CẦN THANH TOÁN
              </Typography>
              <Typography
                variant="h3"
                fontWeight="900"
                color={LUXURY.navy}
                sx={{ mt: 1, mb: 3 }}
              >
                {parseFloat(
                  qrModal.booking?.deposit_amount || 0,
                ).toLocaleString()}
                đ
              </Typography>

              <Box
                sx={{
                  p: 2,
                  bgcolor: "white",
                  borderRadius: "24px",
                  display: "inline-block",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
                  border: `1px solid ${LUXURY.softGray}`,
                }}
              >
                {qrModal.booking && (
                  <img
                    src={`https://img.vietqr.io/image/${sysConfigs.bank_id || "MB"}-${sysConfigs.bank_account || "0866861876"}-compact2.png?amount=${qrModal.booking.deposit_amount}&addInfo=DatPhong%20${qrModal.booking.id}&accountName=${sysConfigs.bank_account_name ? encodeURIComponent(sysConfigs.bank_account_name) : "HUE%20HOTEL"}`}
                    alt="QR Payment"
                    style={{
                      width: "100%",
                      maxWidth: "260px",
                      height: "auto",
                      display: "block",
                      borderRadius: "12px",
                    }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    mt: 2,
                    display: "block",
                    color: LUXURY.warmGray,
                    fontWeight: 700,
                  }}
                >
                  Quét bằng ứng dụng Ngân hàng hoặc MoMo
                </Typography>
              </Box>

              <Typography
                variant="body1"
                sx={{ mt: 3, color: LUXURY.charcoal }}
              >
                Nội dung CK:{" "}
                <b style={{ fontSize: "1.2rem", color: LUXURY.navy }}>
                  DatPhong {qrModal.booking?.id}
                </b>
              </Typography>
            </Box>

            <Alert
              severity="warning"
              icon={<AccessTimeIcon />}
              sx={{ borderRadius: "16px", textAlign: "left" }}
            >
              Hãy hoàn tất chuyển khoản trước{" "}
              <b>
                {qrModal.booking?.hold_until
                  ? new Date(qrModal.booking.hold_until).toLocaleTimeString(
                      "vi-VN",
                    )
                  : "15 phút"}
              </b>
              . Quá hạn hệ thống sẽ tự động hủy đơn.
            </Alert>
          </DialogContent>

          <DialogActions
            sx={{
              p: { xs: 3, md: 5 },
              pt: 0,
              justifyContent: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setQrModal({ open: false, booking: null });
                fetchData(); // Load lại trạng thái xem lễ tân duyệt chưa
              }}
              sx={{
                background: `linear-gradient(135deg, ${LUXURY.navy} 0%, #2a4374 100%)`,
                color: LUXURY.white,
                fontWeight: "800",
                py: 2,
                borderRadius: "16px",
                fontSize: "1.1rem",
              }}
            >
              Tôi đã chuyển khoản xong
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={cancelModal.open}
          onClose={() => setCancelModal({ open: false, bookingId: null })}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "24px", bgcolor: LUXURY.white } }}
        >
          <DialogTitle
            sx={{
              fontWeight: "900",
              fontFamily: '"Playfair Display", serif',
              color: "#dc2626", // Màu đỏ cảnh báo
              pt: 4,
              textAlign: "center",
              fontSize: "1.8rem",
            }}
          >
            Xác Nhận Hủy Đơn
          </DialogTitle>
          <DialogContent sx={{ px: 4, pt: 1, pb: 2, textAlign: "center" }}>
            <Typography variant="body1" color={LUXURY.charcoal} sx={{ mb: 3 }}>
              Bạn có chắc chắn muốn hủy đơn đặt phòng{" "}
              <b>#{cancelModal.bookingId}</b> này không?
            </Typography>

            {/* ALERT CỦA MATERIAL UI */}
            <Alert
              severity="warning"
              sx={{
                borderRadius: "12px",
                textAlign: "left",
                bgcolor: "#fffbeb",
                color: "#92400e",
                border: "1px solid #fef3c7",
              }}
            >
              <b>Lưu ý nghiêm ngặt:</b> Việc hủy phòng có thể áp dụng chính sách
              trừ điểm tín nhiệm tài khoản hoặc phạt trừ tiền cọc tùy thuộc vào
              thời điểm bạn hủy so với ngày Check-in.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 2, justifyContent: "center", gap: 2 }}>
            <Button
              onClick={() => setCancelModal({ open: false, bookingId: null })}
              sx={{ fontWeight: "700", color: LUXURY.warmGray }}
              disabled={isSubmitting}
            >
              Suy nghĩ lại
            </Button>
            <Button
              onClick={confirmCancelBooking}
              disabled={isSubmitting}
              variant="contained"
              color="error"
              sx={{
                fontWeight: "800",
                px: 4,
                py: 1.2,
                borderRadius: "10px",
                boxShadow: "none",
                "&:hover": { boxShadow: "0 8px 16px rgba(220, 38, 38, 0.3)" },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "XÁC NHẬN HỦY"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Profile;
