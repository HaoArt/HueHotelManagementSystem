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
  Grid,
  Badge,
  Tooltip,
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
import BadgeIcon from "@mui/icons-material/Badge"; // ĐÃ THÊM ICON THẺ ĐỊNH DANH

import { AuthContext } from "../../context/AuthContext";
import AuthService from "../../services/authService";
import BookingService from "../../services/bookingService";
import UserService from "../../services/userService";
import ServiceService from "../../services/serviceService";
import FolioService from "../../services/folioService";

const RANK_THRESHOLDS = [
  { name: "Đồng (Bronze)", min: 0, color: "#cd7f32" },
  { name: "Bạc (Silver)", min: 5000000, color: "#9e9e9e" },
  { name: "Vàng (Gold)", min: 15000000, color: "#fca311" },
  { name: "Kim Cương (Diamond)", min: 30000000, color: "#00b4d8" },
];

const COLORS = {
  primary: "#4a148c",
  secondary: "#00695c",
  cyan: "#64ffda",
  bgLight: "#f5f7fa",
  border: "#e0e0e0",
  textMain: "#333",
  textSecondary: "#666",
};

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(null);
  const [userRank, setUserRank] = useState(null);

  const [bookings, setBookings] = useState([]);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setGlobalError("");

      const [profileRes, bookingsRes, servicesRes] = await Promise.all([
        UserService.getProfile(),
        BookingService.getUserBookings(),
        ServiceService.getAllServices(),
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
    } catch (err) {
      setGlobalError("Có lỗi xảy ra ở phần tải dữ liệu hồ sơ và lịch sử.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
              bgcolor: "#fff3e0",
              color: "#e65100",
              fontWeight: "bold",
              borderRadius: 2,
            }}
          />
        );
      case "Confirmed":
        return (
          <Chip
            label="Đã xác nhận"
            sx={{
              bgcolor: "#ffecb3",
              color: "#f57c00",
              fontWeight: "bold",
              borderRadius: 2,
            }}
          />
        );
      case "Checked_in":
        return (
          <Chip
            label="Đang lưu trú"
            sx={{
              bgcolor: "#e8f5e9",
              color: "#2e7d32",
              fontWeight: "bold",
              borderRadius: 2,
            }}
          />
        );
      case "Checked_out":
        return (
          <Chip
            label="Đã hoàn tất"
            sx={{
              bgcolor: "#e0e0e0",
              color: "#424242",
              fontWeight: "bold",
              borderRadius: 2,
            }}
          />
        );
      case "Cancelled":
        return (
          <Chip
            label="Đã hủy"
            sx={{
              bgcolor: "#ffebee",
              color: "#c62828",
              fontWeight: "bold",
              borderRadius: 2,
            }}
          />
        );
      default:
        return <Chip label={status} sx={{ borderRadius: 2 }} />;
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress color="warning" />
      </Box>
    );

  return (
    <Box
      sx={{ bgcolor: COLORS.bgLight, minHeight: "100vh", py: { xs: 4, md: 6 } }}
    >
      <Container maxWidth="lg">
        {globalSuccess && (
          <Alert
            severity="success"
            onClose={() => setGlobalSuccess("")}
            sx={{ mb: 4, borderRadius: 2 }}
          >
            {globalSuccess}
          </Alert>
        )}
        {globalError && (
          <Alert
            severity="error"
            onClose={() => setGlobalError("")}
            sx={{ mb: 4, borderRadius: 2 }}
          >
            {globalError}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "flex-start",
          }}
        >
          {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN & RANK */}
          <Box sx={{ width: { xs: "100%", md: "32%" }, flexShrink: 0 }}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: COLORS.primary,
                borderRadius: "12px",
                p: 3,
                mb: 3,
                color: "white",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(74, 20, 140, 0.15)",
              }}
            >
              <WorkspacePremiumIcon
                sx={{
                  position: "absolute",
                  right: 16,
                  top: 20,
                  fontSize: 40,
                  opacity: 0.3,
                }}
              />
              <Typography variant="body1" fontWeight="500">
                {userRank?.rank_name || "Thành viên Mới"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                Giảm {userRank?.discount_percent || 0}% cho mọi đặt phòng
              </Typography>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="caption">
                  Tiến trình lên{" "}
                  {nextRankInfo?.isMax
                    ? "Max"
                    : nextRankInfo?.nextName?.split(" ")[0]}
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {nextRankInfo?.isMax
                    ? "Max"
                    : `${Number(profileData?.total_spent || 0).toLocaleString("vi-VN")} / ${Number(nextRankInfo?.nextMin || 0).toLocaleString("vi-VN")} đ`}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={nextRankInfo?.isMax ? 100 : nextRankInfo?.progress || 0}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.2)",
                  "& .MuiLinearProgress-bar": { bgcolor: "#ffb300" },
                }}
              />
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "12px",
                border: `1px solid ${COLORS.border}`,
                bgcolor: "white",
                textAlign: "center",
              }}
            >
              <Avatar
                src={profileData?.avatar_url || ""}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "#2c3e50",
                  fontSize: "2rem",
                  margin: "0 auto",
                  mb: 2,
                }}
              >
                {!profileData?.avatar_url &&
                  profileData?.full_name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={COLORS.textMain}
              >
                {profileData?.full_name}
                {profileData?.cccd_number && (
                  <Tooltip title="Tài khoản đã xác minh danh tính">
                    <VerifiedIcon
                      color="success"
                      sx={{ ml: 1, fontSize: 18, verticalAlign: "middle" }}
                    />
                  </Tooltip>
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Thành viên từ{" "}
                {new Date(profileData?.created_at || Date.now()).getFullYear()}
              </Typography>

              {/* ĐÃ CẬP NHẬT: Thêm dòng hiển thị số CCCD */}
              <Stack spacing={1.5} sx={{ mb: 3, textAlign: "left" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    color: COLORS.textSecondary,
                  }}
                >
                  <MailIcon fontSize="small" />
                  <Typography variant="body2">{profileData?.email}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    color: COLORS.textSecondary,
                  }}
                >
                  <PhoneIcon fontSize="small" />
                  <Typography variant="body2">
                    {profileData?.phone || "Chưa cập nhật SĐT"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    color: COLORS.textSecondary,
                  }}
                >
                  <BadgeIcon fontSize="small" />
                  <Typography variant="body2">
                    {profileData?.cccd_number
                      ? `CCCD: ${profileData.cccd_number}`
                      : "Chưa cập nhật CCCD"}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 3 }} />
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 4 }}
              >
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Tổng chi tiêu
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={COLORS.primary}
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
                    color="text.secondary"
                    display="block"
                  >
                    Điểm tín nhiệm
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {profileData?.trust_score || 0}/100
                  </Typography>
                </Box>
              </Stack>
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setEditModal(true)}
                  sx={{
                    bgcolor: COLORS.secondary,
                    borderRadius: "8px",
                    fontWeight: "bold",
                    textTransform: "none",
                    py: 1.2,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#004d40", boxShadow: "none" },
                  }}
                >
                  Sửa thông tin / Cập nhật CCCD
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setPasswordModal(true)}
                  sx={{
                    borderRadius: "8px",
                    fontWeight: "bold",
                    textTransform: "none",
                    color: COLORS.primary,
                    borderColor: COLORS.primary,
                    py: 1.2,
                  }}
                >
                  Đổi mật khẩu
                </Button>
              </Stack>
            </Paper>
          </Box>

          {/* CỘT PHẢI: LỊCH SỬ ĐẶT PHÒNG */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                color={COLORS.textMain}
              >
                Lịch sử hành trình
              </Typography>
              <IconButton
                sx={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px",
                }}
              >
                <FilterListIcon />
              </IconButton>
            </Box>

            {bookings.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  bgcolor: "white",
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Bạn chưa có giao dịch nào.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {bookings.map((booking) => (
                  <Paper
                    key={booking.id}
                    elevation={0}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      borderRadius: "12px",
                      border: `1px solid ${COLORS.border}`,
                      borderLeft:
                        booking.status === "Confirmed"
                          ? `6px solid ${COLORS.primary}`
                          : `1px solid ${COLORS.border}`,
                      overflow: "hidden",
                      bgcolor: "white",
                    }}
                  >
                    <Box sx={{ width: { xs: "100%", sm: 220 }, flexShrink: 0 }}>
                      <CardMedia
                        component="img"
                        sx={{
                          width: "100%",
                          height: { xs: 180, sm: "100%" },
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
                        p: { xs: 2, sm: 3 },
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
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={COLORS.textMain}
                        >
                          {booking.type_name}
                        </Typography>
                        <Box>{getStatusChip(booking.status)}</Box>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Booking ID: #{booking.id}{" "}
                        {booking.room_number
                          ? `• Phòng ${booking.room_number}`
                          : ""}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={{ xs: 3, sm: 6 }}
                        sx={{ mb: 3 }}
                      >
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Check-in
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight="500"
                            color={COLORS.textMain}
                          >
                            {new Date(booking.check_in_date).toLocaleDateString(
                              "vi-VN",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Check-out
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight="500"
                            color={COLORS.textMain}
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
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Đặt lúc{" "}
                          {new Date(booking.created_at).toLocaleDateString(
                            "vi-VN",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ReceiptLongIcon />}
                            onClick={() => handleOpenDetails(booking)}
                            disabled={isSubmitting}
                            sx={{
                              borderRadius: "6px",
                              textTransform: "none",
                              fontWeight: "bold",
                            }}
                          >
                            Hóa đơn & Dịch vụ
                          </Button>
                          {booking.status === "Checked_out" && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                setReviewModal({
                                  open: true,
                                  bookingId: booking.id,
                                  roomName: booking.type_name,
                                });
                                setReviewForm({ rating: 5, comment: "" });
                              }}
                              sx={{
                                bgcolor: COLORS.cyan,
                                color: "#004d40",
                                fontWeight: "bold",
                                textTransform: "none",
                                borderRadius: "6px",
                                boxShadow: "none",
                                "&:hover": {
                                  bgcolor: "#1de9b6",
                                  boxShadow: "none",
                                },
                              }}
                            >
                              Đánh giá
                            </Button>
                          )}
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                              color:
                                booking.status === "Cancelled"
                                  ? "text.secondary"
                                  : COLORS.primary,
                              textDecoration:
                                booking.status === "Cancelled"
                                  ? "line-through"
                                  : "none",
                            }}
                          >
                            {Number(
                              booking.grand_total || booking.total_amount || 0,
                            ).toLocaleString("vi-VN")}
                            đ
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </Box>

        {/* ======================================================= */}
        {/* MODAL SỬA THÔNG TIN */}
        {/* ======================================================= */}
        <Dialog
          open={editModal}
          onClose={() => setEditModal(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "12px" } }}
        >
          <DialogTitle
            sx={{
              fontWeight: "bold",
              color: COLORS.primary,
              pt: 3,
              textAlign: "center",
            }}
          >
            Hồ Sơ Cá Nhân
          </DialogTitle>
          <DialogContent sx={{ pb: 1 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
                mt: 1,
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <IconButton
                    component="label"
                    sx={{
                      bgcolor: COLORS.primary,
                      color: "white",
                      "&:hover": { bgcolor: "#311b92" },
                      width: 32,
                      height: 32,
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
                  sx={{ width: 90, height: 90, bgcolor: "#2c3e50" }}
                >
                  {!editForm.avatar_url &&
                    editForm.full_name?.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Thay đổi ảnh đại diện
              </Typography>
            </Box>

            <TextField
              fullWidth
              margin="normal"
              label="Họ và Tên"
              value={editForm.full_name}
              onChange={(e) =>
                setEditForm({ ...editForm, full_name: e.target.value })
              }
            />
            <TextField
              fullWidth
              margin="normal"
              label="Số điện thoại"
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />

            <TextField
              fullWidth
              margin="normal"
              label="Số Căn cước công dân"
              value={editForm.cccd_number}
              disabled={!!profileData?.cccd_number}
              onChange={(e) =>
                setEditForm({ ...editForm, cccd_number: e.target.value })
              }
              inputProps={{ maxLength: 12 }}
              helperText={
                profileData?.cccd_number
                  ? "🔒 Thông tin đã được xác thực, không thể thay đổi."
                  : "Nhập 12 số CCCD để định danh bảo vệ tài khoản."
              }
              sx={{
                mt: 2,
                bgcolor: profileData?.cccd_number ? "#f5f5f5" : "transparent",
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: "center" }}>
            <Button
              onClick={() => setEditModal(false)}
              color="inherit"
              sx={{ fontWeight: "bold", mr: 1 }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={isSubmitting}
              variant="contained"
              disableElevation
              sx={{ bgcolor: COLORS.primary, fontWeight: "bold", px: 4 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "LƯU THAY ĐỔI"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ======================================================= */}
        {/* MODAL CHI TIẾT HÓA ĐƠN VÀ ORDER DỊCH VỤ */}
        {/* ======================================================= */}
        <Dialog
          disableScrollLock={true}
          open={detailModal.open}
          onClose={() =>
            setDetailModal({ open: false, booking: null, folioData: [] })
          }
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: "4px", bgcolor: "#f4f6f8" } }}
        >
          <DialogTitle
            sx={{
              bgcolor: COLORS.primary,
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Chi tiết hóa đơn #{detailModal.booking?.id}
            </Typography>
            {getStatusChip(detailModal.booking?.status)}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems="stretch"
            >
              <Box
                sx={{
                  flex:
                    detailModal.booking?.status === "Checked_out" ||
                    detailModal.booking?.status === "Cancelled"
                      ? 1
                      : 1.5,
                  minWidth: 0,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "4px",
                    border: `1px solid ${COLORS.border}`,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "white",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color={COLORS.primary}
                    mb={2}
                  >
                    <RoomServiceIcon sx={{ verticalAlign: "middle", mr: 1 }} />{" "}
                    Dịch vụ đã sử dụng / đang gọi
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box
                    sx={{
                      flexGrow: 1,
                      overflowY: "auto",
                      maxHeight: "300px",
                      pr: 1,
                    }}
                  >
                    <List disablePadding>
                      {detailModal.folioData.length === 0 ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          textAlign="center"
                          sx={{ py: 3 }}
                        >
                          Bạn chưa sử dụng dịch vụ phát sinh nào.
                        </Typography>
                      ) : (
                        detailModal.folioData.map((item, index) => (
                          <ListItem
                            key={index}
                            disablePadding
                            sx={{
                              mb: 1.5,
                              bgcolor:
                                item.status === "Pending"
                                  ? "#fff3e0"
                                  : "#f5f5f5",
                              p: 1.5,
                              borderRadius: "4px",
                              border: `1px solid ${item.status === "Pending" ? "#ffe0b2" : COLORS.border}`,
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  fontWeight="bold"
                                  color={COLORS.textMain}
                                  variant="body2"
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
                                  color={
                                    item.status === "Pending"
                                      ? "warning.main"
                                      : "success.main"
                                  }
                                  fontWeight="500"
                                >
                                  {item.status === "Pending"
                                    ? "⏳ Đang chuẩn bị..."
                                    : "✅ Đã phục vụ"}{" "}
                                  •{" "}
                                  {item.created_at
                                    ? new Date(item.created_at).toLocaleString(
                                        "vi-VN",
                                      )
                                    : ""}
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
                                fontWeight="bold"
                                mr={1}
                                color={COLORS.textMain}
                                variant="body2"
                              >
                                {parseFloat(
                                  item.total_price || item.amount || 0,
                                ).toLocaleString()}{" "}
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
                                      bgcolor: "rgba(211,47,47,0.1)",
                                      borderRadius: "4px",
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
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Tiền phòng (sau giảm giá):
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {parseFloat(
                          detailModal.booking?.total_amount || 0,
                        ).toLocaleString()}{" "}
                        đ
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Tiền dịch vụ phát sinh:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
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
                        <Typography variant="body2" color="warning.main">
                          Đã đặt cọc/Thanh toán trước:
                        </Typography>
                        <Typography
                          variant="body2"
                          color="warning.main"
                          fontWeight="bold"
                        >
                          -{" "}
                          {parseFloat(
                            detailModal.booking?.deposit_amount || 0,
                          ).toLocaleString()}{" "}
                          đ
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ borderStyle: "dashed", my: 1 }} />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color={COLORS.textMain}
                        >
                          TỔNG CỘNG:
                        </Typography>
                      </Box>
                      <Typography
                        variant="h5"
                        color="error.main"
                        fontWeight="bold"
                      >
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

              {/* CỘT PHẢI: GỌI THÊM DỊCH VỤ */}
              {detailModal.booking?.status !== "Checked_out" &&
                detailModal.booking?.status !== "Cancelled" && (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: "4px",
                        border: `1px solid ${COLORS.border}`,
                        bgcolor: "white",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="warning.main"
                        mb={2}
                      >
                        <AddShoppingCartIcon
                          sx={{ verticalAlign: "middle", mr: 1 }}
                        />{" "}
                        Gọi thêm dịch vụ
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      <FormControl
                        fullWidth
                        size="small"
                        sx={{
                          mb: 3,
                          "& .MuiOutlinedInput-root": { borderRadius: "4px" },
                        }}
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
                        sx={{
                          mb: 3,
                          "& .MuiOutlinedInput-root": { borderRadius: "4px" },
                        }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        color="warning"
                        disableElevation
                        onClick={handleOrderService}
                        disabled={isSubmitting || !orderForm.serviceId}
                        sx={{
                          fontWeight: "bold",
                          py: 1.5,
                          borderRadius: "4px",
                          mt: "auto",
                        }}
                      >
                        {isSubmitting ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "YÊU CẦU DỊCH VỤ"
                        )}
                      </Button>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        textAlign="center"
                        mt={2}
                      >
                        Lễ tân sẽ nhận được thông báo ngay lập tức. Bạn có thể
                        hủy yêu cầu trước khi đồ được mang lên phòng.
                      </Typography>
                    </Paper>
                  </Box>
                )}
            </Stack>
          </DialogContent>
          <DialogActions
            sx={{
              p: 2,
              bgcolor: "white",
              borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            <Button
              onClick={() =>
                setDetailModal({ open: false, booking: null, folioData: [] })
              }
              variant="outlined"
              sx={{
                fontWeight: "bold",
                px: 4,
                borderRadius: "4px",
                borderColor: COLORS.border,
                color: "text.secondary",
              }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* ======================================================= */}
        {/* MODAL ĐÁNH GIÁ VÀ MODAL ĐỔI MẬT KHẨU */}
        {/* ======================================================= */}
        <Dialog
          open={reviewModal.open}
          onClose={() => setReviewModal({ ...reviewModal, open: false })}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "12px" } }}
        >
          <DialogTitle
            sx={{
              fontWeight: "bold",
              color: COLORS.primary,
              textAlign: "center",
              pt: 4,
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
            }}
          >
            <Typography variant="body1" sx={{ mb: 2 }}>
              Cảm nhận của bạn về <b>{reviewModal.roomName}</b>
            </Typography>
            <Rating
              value={reviewForm.rating}
              onChange={(e, newValue) =>
                setReviewForm({ ...reviewForm, rating: newValue })
              }
              size="large"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Bình luận của bạn"
              variant="outlined"
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: "center", pb: 4 }}>
            <Button
              onClick={() => setReviewModal({ ...reviewModal, open: false })}
              color="inherit"
              sx={{ fontWeight: "bold", mr: 1 }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              variant="contained"
              disableElevation
              sx={{ bgcolor: COLORS.primary, fontWeight: "bold", px: 4 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "GỬI ĐÁNH GIÁ"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={passwordModal}
          onClose={() => setPasswordModal(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "12px" } }}
        >
          <DialogTitle
            sx={{ fontWeight: "bold", color: COLORS.primary, pt: 3 }}
          >
            Đổi mật khẩu
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu hiện tại"
              type="password"
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  current_password: e.target.value,
                })
              }
            />
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu mới"
              type="password"
              value={passwordForm.new_password}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  new_password: e.target.value,
                })
              }
            />
            <TextField
              fullWidth
              margin="normal"
              label="Xác nhận mật khẩu mới"
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirm_password: e.target.value,
                })
              }
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setPasswordModal(false)}
              color="inherit"
              sx={{ fontWeight: "bold" }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isSubmitting}
              variant="contained"
              disableElevation
              sx={{ bgcolor: COLORS.primary, fontWeight: "bold" }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "ĐỔI MẬT KHẨU"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Profile;
