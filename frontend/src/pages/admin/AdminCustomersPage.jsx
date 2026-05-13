/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useContext } from "react";
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
  FormControl,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShieldIcon from "@mui/icons-material/Shield";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

import UserService from "../../services/userService";
import { AuthContext } from "../../context/AuthContext";

// ĐỒNG BỘ BẢNG MÀU CHUẨN TỪ MẪU CỦA THẦY (Ảnh 2 & Admin Bookings)
const COLORS = {
  primary: "#5e35b1",
  navy: "#0b1b3f", // Màu xanh Navy đậm cho Header bảng
  teal: "#009688",
  orange: "#e65100", // Màu Cam nổi bật cho nút bấm
  error: "#d32f2f",
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
  textMain: "#1a1a1a",
};

// HIỆU ỨNG GLASSMORPHISM SANG TRỌNG
const glassCardSx = {
  borderRadius: 1,
  border: "1px solid rgba(255,255,255,0.4)",
  bgcolor: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 12px 30px rgba(11, 27, 63, 0.1)",
  transition: "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 18px 36px rgba(11, 27, 63, 0.15)",
    borderColor: "rgba(0, 150, 136, 0.35)",
  },
};

const AdminAccountsPage = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "Admin";

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [addDialog, setAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "Receptionist",
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await UserService.getAllAccounts();
      setAccounts(res.data || res);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tải dữ liệu tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((c) => {
      const searchStr =
        `${c.full_name} ${c.email} ${c.phone} ${c.role}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [accounts, searchTerm]);

  const handleToggleStatus = (id, currentStatus, name) => {
    const newStatus = currentStatus === "Active" ? "Blacklisted" : "Active";
    const actionText = newStatus === "Blacklisted" ? "khóa" : "mở khóa";

    setConfirmDialog({
      open: true,
      title: "Xác nhận thay đổi",
      message: `Bạn có chắc chắn muốn ${actionText} tài khoản "${name}"?`,
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
          fetchAccounts();
        } catch (err) {
          setSnackbar({
            open: true,
            message: err.response?.data?.message || "Lỗi cập nhật",
            severity: "error",
          });
        } finally {
          setIsSubmitting(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  const handleResetPassword = (id, name) => {
    setConfirmDialog({
      open: true,
      title: "Cấp lại mật khẩu",
      message: `Hệ thống sẽ cấp lại mật khẩu mặc định (Huehotel@123) cho tài khoản "${name}". Tiếp tục?`,
      confirmColor: "warning",
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          const res = await UserService.resetCustomerPassword(id);
          setSnackbar({
            open: true,
            message: res.message || "Đã cấp lại mật khẩu!",
            severity: "success",
          });
        } catch (err) {
          setSnackbar({ open: true, message: String(err), severity: "error" });
        } finally {
          setIsSubmitting(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  const handleAddAccount = async () => {
    if (!addForm.full_name || !addForm.email || !addForm.password) {
      return setSnackbar({
        open: true,
        message: "Vui lòng nhập đủ Họ tên, Email và Mật khẩu!",
        severity: "warning",
      });
    }
    try {
      setIsSubmitting(true);
      await UserService.createAccount(addForm);
      setSnackbar({
        open: true,
        message: "Tạo tài khoản mới thành công!",
        severity: "success",
      });
      setAddDialog(false);
      setAddForm({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        role: "Receptionist",
      });
      fetchAccounts();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Lỗi tạo tài khoản",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleChip = (role) => {
    if (role === "Admin")
      return (
        <Chip
          icon={<AdminPanelSettingsIcon fontSize="small" />}
          label="Quản trị viên"
          sx={{
            bgcolor: "rgba(11,27,63,0.1)",
            color: COLORS.navy,
            fontWeight: 700,
            borderRadius: 1,
            border: "none",
          }}
          size="small"
        />
      );
    if (role === "Receptionist")
      return (
        <Chip
          icon={<SupportAgentIcon fontSize="small" />}
          label="Lễ tân"
          sx={{
            bgcolor: "rgba(0,150,136,0.1)",
            color: COLORS.teal,
            fontWeight: 700,
            borderRadius: 1,
            border: "none",
          }}
          size="small"
        />
      );
    return (
      <Chip
        icon={<PersonIcon fontSize="small" />}
        label="Khách hàng"
        sx={{
          bgcolor: "rgba(100,116,139,0.1)",
          color: "#475569",
          fontWeight: 700,
          borderRadius: 1,
          border: "none",
        }}
        size="small"
      />
    );
  };

  const getTrustScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 50) return "warning";
    return "error";
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: COLORS.teal }} />
      </Box>
    );

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 14% 8%, rgba(0,150,136,0.07), transparent 34%), radial-gradient(circle at 88% 92%, rgba(11,27,63,0.06), transparent 32%), linear-gradient(180deg, #f6f9fe 0%, #eef3fa 52%, #f8fbff 100%)",
        pb: 10,
      }}
    >
      {/* HEADER ĐỒNG BỘ */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "flex-start" },
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 2.5, sm: 3, md: 4 },
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ maxWidth: { xs: "100%", md: "68%" } }}>
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{
              color: COLORS.navy,
              letterSpacing: "-0.03em",
              fontSize: { xs: "1.65rem", sm: "2rem", md: "2.2rem" },
            }}
          >
            Quản Lý Tài Khoản
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Phân quyền hệ thống, quản lý nhân viên và khách hàng.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
          <Chip
            label={`${filteredAccounts.length} tài khoản`}
            sx={{
              bgcolor: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(11,27,63,0.12)",
              color: COLORS.navy,
              fontWeight: 700,
              borderRadius: 1,
              px: 0.5,
              boxShadow: "0 6px 16px rgba(11, 27, 63, 0.08)",
            }}
          />
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => setAddDialog(true)}
              disableElevation
              sx={{
                background: "linear-gradient(135deg, #e65100 0%, #ff8a3d 100%)", // Màu cam chuẩn theo ảnh mẫu
                fontWeight: 700,
                borderRadius: 1,
                textTransform: "none",
                px: 2.25,
                py: 1,
                boxShadow: "0 10px 20px rgba(230, 81, 0, 0.24)",
                "&:hover": { boxShadow: "0 14px 24px rgba(230,81,0,0.32)" },
              }}
            >
              THÊM TÀI KHOẢN
            </Button>
          )}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
          {error}
        </Alert>
      )}

      {/* TABLE CONTAINER ĐỒNG BỘ */}
      <Paper
        elevation={0}
        sx={{
          ...glassCardSx,
          p: 0,
          border: "1px solid rgba(11,27,63,0.12)",
          overflow: "hidden",
        }}
      >
        {/* THANH TÌM KIẾM */}
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(11,27,63,0.1)", bgcolor: "rgba(255,255,255,0.86)" }}>
          <TextField
            fullWidth
            placeholder="Tìm theo Tên, Email, SĐT hoặc Quyền..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.95)",
                "& fieldset": { borderColor: "rgba(11,27,63,0.18)" },
                "&:hover fieldset": { borderColor: "rgba(0,150,136,0.38)" },
                "&.Mui-focused fieldset": { borderColor: COLORS.teal },
              },
            }}
            size="small"
          />
        </Box>

        <TableContainer sx={{ bgcolor: "rgba(255,255,255,0.72)", overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            {/* HEADER BẢNG XANH NAVY CHUẨN */}
            <TableHead
              sx={{
                background:
                  "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
              }}
            >
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Tài khoản
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Vai trò (Role)
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Liên hệ
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Uy tín (Chỉ KH)
                </TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Trạng thái
                </TableCell>
                <TableCell align="right" sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      Không có tài khoản nào phù hợp.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((acc) => (
                  <TableRow
                    key={acc.id}
                    hover
                    sx={{
                      transition: "background-color 0.2s ease",
                      "& td": {
                        borderBottom: "1px solid rgba(11,27,63,0.08)",
                        py: 1.5,
                      },
                      "&:nth-of-type(even)": {
                        bgcolor: "rgba(11,27,63,0.018)",
                      },
                      "&:hover": {
                        bgcolor: "rgba(0,150,136,0.07)",
                      },
                      opacity: acc.status === "Blacklisted" ? 0.6 : 1,
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor:
                              acc.role === "Admin"
                                ? "rgba(11,27,63,0.1)"
                                : acc.role === "Receptionist"
                                  ? "rgba(0,150,136,0.1)"
                                  : "rgba(100,116,139,0.1)",
                            color:
                              acc.role === "Admin"
                                ? COLORS.navy
                                : acc.role === "Receptionist"
                                  ? COLORS.teal
                                  : "#64748b",
                            borderRadius: 1,
                            fontWeight: "bold",
                            border: "1px solid rgba(255,255,255,0.5)",
                          }}
                          variant="rounded"
                        >
                          {acc.full_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography
                            fontWeight="bold"
                            color={COLORS.textMain}
                            sx={{
                              textDecoration:
                                acc.status === "Blacklisted"
                                  ? "line-through"
                                  : "none",
                            }}
                          >
                            {acc.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: #{acc.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{getRoleChip(acc.role)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {acc.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {acc.phone || "---"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {acc.role === "Customer" ? (
                        <Chip
                          icon={<ShieldIcon fontSize="small" />}
                          label={`${acc.trust_score} XP`}
                          color={getTrustScoreColor(acc.trust_score)}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            borderRadius: 1,
                            bgcolor: `${getTrustScoreColor(acc.trust_score)}.light`,
                            color: "white"
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Không áp dụng
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={acc.status === "Active" ? "Hoạt động" : "Bị khóa"}
                        sx={{
                          bgcolor: acc.status === "Active" ? "#e8f5e9" : "white",
                          color: acc.status === "Active" ? "#2e7d32" : COLORS.error,
                          border: acc.status === "Active" ? "none" : `1px solid ${COLORS.error}`,
                          fontWeight: 700,
                          borderRadius: 1,
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {isAdmin ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Cấp lại mật khẩu">
                            <IconButton
                              onClick={() => handleResetPassword(acc.id, acc.full_name)}
                              sx={{
                                color: COLORS.orange,
                                bgcolor: "rgba(237, 108, 2, 0.1)",
                                border: "1px solid rgba(237, 108, 2, 0.2)",
                                borderRadius: 1,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "rgba(237, 108, 2, 0.18)",
                                  transform: "translateY(-1px)",
                                },
                              }}
                              size="small"
                            >
                              <VpnKeyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {acc.role !== "Admin" && (
                            <Tooltip
                              title={
                                acc.status === "Active" ? "Khóa tài khoản" : "Mở khóa"
                              }
                            >
                              <IconButton
                                onClick={() => handleToggleStatus(acc.id, acc.status, acc.full_name)}
                                sx={{
                                  color: acc.status === "Active" ? COLORS.error : "#2e7d32",
                                  bgcolor: acc.status === "Active" ? "rgba(211, 47, 47, 0.1)" : "rgba(46, 125, 50, 0.1)",
                                  border: `1px solid ${acc.status === "Active" ? "rgba(211, 47, 47, 0.2)" : "rgba(46, 125, 50, 0.2)"}`,
                                  borderRadius: 1,
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    bgcolor: acc.status === "Active" ? "rgba(211, 47, 47, 0.18)" : "rgba(46, 125, 50, 0.18)",
                                    transform: "translateY(-1px)",
                                  },
                                }}
                                size="small"
                              >
                                {acc.status === "Active" ? (
                                  <BlockIcon fontSize="small" />
                                ) : (
                                  <CheckCircleIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Chỉ Xem
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* DIALOG THÊM TÀI KHOẢN MỚI ĐỒNG BỘ MÀU CAM */}
      <Dialog
        disableScrollLock={true}
        open={addDialog}
        onClose={() => setAddDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            bgcolor: "#f8fafc",
            border: "1px solid rgba(11,27,63,0.12)",
            boxShadow: "0 22px 44px rgba(11, 27, 63, 0.22)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #e65100 0%, #ff8a3d 100%)", // Nền Cam
            color: "white",
            fontWeight: 800,
            textAlign: "center",
            py: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          TẠO TÀI KHOẢN NỘI BỘ
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 1,
              border: "1px solid #e2e8f0",
              bgcolor: "white",
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Họ và Tên (*)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={addForm.full_name}
                  onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Số điện thoại
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Email đăng nhập (*)
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  size="small"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Mật khẩu khởi tạo (*)
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  size="small"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Quyền truy cập (Role)
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  >
                    <MenuItem value="Receptionist">Lễ tân (Receptionist)</MenuItem>
                    <MenuItem value="Admin">Quản trị viên (Admin)</MenuItem>
                    <MenuItem value="Customer">Khách hàng (Customer)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            bgcolor: "white",
            borderTop: "1px solid #e2e8f0",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={() => setAddDialog(false)} color="inherit" sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1 }}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleAddAccount}
            variant="contained"
            disableElevation
            disabled={isSubmitting}
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #e65100 0%, #ff8a3d 100%)", // Nút bấm Cam
              px: 4,
              py: 1,
              borderRadius: 1,
              textTransform: "none",
              boxShadow: "0 10px 20px rgba(230,81,0,0.2)",
              "&:hover": { boxShadow: "0 12px 24px rgba(230,81,0,0.28)" },
            }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "TẠO TÀI KHOẢN"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DIALOG ĐỒNG BỘ */}
      <Dialog
        disableScrollLock={true}
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        PaperProps={{
          sx: {
            borderRadius: 1,
            minWidth: 350,
            border: "1px solid rgba(11,27,63,0.12)",
            boxShadow: "0 22px 44px rgba(11, 27, 63, 0.22)",
          },
        }}
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
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color={confirmDialog.confirmColor}
            disableElevation
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 1 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAccountsPage;