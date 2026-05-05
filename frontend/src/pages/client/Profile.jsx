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
} from "@mui/material";

// Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import MailIcon from "@mui/icons-material/Mail";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import LinearProgress from "@mui/material/LinearProgress";

import { AuthContext } from "../../context/AuthContext";
import AuthService from "../../services/authService";
import BookingService from "../../services/bookingService";
import UserService from "../../services/userService";

const RANK_THRESHOLDS = [
  { name: "Đồng (Bronze)", min: 0, color: "#cd7f32" },
  { name: "Bạc (Silver)", min: 5000000, color: "#9e9e9e" },
  { name: "Vàng (Gold)", min: 15000000, color: "#fca311" },
  { name: "Kim Cương (Diamond)", min: 30000000, color: "#00b4d8" },
];

// Theme Colors theo thiết kế
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
  const [loading, setLoading] = useState(true);

  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");

  const [reviewModal, setReviewModal] = useState({
    open: false,
    bookingId: null,
    roomName: "",
  });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "" });

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

      const [profileRes, bookingsRes] = await Promise.all([
        UserService.getProfile(),
        BookingService.getUserBookings(),
      ]);

      const { userInfo, rank } = profileRes.data || profileRes;
      setProfileData(userInfo);
      setUserRank(rank);

      setEditForm({
        full_name: userInfo?.full_name || "",
        phone: userInfo?.phone || "",
      });
      setBookings(bookingsRes.data || bookingsRes || []);
    } catch (err) {
      console.error("LỖI Ở PHẦN TẢI DỮ LIỆU HỒ SƠ:", err);
      setGlobalError("Có lỗi xảy ra ở phần tải dữ liệu hồ sơ và lịch sử.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitReview = async () => {
    try {
      await BookingService.addReview(reviewModal.bookingId, reviewForm);
      setGlobalSuccess("Gửi đánh giá thành công!");
      setReviewModal({ open: false, bookingId: null, roomName: "" });
      fetchData();
    } catch (err) {
      console.error("LỖI Ở PHẦN GỬI ĐÁNH GIÁ:", err);
      setGlobalError("Có lỗi xảy ra ở phần gửi đánh giá.");
      setReviewModal({ ...reviewModal, open: false });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await UserService.updateProfile(editForm);
      setGlobalSuccess("Cập nhật hồ sơ thành công!");
      setEditModal(false);
      setUser((prev) => ({ ...prev, full_name: editForm.full_name }));
      fetchData();
    } catch (err) {
      console.error("LỖI Ở PHẦN CẬP NHẬT HỒ SƠ:", err);
      setGlobalError("Có lỗi xảy ra ở phần cập nhật thông tin cá nhân.");
      setEditModal(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return setGlobalError("Mật khẩu xác nhận không khớp!");
    }
    try {
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
      console.error("LỖI Ở PHẦN ĐỔI MẬT KHẨU:", err);
      setGlobalError("Có lỗi xảy ra ở phần đổi mật khẩu.");
      setPasswordModal(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Chip label="Chờ thanh toán" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: "bold", borderRadius: 2 }} />
        );
      case "Confirmed":
        return (
          <Chip label="Đã xác nhận" sx={{ bgcolor: "#ffecb3", color: "#f57c00", fontWeight: "bold", borderRadius: 2 }} />
        );
      case "Checked_in":
        return (
          <Chip label="Đang lưu trú" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: "bold", borderRadius: 2 }} />
        );
      case "Checked_out":
        return (
          <Chip label="Đã hoàn tất" sx={{ bgcolor: "#e0e0e0", color: "#424242", fontWeight: "bold", borderRadius: 2 }} />
        );
      case "Cancelled":
        return (
          <Chip label="Đã hủy" sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: "bold", borderRadius: 2 }} />
        );
      default:
        return <Chip label={status} sx={{ borderRadius: 2 }} />;
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress color="warning" />
      </Box>
    );

  return (
    <Box sx={{ bgcolor: COLORS.bgLight, minHeight: "100vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        {globalSuccess && (
          <Alert severity="success" onClose={() => setGlobalSuccess("")} sx={{ mb: 4, borderRadius: 2 }}>
            {globalSuccess}
          </Alert>
        )}
        {globalError && (
          <Alert severity="error" onClose={() => setGlobalError("")} sx={{ mb: 4, borderRadius: 2 }}>
            {globalError}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, alignItems: "flex-start" }}>
          
          {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN & RANK */}
          <Box sx={{ width: { xs: "100%", md: "32%" }, flexShrink: 0 }}>
            {/* THẺ RANK (Màu Tím) */}
            <Paper elevation={0} sx={{ bgcolor: COLORS.primary, borderRadius: "12px", p: 3, mb: 3, color: "white", position: "relative", overflow: "hidden", boxShadow: "0 4px 20px rgba(74, 20, 140, 0.15)" }}>
              <WorkspacePremiumIcon sx={{ position: "absolute", right: 16, top: 20, fontSize: 40, opacity: 0.3 }} />

              <Typography variant="body1" fontWeight="500">
                {userRank?.rank_name || "Thành viên Mới"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                Giảm {userRank?.discount_percent || 0}% cho mọi đặt phòng
              </Typography>

              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="caption">
                  Tiến trình lên {nextRankInfo?.isMax ? "Max" : nextRankInfo?.nextName?.split(" ")[0]}
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {/* ĐÃ ÉP KIỂU NUMBER VÀ FORMAT CHUẨN TẠI ĐÂY */}
                  {nextRankInfo?.isMax
                    ? "Max"
                    : `${Number(profileData?.total_spent || 0).toLocaleString("vi-VN")} / ${Number(nextRankInfo?.nextMin || 0).toLocaleString("vi-VN")} đ`}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={nextRankInfo?.isMax ? 100 : nextRankInfo?.progress || 0}
                sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.2)", "& .MuiLinearProgress-bar": { bgcolor: "#ffb300" } }}
              />
            </Paper>

            {/* THẺ THÔNG TIN CÁ NHÂN */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: "12px", border: `1px solid ${COLORS.border}`, bgcolor: "white", textAlign: "center" }}>
              <Avatar src={profileData?.avatar_url || ""} sx={{ width: 80, height: 80, bgcolor: "#2c3e50", fontSize: "2rem", margin: "0 auto", mb: 2 }}>
                {profileData?.full_name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" fontWeight="bold" color={COLORS.textMain}>
                {profileData?.full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Thành viên từ {new Date(profileData?.created_at || Date.now()).getFullYear()}
              </Typography>

              <Stack spacing={1.5} sx={{ mb: 3, textAlign: "left" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: COLORS.textSecondary }}>
                  <MailIcon fontSize="small" />
                  <Typography variant="body2">{profileData?.email}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: COLORS.textSecondary }}>
                  <PhoneIcon fontSize="small" />
                  <Typography variant="body2">{profileData?.phone || "Chưa cập nhật"}</Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" display="block">Tổng chi tiêu</Typography>
                  <Typography variant="body1" fontWeight="bold" color={COLORS.primary}>
                    {/* ĐÃ ÉP KIỂU NUMBER VÀ FORMAT CHUẨN TẠI ĐÂY */}
                    {Number(profileData?.total_spent || 0).toLocaleString("vi-VN")}đ
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" display="block">Điểm tín nhiệm</Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    {profileData?.trust_score || 0}/100
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2}>
                <Button fullWidth variant="contained" onClick={() => setEditModal(true)} sx={{ bgcolor: COLORS.secondary, borderRadius: "8px", fontWeight: "bold", textTransform: "none", py: 1.2, boxShadow: "none", "&:hover": { bgcolor: "#004d40", boxShadow: "none" } }}>
                  Sửa thông tin
                </Button>
                <Button fullWidth variant="outlined" onClick={() => setPasswordModal(true)} sx={{ borderRadius: "8px", fontWeight: "bold", textTransform: "none", color: COLORS.primary, borderColor: COLORS.primary, py: 1.2 }}>
                  Đổi mật khẩu
                </Button>
              </Stack>
            </Paper>
          </Box>

          {/* CỘT PHẢI: LỊCH SỬ ĐẶT PHÒNG */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" color={COLORS.textMain}>Lịch sử hành trình</Typography>
              <IconButton sx={{ border: `1px solid ${COLORS.border}`, borderRadius: "8px" }}>
                <FilterListIcon />
              </IconButton>
            </Box>

            {bookings.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8, bgcolor: "white", borderRadius: "12px", border: `1px solid ${COLORS.border}` }}>
                <Typography variant="h6" color="text.secondary">Bạn chưa có giao dịch nào.</Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {bookings.map((booking, index) => (
                  <Paper key={booking.id} elevation={0} sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, borderRadius: "12px", border: `1px solid ${COLORS.border}`, borderLeft: booking.status === "Confirmed" ? `6px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`, overflow: "hidden", bgcolor: "white" }}>
                    <Box sx={{ width: { xs: "100%", sm: 220 }, flexShrink: 0 }}>
                      <CardMedia component="img" sx={{ width: "100%", height: { xs: 180, sm: "100%" }, objectFit: "cover" }} image={booking.image_url || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"} alt={booking.type_name} />
                    </Box>

                    <Box sx={{ p: { xs: 2, sm: 3 }, flex: 1, display: "flex", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                        <Typography variant="h6" fontWeight="bold" color={COLORS.textMain}>{booking.type_name}</Typography>
                        <Box>{getStatusChip(booking.status)}</Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Booking ID: #{booking.id} {booking.room_number ? `• Phòng ${booking.room_number}` : ""}
                      </Typography>

                      <Stack direction="row" spacing={{ xs: 3, sm: 6 }} sx={{ mb: 3 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Check-in</Typography>
                          <Typography variant="body1" fontWeight="500" color={COLORS.textMain}>
                            {new Date(booking.check_in_date).toLocaleDateString("vi-VN", { month: "short", day: "numeric", year: "numeric" })}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Check-out</Typography>
                          <Typography variant="body1" fontWeight="500" color={COLORS.textMain}>
                            {new Date(booking.check_out_date).toLocaleDateString("vi-VN", { month: "short", day: "numeric", year: "numeric" })}
                          </Typography>
                        </Box>
                      </Stack>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: "auto" }}>
                        <Typography variant="body2" color="text.secondary">
                          Đặt lúc {new Date(booking.created_at).toLocaleDateString("vi-VN", { month: "short", day: "numeric", year: "numeric" })}
                        </Typography>

                        <Stack direction="row" spacing={2} alignItems="center">
                          {booking.status === "Checked_out" && (
                            <Button
                              variant="contained" size="small"
                              onClick={() => {
                                setReviewModal({ open: true, bookingId: booking.id, roomName: booking.type_name });
                                setReviewForm({ rating: 5, comment: "" });
                              }}
                              sx={{ bgcolor: COLORS.cyan, color: "#004d40", fontWeight: "bold", textTransform: "none", borderRadius: "6px", boxShadow: "none", "&:hover": { bgcolor: "#1de9b6", boxShadow: "none" } }}
                            >
                              Đánh giá trải nghiệm
                            </Button>
                          )}
                          <Typography variant="h6" fontWeight="bold" sx={{ color: booking.status === "Cancelled" ? "text.secondary" : COLORS.primary, textDecoration: booking.status === "Cancelled" ? "line-through" : "none" }}>
                            {/* ĐÃ ÉP KIỂU NUMBER VÀ FORMAT CHUẨN TẠI ĐÂY */}
                            {Number(booking.total_amount || 0).toLocaleString("vi-VN")}đ
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

        {/* CÁC MODAL GIỮ NGUYÊN BÊN TRONG NÀY */}
        {/* MODAL: ĐÁNH GIÁ TRẢI NGHIỆM */}
        <Dialog open={reviewModal.open} onClose={() => setReviewModal({ ...reviewModal, open: false })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
          <DialogTitle sx={{ fontWeight: "bold", color: COLORS.primary, textAlign: "center", pt: 4 }}>Đánh giá trải nghiệm</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", pb: 1 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>Cảm nhận của bạn về <b>{reviewModal.roomName}</b></Typography>
            <Rating value={reviewForm.rating} onChange={(e, newValue) => setReviewForm({ ...reviewForm, rating: newValue })} size="large" sx={{ mb: 3 }} />
            <TextField fullWidth multiline rows={4} label="Bình luận của bạn" variant="outlined" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: "center", pb: 4 }}>
            <Button onClick={() => setReviewModal({ ...reviewModal, open: false })} color="inherit" sx={{ fontWeight: "bold", mr: 1 }}>Hủy</Button>
            <Button onClick={handleSubmitReview} variant="contained" disableElevation sx={{ bgcolor: COLORS.primary, fontWeight: "bold", px: 4 }}>GỬI ĐÁNH GIÁ</Button>
          </DialogActions>
        </Dialog>

        {/* MODAL: SỬA THÔNG TIN */}
        <Dialog open={editModal} onClose={() => setEditModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
          <DialogTitle sx={{ fontWeight: "bold", color: COLORS.primary, pt: 3 }}>Sửa thông tin</DialogTitle>
          <DialogContent>
            <TextField fullWidth margin="normal" label="Họ và Tên" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
            <TextField fullWidth margin="normal" label="Số điện thoại" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setEditModal(false)} color="inherit" sx={{ fontWeight: "bold" }}>Hủy</Button>
            <Button onClick={handleUpdateProfile} variant="contained" disableElevation sx={{ bgcolor: COLORS.primary, fontWeight: "bold" }}>LƯU THAY ĐỔI</Button>
          </DialogActions>
        </Dialog>

        {/* MODAL: ĐỔI MẬT KHẨU */}
        <Dialog open={passwordModal} onClose={() => setPasswordModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
          <DialogTitle sx={{ fontWeight: "bold", color: COLORS.primary, pt: 3 }}>Đổi mật khẩu</DialogTitle>
          <DialogContent>
            <TextField fullWidth margin="normal" label="Mật khẩu hiện tại" type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
            <TextField fullWidth margin="normal" label="Mật khẩu mới" type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} />
            <TextField fullWidth margin="normal" label="Xác nhận mật khẩu mới" type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setPasswordModal(false)} color="inherit" sx={{ fontWeight: "bold" }}>Hủy</Button>
            <Button onClick={handleChangePassword} variant="contained" disableElevation sx={{ bgcolor: COLORS.primary, fontWeight: "bold" }}>ĐỔI MẬT KHẨU</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Profile;