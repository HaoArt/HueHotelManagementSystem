/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShieldIcon from "@mui/icons-material/Shield";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyIcon from "@mui/icons-material/VpnKey"; // Thêm Icon Chìa Khóa

import UserService from "../../services/userService";

// Đồng bộ Theme Colors
const COLORS = {
  primary: "#5e35b1", // Tím chủ đạo
  headerBg: "#5e35b1", // Nền Header bảng
  teal: "#009688",
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
  textMain: "#1a1a1a",
};

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE QUẢN LÝ SNACKBAR & CONFIRM DIALOG ---
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmColor: "primary",
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await UserService.getAllCustomers();
      setCustomers(res.data || res);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tải dữ liệu khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const searchStr = `${c.full_name} ${c.email} ${c.phone}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [customers, searchTerm]);

  // XỬ LÝ KHÓA/MỞ KHÓA TÀI KHOẢN
  const handleToggleStatus = (id, currentStatus, name) => {
    const newStatus = currentStatus === "Active" ? "Blacklisted" : "Active";
    const actionText =
      newStatus === "Blacklisted" ? "đưa vào Danh sách đen" : "mở khóa";

    setConfirmDialog({
      open: true,
      title: "Xác nhận thay đổi trạng thái",
      message: `Bạn có chắc chắn muốn ${actionText} tài khoản của khách hàng "${name}"?`,
      confirmColor: newStatus === "Blacklisted" ? "error" : "success",
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          await UserService.updateCustomerStatus(id, newStatus);
          setSnackbar({
            open: true,
            message: "Cập nhật trạng thái thành công!",
            severity: "success",
          });
          fetchCustomers();
        } catch (err) {
          setSnackbar({
            open: true,
            message:
              err.response?.data?.message || "Lỗi khi cập nhật trạng thái",
            severity: "error",
          });
        } finally {
          setIsSubmitting(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  // XỬ LÝ CẤP LẠI MẬT KHẨU
  const handleResetPassword = (id, name) => {
    setConfirmDialog({
      open: true,
      title: "Cấp lại mật khẩu",
      message: `Hệ thống sẽ cấp lại mật khẩu mặc định cho tài khoản "${name}". Bạn có muốn tiếp tục?`,
      confirmColor: "warning",
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          const res = await UserService.resetCustomerPassword(id);
          // Cho thời gian hiển thị Snackbar dài hơn (8 giây) để Admin kịp copy/đọc mật khẩu
          setSnackbar({
            open: true,
            message: res.message || "Đã cấp lại mật khẩu thành công!",
            severity: "success",
          });
        } catch (err) {
          setSnackbar({
            open: true,
            message: String(err),
            severity: "error",
          });
        } finally {
          setIsSubmitting(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  // Hàm render màu sắc cho Điểm Tín Nhiệm
  const getTrustScoreColor = (score) => {
    if (score >= 80) return "success"; // Xanh lá (Tốt)
    if (score >= 50) return "warning"; // Vàng (Cảnh báo)
    return "error"; // Đỏ (Rất tệ)
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: COLORS.teal }} />
      </Box>
    );

  const buttonStyle = {
    borderRadius: "4px",
    boxShadow: "none",
    textTransform: "none",
    fontWeight: "bold",
  };

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: COLORS.bgLight,
        minHeight: "100vh",
        overflowX: "hidden",
        pb: 10,
      }}
    >
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight="900"
          sx={{ color: COLORS.textMain, letterSpacing: "-1px" }}
          gutterBottom
        >
          Quản Lý Khách Hàng
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Theo dõi điểm tín nhiệm và quản lý tài khoản người dùng hệ thống.
        </Typography>
      </Box>

      {/* HIỂN THỊ LỖI KHI LOAD TRANG (NẾU CÓ) */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "4px" }}>
          {error}
        </Alert>
      )}

      {/* THANH TÌM KIẾM */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: "4px",
          border: `1px solid ${COLORS.border}`,
          bgcolor: "white",
        }}
      >
        <TextField
          fullWidth
          placeholder="Tìm theo Tên, Email hoặc Số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "4px",
              bgcolor: "#fff",
              "& fieldset": { borderColor: COLORS.border },
            },
          }}
          size="small"
        />
      </Paper>

      {/* BẢNG DỮ LIỆU */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "4px",
          border: `1px solid ${COLORS.border}`,
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead sx={{ bgcolor: COLORS.headerBg }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Khách hàng
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Liên hệ
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Ngày tham gia
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Điểm tín nhiệm
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", color: "white" }}
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: "bold", color: "white" }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      Không tìm thấy khách hàng nào.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      opacity: user.status === "Blacklisted" ? 0.6 : 1,
                      "& td": { borderBottom: `1px solid ${COLORS.border}` },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor:
                              user.status === "Blacklisted"
                                ? "#9e9e9e"
                                : COLORS.primary,
                            borderRadius: "4px",
                          }}
                          variant="rounded"
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography
                            fontWeight="bold"
                            color={COLORS.textMain}
                            sx={{
                              textDecoration:
                                user.status === "Blacklisted"
                                  ? "line-through"
                                  : "none",
                            }}
                          >
                            {user.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: #{user.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {user.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.phone || "Chưa cập nhật SĐT"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(user.created_at).toLocaleDateString("vi-VN")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<ShieldIcon fontSize="small" />}
                        label={`${user.trust_score} XP`}
                        color={getTrustScoreColor(user.trust_score)}
                        size="small"
                        variant={user.trust_score < 50 ? "filled" : "outlined"}
                        sx={{ fontWeight: "bold", borderRadius: "4px" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          user.status === "Active"
                            ? "Đang hoạt động"
                            : "Bị khóa"
                        }
                        sx={{
                          bgcolor:
                            user.status === "Active" ? "#e8f5e9" : "#ffebee",
                          color:
                            user.status === "Active" ? "#2e7d32" : "#c62828",
                          fontWeight: "bold",
                          borderRadius: "4px",
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {/* NÚT CẤP LẠI MẬT KHẨU */}
                      <Tooltip title="Cấp lại mật khẩu">
                        <IconButton
                          onClick={() =>
                            handleResetPassword(user.id, user.full_name)
                          }
                          sx={{
                            color: "#ed6c02", // Màu cam nổi bật
                            bgcolor: "rgba(237, 108, 2, 0.1)",
                            borderRadius: "4px",
                            mr: 1, // Kéo giãn khoảng cách với nút kế bên
                          }}
                          size="small"
                        >
                          <VpnKeyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* NÚT KHÓA / MỞ KHÓA */}
                      {user.status === "Active" ? (
                        <Tooltip title="Khóa tài khoản">
                          <IconButton
                            onClick={() =>
                              handleToggleStatus(
                                user.id,
                                user.status,
                                user.full_name,
                              )
                            }
                            sx={{
                              color: "#d32f2f",
                              bgcolor: "rgba(211, 47, 47, 0.1)",
                              borderRadius: "4px",
                            }}
                            size="small"
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Mở khóa tài khoản">
                          <IconButton
                            onClick={() =>
                              handleToggleStatus(
                                user.id,
                                user.status,
                                user.full_name,
                              )
                            }
                            sx={{
                              color: "#2e7d32",
                              bgcolor: "rgba(46, 125, 50, 0.1)",
                              borderRadius: "4px",
                            }}
                            size="small"
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* =============================================================== */}
      {/* DIALOG XÁC NHẬN CHUNG (CONFIRM) */}
      {/* =============================================================== */}
      <Dialog
        disableScrollLock={true}
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        PaperProps={{ sx: { borderRadius: "4px", minWidth: 350 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: `${confirmDialog.confirmColor}.main`,
          }}
        >
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="inherit"
            sx={buttonStyle}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color={confirmDialog.confirmColor}
            disableElevation
            sx={buttonStyle}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Xác nhận"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =============================================================== */}
      {/* SNACKBAR THÔNG BÁO NỔI */}
      {/* =============================================================== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={8000} // Đặt 8 giây để Admin kịp copy lại mật khẩu mới
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "4px", fontSize: "1rem" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCustomersPage;
