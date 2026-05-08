/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
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
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import BookingService from "../../services/bookingService";
import RoomService from "../../services/roomService";

// Đồng bộ Theme Colors theo giao diện mới
const COLORS = {
  headerBg: "#5e35b1", // Xanh tím đậm cho Header Bảng
  teal: "#009688", // Nút Làm mới, Tab Active, Icon View
  orange: "#e65100", // Nút Khách Walk-in
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [detailDialog, setDetailDialog] = useState({
    open: false,
    booking: null,
  });

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

  const [walkInDialog, setWalkInDialog] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [walkInForm, setWalkInForm] = useState({
    full_name: "",
    phone: "",
    room_id: "",
    check_in: new Date().toISOString().split("T")[0],
    check_out: "",
    deposit_amount: 0,
    note: "",
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await BookingService.getAllBookingsAdmin();
      setBookings(res.data || res);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Lỗi khi lấy danh sách đơn",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const searchStr =
        `${b.id} ${b.user_name} ${b.user_phone} ${b.room_number}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesTab = tabValue === "All" || b.status === tabValue;
      return matchesSearch && matchesTab;
    });
  }, [bookings, searchTerm, tabValue]);

  // Cập nhật lại màu sắc Status Chip chuẩn theo hình ảnh
  const getStatusChip = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Chip
            label="Chờ nhận cọc"
            sx={{
              bgcolor: "#fff3e0",
              color: "#ed6c02",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
            size="small"
          />
        );
      case "Confirmed":
        return (
          <Chip
            label="Sắp đến (Đã cọc)"
            sx={{
              bgcolor: "#e3f2fd",
              color: "#1976d2",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
            size="small"
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
              borderRadius: "4px",
            }}
            size="small"
          />
        );
      case "Checked_out":
        return (
          <Chip
            label="Đã hoàn tất"
            sx={{
              bgcolor: "#f5f5f5",
              color: "#333",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
            size="small"
          />
        );
      case "Cancelled":
        return (
          <Chip
            label="Đã hủy"
            sx={{
              bgcolor: "white",
              color: "#d32f2f",
              border: "1px solid #d32f2f",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
            size="small"
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleConfirm = (id) => {
    setConfirmDialog({
      open: true,
      title: "Xác nhận tiền cọc",
      message: `Bạn có chắc chắn đã nhận đủ tiền cọc cho đơn hàng #${id} không?`,
      confirmColor: "warning",
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          await BookingService.confirmDeposit(id);
          setSnackbar({
            open: true,
            message: `Xác nhận thành công đơn #${id}`,
            severity: "success",
          });
          fetchBookings();
        } catch (err) {
          setSnackbar({
            open: true,
            message: err.response?.data?.message || "Lỗi xác nhận cọc",
            severity: "error",
          });
        } finally {
          setIsSubmitting(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  const handleCheckIn = (id) => {
    setConfirmDialog({
      open: true,
      title: "Check-in Giao phòng",
      message: `Tiến hành Check-in và giao chìa khóa phòng cho đơn #${id}?`,
      confirmColor: "info",
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          await BookingService.checkInBooking(id);
          setSnackbar({
            open: true,
            message: `Check-in thành công đơn #${id}`,
            severity: "success",
          });
          fetchBookings();
        } catch (err) {
          setSnackbar({
            open: true,
            message: err.response?.data?.message || "Lỗi Check-in",
            severity: "error",
          });
        } finally {
          setIsSubmitting(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  const handleCancel = (id) => {
    setConfirmDialog({
      open: true,
      title: "CẢNH BÁO: Hủy đơn đặt phòng",
      message: `Bạn có chắc chắn muốn hủy đơn #${id}? Thao tác này không thể hoàn tác và phòng sẽ bị trả về trạng thái Trống.`,
      confirmColor: "error",
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          await BookingService.cancelBooking(id);
          setSnackbar({
            open: true,
            message: `Đã hủy thành công đơn #${id}`,
            severity: "success",
          });
          fetchBookings();
        } catch (err) {
          setSnackbar({
            open: true,
            message: err.response?.data?.message || "Lỗi hủy đơn",
            severity: "error",
          });
        } finally {
          setIsSubmitting(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  const handleViewDetails = (booking) => {
    setDetailDialog({ open: true, booking });
  };

  const handleOpenWalkIn = async () => {
    try {
      const res = await RoomService.getRooms();
      const rooms = res.data || res;
      setAvailableRooms(rooms.filter((r) => r.status === "Available"));
      setWalkInDialog(true);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Lỗi tải danh sách phòng",
        severity: "error",
      });
    }
  };

  const handleSubmitWalkIn = async () => {
    if (
      !walkInForm.full_name ||
      !walkInForm.phone ||
      !walkInForm.room_id ||
      !walkInForm.check_out
    ) {
      return setSnackbar({
        open: true,
        message: "Vui lòng điền đầy đủ các thông tin bắt buộc (*)",
        severity: "warning",
      });
    }
    if (new Date(walkInForm.check_in) >= new Date(walkInForm.check_out)) {
      return setSnackbar({
        open: true,
        message: "Ngày trả phòng phải lớn hơn ngày nhận phòng!",
        severity: "warning",
      });
    }

    try {
      setIsSubmitting(true);
      await BookingService.createWalkInBooking(walkInForm);
      setSnackbar({
        open: true,
        message: "Tạo đơn Walk-in và Check-in thành công!",
        severity: "success",
      });
      setWalkInDialog(false);
      setWalkInForm({
        full_name: "",
        phone: "",
        room_id: "",
        check_in: new Date().toISOString().split("T")[0],
        check_out: "",
        deposit_amount: 0,
        note: "",
      });
      fetchBookings();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Có lỗi xảy ra khi tạo đơn.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: COLORS.teal }} />
      </Box>
    );

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
      {/* HEADER VỚI NÚT BẤM KẾ BÊN TIÊU ĐỀ */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          mb: 4,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ mr: 2 }}>
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{ color: "#001529", letterSpacing: "-1px" }}
          >
            Quản Lý Đặt Phòng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Điều phối Check-in, Check-out và xác nhận thanh toán
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleOpenWalkIn}
            startIcon={<AddCircleIcon />}
            sx={{
              bgcolor: COLORS.orange,
              "&:hover": { bgcolor: "#d84315" },
              fontWeight: "bold",
              borderRadius: "4px",
              px: 3,
              py: 1,
              boxShadow: "none",
            }}
          >
            KHÁCH WALK-IN
          </Button>
          <Button
            variant="contained"
            onClick={fetchBookings}
            sx={{
              bgcolor: COLORS.teal,
              "&:hover": { bgcolor: "#00796b" },
              fontWeight: "bold",
              borderRadius: "4px",
              px: 3,
              py: 1,
              boxShadow: "none",
            }}
          >
            LÀM MỚI
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: "4px",
          border: `1px solid ${COLORS.border}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "white" }}>
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem",
              },
              "& .Mui-selected": { color: `${COLORS.teal} !important` },
              "& .MuiTabs-indicator": {
                backgroundColor: COLORS.teal,
                height: 3,
              },
            }}
          >
            <Tab label="Tất cả đơn" value="All" sx={{ color: COLORS.teal }} />
            <Tab
              label="Chờ nhận cọc"
              value="Pending"
              sx={{ color: "#ed6c02" }}
            />
            <Tab
              label="Khách sắp đến"
              value="Confirmed"
              sx={{ color: "#1976d2" }}
            />
            <Tab
              label="Đang lưu trú"
              value="Checked_in"
              sx={{ color: "#2e7d32" }}
            />
            <Tab
              label="Lịch sử (Hoàn tất/Hủy)"
              value="Checked_out"
              sx={{ color: "#616161" }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0", bgcolor: "white" }}>
          <TextField
            fullWidth
            placeholder="Tìm theo Mã đơn, Tên khách, SĐT hoặc Số phòng..."
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
                bgcolor: "white",
                "& fieldset": { borderColor: COLORS.border },
              },
            }}
            size="small"
          />
        </Box>

        <TableContainer sx={{ bgcolor: "white", overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: COLORS.headerBg }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Mã
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Khách hàng
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Phòng
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Lịch trình
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Tài chính
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      Không có đơn đặt phòng nào phù hợp.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((b) => (
                  <TableRow
                    key={b.id}
                    hover
                    sx={{
                      "& td": { borderBottom: `1px solid ${COLORS.border}` },
                    }}
                  >
                    <TableCell fontWeight="bold">#{b.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {b.user_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {b.user_phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        P.{b.room_number || "---"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {b.type_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        <b>IN:</b>{" "}
                        {new Date(b.check_in_date).toLocaleDateString("vi-VN")}
                      </Typography>
                      <Typography variant="caption" display="block">
                        <b>OUT:</b>{" "}
                        {new Date(b.check_out_date).toLocaleDateString("vi-VN")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        fontWeight="bold"
                      >
                        {parseFloat(b.total_amount).toLocaleString()}đ
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Cọc:{" "}
                        {parseFloat(b.deposit_amount || 0).toLocaleString()}đ
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(b.status)}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        {b.status === "Pending" && (
                          <>
                            <Tooltip title="Xác nhận đã nhận cọc">
                              <IconButton
                                color="warning"
                                onClick={() => handleConfirm(b.id)}
                                sx={{ bgcolor: "rgba(237, 108, 2, 0.1)" }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Hủy đơn">
                              <IconButton
                                color="error"
                                onClick={() => handleCancel(b.id)}
                                sx={{ bgcolor: "rgba(211, 47, 47, 0.1)" }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {b.status === "Confirmed" && (
                          <Button
                            variant="contained"
                            color="info"
                            size="small"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => handleCheckIn(b.id)}
                            sx={{
                              fontWeight: "bold",
                              borderRadius: "4px",
                              boxShadow: "none",
                            }}
                          >
                            CHECK-IN
                          </Button>
                        )}
                        <Tooltip title="Xem chi tiết đơn">
                          <IconButton
                            onClick={() => handleViewDetails(b)}
                            sx={{
                              color: COLORS.teal,
                              bgcolor: "rgba(0, 150, 136, 0.1)",
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* =============================================================== */}
      {/* DIALOG: XÁC NHẬN CHUNG (CONFIRM) */}
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

      {/* =============================================================== */}
      {/* SNACKBAR THÔNG BÁO NỔI */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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

      {/* =============================================================== */}
      {/* DIALOG: XEM CHI TIẾT ĐƠN HÀNG (GIỮ NGUYÊN) */}
      <Dialog
        disableScrollLock={true}
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, booking: null })}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "4px", bgcolor: "#f8f9fa" } }}
      >
        {detailDialog.booking && (
          <>
            <DialogTitle
              sx={{
                bgcolor: "#5e35b1",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Chi Tiết Đơn Đặt Phòng #{detailDialog.booking.id}
              </Typography>
              {getStatusChip(detailDialog.booking.status)}
            </DialogTitle>
            <DialogContent sx={{ pt: 4, pb: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: "4px",
                      border: "1px solid #e0e0e0",
                      height: "100%",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <PersonIcon color="primary" />
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="primary"
                      >
                        Thông tin Khách Hàng
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Họ và tên: <b>{detailDialog.booking.user_name}</b>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Số điện thoại: <b>{detailDialog.booking.user_phone}</b>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Thời gian đặt đơn:{" "}
                      <b>
                        {new Date(
                          detailDialog.booking.created_at,
                        ).toLocaleString("vi-VN")}
                      </b>
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 4, mb: 2 }}
                    >
                      <MeetingRoomIcon color="primary" />
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="primary"
                      >
                        Lịch Trình & Phòng
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Hạng phòng: <b>{detailDialog.booking.type_name}</b>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Phòng số:{" "}
                      <b>
                        {detailDialog.booking.room_number || "Chưa xếp phòng"}
                      </b>
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 3,
                        mt: 2,
                        bgcolor: "#e3f2fd",
                        p: 1.5,
                        borderRadius: "4px",
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Ngày Nhận
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {new Date(
                            detailDialog.booking.check_in_date,
                          ).toLocaleDateString("vi-VN")}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Ngày Trả
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {new Date(
                            detailDialog.booking.check_out_date,
                          ).toLocaleDateString("vi-VN")}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: "4px",
                      border: "1px solid #e0e0e0",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <RequestQuoteIcon color="warning" />
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="warning.main"
                      >
                        Tài Chính & Thanh Toán
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Tổng tiền phòng:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {parseFloat(
                            detailDialog.booking.total_amount,
                          ).toLocaleString()}{" "}
                          đ
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Giảm giá (Coupon):
                        </Typography>
                        <Typography
                          variant="body2"
                          color="error.main"
                          fontWeight="bold"
                        >
                          -{" "}
                          {parseFloat(
                            detailDialog.booking.discount_amount || 0,
                          ).toLocaleString()}{" "}
                          đ
                        </Typography>
                      </Box>
                      <Divider />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1" fontWeight="bold">
                          Phải thanh toán:
                        </Typography>
                        <Typography
                          variant="h6"
                          color="primary.main"
                          fontWeight="bold"
                        >
                          {(
                            parseFloat(detailDialog.booking.total_amount) -
                            parseFloat(
                              detailDialog.booking.discount_amount || 0,
                            )
                          ).toLocaleString()}{" "}
                          đ
                        </Typography>
                      </Box>
                    </Stack>

                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#fff3e0",
                        borderRadius: "4px",
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="warning.main"
                          fontWeight="bold"
                        >
                          SỐ TIỀN ĐÃ CỌC:
                        </Typography>
                        <Typography
                          variant="h6"
                          color="warning.main"
                          fontWeight="bold"
                        >
                          {parseFloat(
                            detailDialog.booking.deposit_amount || 0,
                          ).toLocaleString()}{" "}
                          đ
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      gutterBottom
                    >
                      Ghi chú của khách:
                    </Typography>
                    <Box
                      sx={{
                        flexGrow: 1,
                        p: 2,
                        bgcolor: "#f5f5f5",
                        borderRadius: "4px",
                        fontStyle: detailDialog.booking.note
                          ? "normal"
                          : "italic",
                        color: detailDialog.booking.note
                          ? "text.primary"
                          : "text.secondary",
                      }}
                    >
                      {detailDialog.booking.note || "Không có ghi chú thêm."}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{ p: 3, bgcolor: "white", borderTop: "1px solid #e0e0e0" }}
            >
              <Button
                onClick={() => setDetailDialog({ open: false, booking: null })}
                variant="contained"
                color="primary"
                sx={{ px: 4, boxShadow: "none" }}
              >
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* =============================================================== */}
      {/* DIALOG: TẠO ĐƠN KHÁCH WALK-IN */}
      <Dialog
        disableScrollLock={true}
        open={walkInDialog}
        onClose={() => setWalkInDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "4px" } }}
      >
        <DialogTitle
          sx={{ bgcolor: COLORS.orange, color: "white", fontWeight: "bold" }}
        >
          Làm thủ tục nhận phòng trực tiếp (Walk-in)
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Khách sẽ được <b>Check-in ngay lập tức</b>. Hãy chắc chắn bạn đã thu
            tiền mặt hoặc quẹt thẻ của khách tại quầy.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ tên khách (*)"
                value={walkInForm.full_name}
                onChange={(e) =>
                  setWalkInForm({ ...walkInForm, full_name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại (*)"
                value={walkInForm.phone}
                onChange={(e) =>
                  setWalkInForm({ ...walkInForm, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Chọn phòng trống (*)</InputLabel>
                <Select
                  value={walkInForm.room_id}
                  label="Chọn phòng trống (*)"
                  onChange={(e) =>
                    setWalkInForm({ ...walkInForm, room_id: e.target.value })
                  }
                >
                  {availableRooms.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      Phòng {r.room_number} - {r.type_name}
                    </MenuItem>
                  ))}
                  {availableRooms.length === 0 && (
                    <MenuItem disabled>Hết phòng trống!</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày Check-in"
                InputLabelProps={{ shrink: true }}
                value={walkInForm.check_in}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày Check-out dự kiến (*)"
                InputLabelProps={{ shrink: true }}
                value={walkInForm.check_out}
                onChange={(e) =>
                  setWalkInForm({ ...walkInForm, check_out: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Tiền mặt/Quẹt thẻ đã thu (VNĐ)"
                value={walkInForm.deposit_amount}
                onChange={(e) =>
                  setWalkInForm({
                    ...walkInForm,
                    deposit_amount: e.target.value,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">đ</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Ghi chú thêm"
                value={walkInForm.note}
                onChange={(e) =>
                  setWalkInForm({ ...walkInForm, note: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #eee" }}>
          <Button
            onClick={() => setWalkInDialog(false)}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmitWalkIn}
            variant="contained"
            sx={{
              fontWeight: "bold",
              bgcolor: COLORS.orange,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#d84315" },
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "XÁC NHẬN VÀ GIAO PHÒNG"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBookingsPage;
