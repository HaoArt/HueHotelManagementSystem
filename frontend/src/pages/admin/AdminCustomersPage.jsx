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
  InputLabel,
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

const COLORS = {
  primary: "#5e35b1",
  headerBg: "#5e35b1",
  teal: "#009688",
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
  textMain: "#1a1a1a",
};

const AdminAccountsPage = () => {
  const { user } = useContext(AuthContext); // Lấy role của user đang đăng nhập
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
      title: "Xác nhận thay đổi trạng thái",
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
          sx={{ bgcolor: "#e1bee7", color: "#6a1b9a", fontWeight: "bold" }}
          size="small"
        />
      );
    if (role === "Receptionist")
      return (
        <Chip
          icon={<SupportAgentIcon fontSize="small" />}
          label="Lễ tân"
          sx={{ bgcolor: "#e0f7fa", color: "#1565c0", fontWeight: "bold" }}
          size="small"
        />
      );
    return (
      <Chip
        icon={<PersonIcon fontSize="small" />}
        label="Khách hàng"
        sx={{ bgcolor: "#f5f5f5", color: "#616161", fontWeight: "bold" }}
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
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: COLORS.teal }} />
      </Box>
    );

  return (
    <Box sx={{ p: 4, bgcolor: COLORS.bgLight, minHeight: "100vh", pb: 10 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{ color: COLORS.textMain, letterSpacing: "-1px" }}
            gutterBottom
          >
            Quản Lý Tài Khoản
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phân quyền hệ thống, quản lý nhân viên và khách hàng.
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={() => setAddDialog(true)}
            sx={{
              bgcolor: COLORS.teal,
              "&:hover": { bgcolor: "#00796b" },
              fontWeight: "bold",
              py: 1,
              px: 3,
              boxShadow: "none",
            }}
          >
            THÊM TÀI KHOẢN
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: "4px",
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <TextField
          fullWidth
          placeholder="Tìm theo Tên, Email, SĐT hoặc Quyền..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Paper>

      <Paper
        elevation={0}
        sx={{ border: `1px solid ${COLORS.border}`, overflow: "hidden" }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: COLORS.headerBg }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Tài khoản
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Vai trò (Role)
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Liên hệ
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Uy tín (Chỉ KH)
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
              {filteredAccounts.map((acc) => (
                <TableRow
                  key={acc.id}
                  hover
                  sx={{
                    opacity: acc.status === "Blacklisted" ? 0.6 : 1,
                    "& td": { borderBottom: `1px solid ${COLORS.border}` },
                  }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor:
                            acc.role === "Admin"
                              ? "#7b1fa2"
                              : acc.role === "Receptionist"
                                ? "#1976d2"
                                : "#9e9e9e",
                          borderRadius: "4px",
                        }}
                        variant="rounded"
                      >
                        {acc.role === "Admin" ? (
                          <AdminPanelSettingsIcon />
                        ) : acc.role === "Receptionist" ? (
                          <SupportAgentIcon />
                        ) : (
                          <PersonIcon />
                        )}
                      </Avatar>
                      <Box>
                        <Typography
                          fontWeight="bold"
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
                    <Typography variant="body2" fontWeight="500">
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
                        variant="outlined"
                        sx={{ fontWeight: "bold" }}
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
                        bgcolor:
                          acc.status === "Active" ? "#e8f5e9" : "#ffebee",
                        color: acc.status === "Active" ? "#2e7d32" : "#c62828",
                        fontWeight: "bold",
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {isAdmin ? (
                      <>
                        <Tooltip title="Cấp lại mật khẩu">
                          <IconButton
                            onClick={() =>
                              handleResetPassword(acc.id, acc.full_name)
                            }
                            sx={{
                              color: "#ed6c02",
                              bgcolor: "rgba(237, 108, 2, 0.1)",
                              borderRadius: "4px",
                              mr: 1,
                            }}
                            size="small"
                          >
                            <VpnKeyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {acc.role !== "Admin" && (
                          <Tooltip
                            title={
                              acc.status === "Active"
                                ? "Khóa tài khoản"
                                : "Mở khóa"
                            }
                          >
                            <IconButton
                              onClick={() =>
                                handleToggleStatus(
                                  acc.id,
                                  acc.status,
                                  acc.full_name,
                                )
                              }
                              sx={{
                                color:
                                  acc.status === "Active"
                                    ? "#d32f2f"
                                    : "#2e7d32",
                                bgcolor:
                                  acc.status === "Active"
                                    ? "rgba(211, 47, 47, 0.1)"
                                    : "rgba(46, 125, 50, 0.1)",
                                borderRadius: "4px",
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
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Chỉ Xem
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* DIALOG THÊM TÀI KHOẢN MỚI */}
      <Dialog
        open={addDialog}
        onClose={() => setAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ bgcolor: COLORS.teal, color: "white", fontWeight: "bold" }}
        >
          Tạo Tài Khoản Nội Bộ
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ và Tên (*)"
                size="small"
                value={addForm.full_name}
                onChange={(e) =>
                  setAddForm({ ...addForm, full_name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                size="small"
                value={addForm.phone}
                onChange={(e) =>
                  setAddForm({ ...addForm, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email đăng nhập (*)"
                type="email"
                size="small"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({ ...addForm, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mật khẩu khởi tạo (*)"
                type="password"
                size="small"
                value={addForm.password}
                onChange={(e) =>
                  setAddForm({ ...addForm, password: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Quyền truy cập (Role)</InputLabel>
                <Select
                  value={addForm.role}
                  label="Quyền truy cập (Role)"
                  onChange={(e) =>
                    setAddForm({ ...addForm, role: e.target.value })
                  }
                >
                  <MenuItem value="Receptionist">
                    Lễ tân (Receptionist)
                  </MenuItem>
                  <MenuItem value="Admin">Quản trị viên (Admin)</MenuItem>
                  <MenuItem value="Customer">Khách hàng (Customer)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleAddAccount}
            variant="contained"
            sx={{ bgcolor: COLORS.teal }}
            disableElevation
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Tạo Tài Khoản"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
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
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color={confirmDialog.confirmColor}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAccountsPage;
