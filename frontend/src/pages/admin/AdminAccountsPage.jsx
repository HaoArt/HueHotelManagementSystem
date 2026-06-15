/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useContext } from "react";
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
  TablePagination,
  Tabs,
  Tab,
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
  navy: "#0b1b3f",
  teal: "#009688",
  orange: "#e65100",
  error: "#d32f2f",
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
  textMain: "#1a1a1a",
};

const glassCardSx = {
  borderRadius: 1,
  border: "1px solid rgba(255,255,255,0.4)",
  bgcolor: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 12px 30px rgba(11, 27, 63, 0.1)",
  transition:
    "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 18px 36px rgba(11, 27, 63, 0.15)",
    borderColor: "rgba(0, 150, 136, 0.35)",
  },
};

const AdminAccountsPage = () => {
  const { user } = useContext(AuthContext);

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");

  // ✨ STATE TÌM KIẾM, LỌC VÀ PHÂN TRANG
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

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

  const [createDialog, setCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "Receptionist",
  });

  // ✨ HÀM GỌI DỮ LIỆU ĐÃ TRUYỀN THAM SỐ
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await UserService.getAllAccounts(
        page + 1,
        rowsPerPage,
        searchTerm,
        tabValue,
      );
      setAccounts(res.data || []);
      setTotalRecords(res.pagination?.totalRecords || 0);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.toString() || "Lỗi lấy danh sách tài khoản",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✨ GỌI API KHI CHUYỂN TRANG / TÌM KIẾM
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAccounts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, rowsPerPage, searchTerm, tabValue]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleTabChange = (e, val) => {
    setTabValue(val);
    setPage(0);
  };

  const getRoleChip = (role) => {
    switch (role) {
      case "Admin":
        return (
          <Chip
            icon={<AdminPanelSettingsIcon sx={{ fontSize: 16 }} />}
            label="Quản trị viên"
            sx={{
              bgcolor: "#ffebee",
              color: "#c62828",
              fontWeight: 700,
              borderRadius: 1,
            }}
            size="small"
          />
        );
      case "Receptionist":
        return (
          <Chip
            icon={<SupportAgentIcon sx={{ fontSize: 16 }} />}
            label="Lễ tân"
            sx={{
              bgcolor: "#e3f2fd",
              color: "#1565c0",
              fontWeight: 700,
              borderRadius: 1,
            }}
            size="small"
          />
        );
      case "Customer":
      default:
        return (
          <Chip
            icon={<PersonIcon sx={{ fontSize: 16 }} />}
            label="Khách hàng"
            sx={{
              bgcolor: "#f5f5f5",
              color: "#424242",
              fontWeight: 700,
              borderRadius: 1,
            }}
            size="small"
          />
        );
    }
  };

  const getStatusChip = (status) => {
    return status === "Active" ? (
      <Chip
        label="Hoạt động"
        sx={{
          bgcolor: "#e8f5e9",
          color: "#2e7d32",
          fontWeight: 700,
          borderRadius: 1,
        }}
        size="small"
      />
    ) : (
      <Chip
        label="Đã khóa"
        sx={{
          bgcolor: "white",
          color: COLORS.error,
          border: `1px solid ${COLORS.error}`,
          fontWeight: 700,
          borderRadius: 1,
        }}
        size="small"
      />
    );
  };

  const handleToggleStatus = (acc) => {
    const isLocking = acc.status === "Active";
    setConfirmDialog({
      open: true,
      title: isLocking ? "Khóa Tài Khoản" : "Mở Khóa Tài Khoản",
      message: `Bạn có chắc chắn muốn ${isLocking ? "khóa" : "mở khóa"} tài khoản của ${acc.full_name}?`,
      confirmColor: isLocking ? "error" : "success",
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          const newStatus = isLocking ? "Locked" : "Active";
          await UserService.updateCustomerStatus(acc.id, newStatus);
          setSnackbar({
            open: true,
            message: "Cập nhật trạng thái thành công!",
            severity: "success",
          });
          fetchAccounts();
        } catch (err) {
          setSnackbar({
            open: true,
            message: err || "Lỗi cập nhật trạng thái",
            severity: "error",
          });
        } finally {
          setIsSubmitting(false);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleResetPassword = (acc) => {
    setConfirmDialog({
      open: true,
      title: "Cấp Lại Mật Khẩu",
      message: `Tài khoản ${acc.full_name} sẽ được đưa về mật khẩu mặc định (Huehotel@123). Khách hàng sẽ dùng mật khẩu này để đăng nhập và nên đổi lại sau đó.`,
      confirmColor: "warning",
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          const res = await UserService.resetCustomerPassword(acc.id);
          setSnackbar({
            open: true,
            message: res.message || "Cấp lại mật khẩu thành công!",
            severity: "success",
          });
        } catch (err) {
          setSnackbar({
            open: true,
            message: err || "Lỗi cấp lại mật khẩu",
            severity: "error",
          });
        } finally {
          setIsSubmitting(false);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    if (
      !formData.full_name ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập đầy đủ thông tin",
        severity: "warning",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      await UserService.createAccount(formData);
      setSnackbar({
        open: true,
        message: "Tạo tài khoản thành công!",
        severity: "success",
      });
      setCreateDialog(false);
      setFormData({
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
        message: err || "Lỗi khi tạo tài khoản",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 14% 8%, rgba(0,150,136,0.07), transparent 34%), radial-gradient(circle at 88% 92%, rgba(11,27,63,0.06), transparent 32%), linear-gradient(180deg, #f6f9fe 0%, #eef3fa 52%, #f8fbff 100%)",
      }}
    >
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
            Tài Khoản & Phân Quyền
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Quản lý tài khoản nội bộ và khách hàng của khách sạn
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
          <Chip
            label={`${totalRecords.toLocaleString()} tài khoản`}
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
          {user?.role === "Admin" && (
            <Button
              variant="contained"
              onClick={() => setCreateDialog(true)}
              startIcon={<AddCircleIcon />}
              sx={{
                background: "linear-gradient(135deg, #e65100 0%, #ff8a3d 100%)",
                fontWeight: 700,
                borderRadius: 1,
                textTransform: "none",
                px: 2.25,
                py: 1,
                boxShadow: "0 10px 20px rgba(230, 81, 0, 0.24)",
                "&:hover": { boxShadow: "0 14px 24px rgba(230,81,0,0.32)" },
              }}
            >
              Cấp tài khoản mới
            </Button>
          )}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          ...glassCardSx,
          border: "1px solid rgba(11,27,63,0.12)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            borderBottom: "1px solid rgba(11,27,63,0.1)",
            bgcolor: "rgba(255,255,255,0.84)",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.94rem",
                borderRadius: 1,
                minHeight: 46,
              },
              "& .Mui-selected": { color: `${COLORS.teal} !important` },
              "& .MuiTabs-indicator": {
                backgroundColor: COLORS.teal,
                height: 4,
                borderRadius: 999,
              },
            }}
          >
            <Tab
              label="Tất cả tài khoản"
              value="All"
              sx={{ color: COLORS.teal }}
            />
            <Tab label="Quản trị viên" value="Admin" sx={{ color: "#c62828" }} />
            <Tab
              label="Lễ Tân"
              value="Receptionist"
              sx={{ color: "#1565c0" }}
            />
            <Tab
              label="Khách Hàng"
              value="Customer"
              sx={{ color: "#424242" }}
            />
          </Tabs>
        </Box>

        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid rgba(11,27,63,0.1)",
            bgcolor: "rgba(255,255,255,0.86)",
          }}
        >
          <TextField
            fullWidth
            placeholder="Tìm theo Tên, Email hoặc Số điện thoại..."
            value={searchTerm}
            onChange={handleSearchChange}
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

        <TableContainer
          sx={{ bgcolor: "rgba(255,255,255,0.72)", overflowX: "auto" }}
        >
          <Table sx={{ minWidth: 900 }}>
            <TableHead
              sx={{
                background:
                  "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
              }}
            >
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Thông tin người dùng
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Liên hệ
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Quyền hạn
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Điểm tín nhiệm
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Trạng thái
                </TableCell>
                {user?.role === "Admin" && (
                  <TableCell
                    sx={{ color: "white", fontWeight: 700, textAlign: "right" }}
                  >
                    Thao tác
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={user?.role === "Admin" ? 6 : 5}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <CircularProgress size={30} sx={{ color: COLORS.teal }} />
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={user?.role === "Admin" ? 6 : 5}
                    align="center"
                    sx={{ py: 5 }}
                  >
                    <Typography color="text.secondary">
                      Không tìm thấy tài khoản nào.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                /* ✨ ĐÃ SỬA: Lặp trực tiếp từ mảng accounts từ API trả về */
                accounts.map((acc) => (
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
                      "&:hover": { bgcolor: "rgba(0,150,136,0.07)" },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{ bgcolor: COLORS.navy, width: 36, height: 36 }}
                        >
                          {acc.full_name?.charAt(0).toUpperCase() || "?"}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={COLORS.textMain}
                          >
                            {acc.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Ngày tham gia:{" "}
                            {new Date(acc.created_at).toLocaleDateString(
                              "vi-VN",
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {acc.phone || "---"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {acc.email}
                      </Typography>
                    </TableCell>

                    <TableCell>{getRoleChip(acc.role)}</TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ShieldIcon
                          sx={{
                            color:
                              (acc.trust_score ?? 100) >= 80
                                ? "#2e7d32"
                                : "#c62828",
                            fontSize: 18,
                          }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={
                            (acc.trust_score ?? 100) >= 80
                              ? "#2e7d32"
                              : "#c62828"
                          }
                        >
                          {acc.trust_score ?? 100}/100
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>{getStatusChip(acc.status)}</TableCell>

                    {user?.role === "Admin" && (
                      <TableCell align="right">
                        {acc.role !== "Admin" && (
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="Cấp lại mật khẩu (Đưa về mặc định)">
                              <IconButton
                                size="small"
                                onClick={() => handleResetPassword(acc)}
                                sx={{
                                  color: "#ed6c02",
                                  bgcolor: "rgba(237, 108, 2, 0.1)",
                                  borderRadius: 1,
                                  "&:hover": {
                                    bgcolor: "rgba(237, 108, 2, 0.2)",
                                  },
                                }}
                              >
                                <VpnKeyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={
                                acc.status === "Active"
                                  ? "Khóa tài khoản"
                                  : "Mở khóa tài khoản"
                              }
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(acc)}
                                sx={{
                                  color:
                                    acc.status === "Active"
                                      ? COLORS.error
                                      : "#2e7d32",
                                  bgcolor:
                                    acc.status === "Active"
                                      ? "rgba(211, 47, 47, 0.1)"
                                      : "rgba(46, 125, 50, 0.1)",
                                  borderRadius: 1,
                                  "&:hover": {
                                    bgcolor:
                                      acc.status === "Active"
                                        ? "rgba(211, 47, 47, 0.2)"
                                        : "rgba(46, 125, 50, 0.2)",
                                  },
                                }}
                              >
                                {acc.status === "Active" ? (
                                  <BlockIcon fontSize="small" />
                                ) : (
                                  <CheckCircleIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PHÂN TRANG */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalRecords} // ✨ Lấy con số từ Backend
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số dòng hiển thị:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trong số ${count}`
          }
          sx={{
            borderTop: `1px solid ${COLORS.border}`,
            bgcolor: "rgba(255, 255, 255, 0.85)",
            color: COLORS.navy,
            fontWeight: "bold",
            "& .MuiTablePagination-toolbar": {
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              minHeight: "56px !important",
              py: 0,
            },
            "& .MuiTablePagination-selectLabel": {
              fontWeight: 700,
              color: "text.secondary",
              fontSize: "0.85rem",
              margin: 0,
              display: "flex",
              alignItems: "center",
            },
            "& .MuiTablePagination-input": {
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "20px",
              marginLeft: "8px",
              height: "100%",
            },
            "& .MuiTablePagination-select": {
              fontWeight: 800,
              color: COLORS.primary,
              bgcolor: "rgba(94, 53, 177, 0.05)",
              borderRadius: "8px",
              border: "1px solid rgba(94, 53, 177, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              pt: "4px !important",
              pb: "4px !important",
              pl: "12px !important",
              pr: "32px !important",
              "&:focus": { borderRadius: "8px" },
            },
            "& .MuiTablePagination-selectIcon": {
              color: COLORS.primary,
              top: "calc(50% - 10px)",
              right: "4px",
            },
            "& .MuiTablePagination-displayedRows": {
              fontWeight: 800,
              color: COLORS.navy,
              fontSize: "0.85rem",
              letterSpacing: "0.02em",
              margin: 0,
              display: "flex",
              alignItems: "center",
            },
            "& .MuiTablePagination-actions": {
              marginLeft: "16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              "& .MuiIconButton-root": {
                bgcolor: "white",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "8px",
                padding: "5px",
                color: COLORS.teal,
                boxShadow: "0 2px 6px rgba(11,27,63,0.04)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  bgcolor: COLORS.teal,
                  color: "white",
                  borderColor: COLORS.teal,
                },
                "&.Mui-disabled": {
                  bgcolor: "rgba(0,0,0,0.02)",
                  color: "rgba(0,0,0,0.2)",
                  borderColor: "rgba(0,0,0,0.05)",
                  boxShadow: "none",
                },
                "& .MuiSvgIcon-root": { fontSize: "18px" },
              },
            },
          }}
        />
      </Paper>

      {/* DIALOGS BÊN DƯỚI GIỮ NGUYÊN 100% */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
        PaperProps={{
          sx: {
            borderRadius: 1,
            border: "1px solid rgba(11,27,63,0.12)",
            boxShadow: "0 22px 44px rgba(11, 27, 63, 0.22)",
          },
        }}
      >
        <DialogTitle
          sx={{ bgcolor: COLORS.navy, color: "white", fontWeight: 800 }}
        >
          Cấp Tài Khoản Nội Bộ
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Tài khoản cấp mới sẽ tự động được kích hoạt và không cần xác thực
            OTP.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Họ và tên"
                size="small"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                size="small"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email đăng nhập"
                size="small"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mật khẩu"
                size="small"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <MenuItem value="Receptionist">Lễ Tân</MenuItem>
                  <MenuItem value="Admin">Quản trị viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #e0e0e0" }}>
          <Button onClick={() => setCreateDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSubmitCreate}
            variant="contained"
            disabled={isSubmitting}
            disableElevation
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Tạo tài khoản"
            )}
          </Button>
        </DialogActions>
      </Dialog>

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
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color={confirmDialog.confirmColor}
            disableElevation
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
