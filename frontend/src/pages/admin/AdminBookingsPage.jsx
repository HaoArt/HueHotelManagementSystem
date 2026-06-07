/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-useless-assignment */
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
  TablePagination,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import BookingService from "../../services/bookingService";
import RoomService from "../../services/roomService";
import FolioService from "../../services/folioService";
import UserService from "../../services/userService";

const COLORS = {
  primary: "#5e35b1",
  navy: "#0b1b3f",
  teal: "#009688",
  orange: "#e65100",
  error: "#d32f2f",
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
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

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [upgradeDialog, setUpgradeDialog] = useState(false);
  const [selectedBookingForUpgrade, setSelectedBookingForUpgrade] =
    useState(null);
  const [availableRoomsForUpgrade, setAvailableRoomsForUpgrade] = useState([]);
  const [selectedNewRoomId, setSelectedNewRoomId] = useState("");
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    booking: null,
    dynamicRoomTotal: null,
    servicesTotal: 0,
  });
  const [checkInDialog, setCheckInDialog] = useState({
    open: false,
    booking: null,
    availableRooms: [],
    overrideRoomId: "",
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

  const fetchBookings = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await BookingService.getAllBookingsAdmin(
        page + 1,
        rowsPerPage,
        tabValue,
        searchTerm,
      );
      setBookings(res.data);
      setTotalRecords(res.pagination?.totalRecords || 0);
    } catch (err) {
      if (!isBackground) {
        setSnackbar({
          open: true,
          message:
            err.response?.data?.message || err || "Lỗi khi lấy danh sách đơn",
          severity: "error",
        });
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBookings();
    }, 500);
    const pollingInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchBookings(true);
      }
    }, 15000);

    return () => {
      clearTimeout(delayDebounceFn);
      clearInterval(pollingInterval);
    };
  }, [page, rowsPerPage, tabValue, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleTabChange = (e, val) => {
    setTabValue(val);
    setPage(0);
  };

  const getStatusChip = (booking) => {
    const { status, deposit_amount } = booking;

    switch (status) {
      case "Pending":
        return (
          <Chip
            label="Chờ nhận cọc"
            sx={{
              bgcolor: "#fff3e0",
              color: "#ed6c02",
              fontWeight: 700,
              borderRadius: 1,
            }}
            size="small"
          />
        );
      case "Confirmed": {
        const isDeposited = parseFloat(deposit_amount || 0) > 0;
        return (
          <Chip
            label={isDeposited ? "Sắp đến (Đã cọc)" : "Sắp đến (Thu tại quầy)"}
            sx={{
              bgcolor: isDeposited ? "#e3f2fd" : "#f3e8ff",
              color: isDeposited ? "#1976d2" : "#7e22ce",
              fontWeight: 700,
              borderRadius: 1,
            }}
            size="small"
          />
        );
      }
      case "Checked_in":
        return (
          <Chip
            label="Đang lưu trú"
            sx={{
              bgcolor: "#e8f5e9",
              color: "#2e7d32",
              fontWeight: 700,
              borderRadius: 1,
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
              fontWeight: 700,
              borderRadius: 1,
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
              color: COLORS.error,
              border: `1px solid ${COLORS.error}`,
              fontWeight: 700,
              borderRadius: 1,
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

  const handleOpenCheckIn = async (booking) => {
    try {
      setIsSubmitting(true);
      const res = await RoomService.getRooms();
      const roomsData = res.data || res;
      const availableRooms = roomsData.filter((r) => r.status === "Available");

      setCheckInDialog({
        open: true,
        booking: booking,
        availableRooms: availableRooms,
        overrideRoomId: "",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Lỗi tải danh sách phòng dự phòng!",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitCheckIn = async () => {
    try {
      setIsSubmitting(true);

      const payload = checkInDialog.overrideRoomId
        ? { override_room_id: checkInDialog.overrideRoomId }
        : {};

      await BookingService.checkInBooking(checkInDialog.booking.id, payload);

      setSnackbar({
        open: true,
        message: `Check-in thành công đơn #${checkInDialog.booking.id}`,
        severity: "success",
      });
      fetchBookings();
      setCheckInDialog({
        open: false,
        booking: null,
        availableRooms: [],
        overrideRoomId: "",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Lỗi Check-in",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const handleCheckOut = (id) => {
    setConfirmDialog({
      open: true,
      title: "Thực hiện Check-out",
      message: `Tiến hành tính tiền và Check-out cho đơn #${id}? Hệ thống sẽ xuất hóa đơn PDF ngay sau đó.`,
      confirmColor: "success",
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          await BookingService.checkOutBooking(id);
          setSnackbar({
            open: true,
            message: `Check-out thành công đơn #${id}`,
            severity: "success",
          });
          fetchBookings();

          const blobData = await BookingService.downloadInvoice(id);
          const url = window.URL.createObjectURL(new Blob([blobData]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `Invoice-HueHotel-${id}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          setSnackbar({
            open: true,
            message:
              err.response?.data?.message || err.toString() || "Lỗi Check-out",
            severity: "error",
          });
        } finally {
          setIsSubmitting(false);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleViewDetails = async (booking) => {
    try {
      setIsSubmitting(true);
      const folioRes = await FolioService.getFolio(booking.id);
      const dynamicRoomTotal = folioRes.data?.roomTotal || booking.total_amount;
      setDetailDialog({
        open: true,
        booking: {
          ...booking,
          base_price: folioRes.data?.booking_info?.base_price || 0,
        },
        dynamicRoomTotal: dynamicRoomTotal,
        servicesTotal: folioRes.data?.services_total || 0,
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Không thể lấy chi tiết tài chính hiện tại",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadInvoice = async (id) => {
    try {
      setIsSubmitting(true);
      const blobData = await BookingService.downloadInvoice(id);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-HueHotel-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          "Lỗi tải xuống hóa đơn: " +
          (err.response?.data?.message || err.toString()),
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const handlePhoneBlur = async () => {
    if (walkInForm.phone && walkInForm.phone.length >= 9) {
      try {
        const res = await UserService.getUserByPhone(walkInForm.phone);
        if (res.data) {
          setWalkInForm((prev) => ({
            ...prev,
            full_name: res.data.full_name,
          }));
          setSnackbar({
            open: true,
            message: `Tự động tải thông tin khách hàng cũ: ${res.data.full_name}`,
            severity: "info",
          });
        }
      } catch (err) {
        throw (
          err.response?.data?.message ||
          "Lỗi khi tìm kiếm khách hàng theo số điện thoại"
        );
      }
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

  const handleOpenUpgradeDialog = async (booking) => {
    setSelectedBookingForUpgrade(booking);
    setSelectedNewRoomId("");
    try {
      const res = await RoomService.getRooms();
      const roomsData = res.data || res;

      const emptyRooms = roomsData.filter((r) => r.status === "Available");
      setAvailableRoomsForUpgrade(emptyRooms);
      setUpgradeDialog(true);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Không thể tải danh sách phòng trống!",
        severity: "error",
      });
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedNewRoomId) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn một căn phòng mới!",
        severity: "warning",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await BookingService.reassignRoomBeforeCheckIn(
        selectedBookingForUpgrade.id,
        selectedNewRoomId,
      );
      setSnackbar({
        open: true,
        message: res.message || "Đổi phòng thành công!",
        severity: "success",
      });
      setUpgradeDialog(false);

      if (typeof fetchBookings === "function") fetchBookings();
      else window.location.reload();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err || "Có lỗi xảy ra khi đổi phòng!",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
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
            Quản Lý Đặt Phòng
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Điều phối Check-in, Check-out và xác nhận thanh toán
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
          <Chip
            label={`${totalRecords} đơn hệ thống`}
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
          <Button
            variant="contained"
            onClick={handleOpenWalkIn}
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
            Khách Walk-in
          </Button>
          <Button
            variant="contained"
            onClick={() => fetchBookings(false)} // Sửa thành false để có loading ui
            sx={{
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              fontWeight: 700,
              borderRadius: 1,
              textTransform: "none",
              px: 2.25,
              py: 1,
              boxShadow: "0 10px 22px rgba(11, 27, 63, 0.24)",
              "&:hover": { boxShadow: "0 14px 26px rgba(11, 27, 63, 0.32)" },
            }}
          >
            Làm mới
          </Button>
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
              value="Checked_out" // Bạn có thể thêm Tab "Cancelled" riêng nếu Back-end hỗ trợ
              sx={{ color: "#616161" }}
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
            placeholder="Tìm theo Mã đơn, Tên khách, SĐT..."
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
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  Mã
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  Khách hàng
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  Phòng
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  Lịch trình
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  Thành tiền
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    textAlign: "right",
                  }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* ✨ ĐÃ SỬA: Map thẳng từ mảng bookings do Backend trả về, thay vì dùng paginatedBookings (cắt bằng slice) */}
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      Không có đơn đặt phòng nào phù hợp.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow
                    key={b.id}
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
                    }}
                  >
                    <TableCell fontWeight="bold">#{b.id}</TableCell>
                    <TableCell>
                      {/* Cập nhật b.user_name thành b.customer_name (Do câu SQL mới) */}
                      <Typography variant="body2" fontWeight="bold">
                        {b.customer_name || b.user_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {b.customer_phone || b.user_phone}
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
                        {parseFloat(
                          b.grand_total || b.total_amount || 0,
                        ).toLocaleString()}
                        đ
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Cọc:{" "}
                        {parseFloat(b.deposit_amount || 0).toLocaleString()}đ
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(b)}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        {b.status === "Pending" && (
                          <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            onClick={() => handleConfirm(b.id)}
                            sx={{
                              fontWeight: 700,
                              borderRadius: 1,
                              boxShadow: "none",
                              textTransform: "none",
                            }}
                          >
                            XÁC NHẬN CỌC
                          </Button>
                        )}
                        {(b.status === "Pending" ||
                          b.status === "Confirmed") && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleCancel(b.id)}
                            sx={{
                              fontWeight: 700,
                              borderRadius: 1,
                              textTransform: "none",
                            }}
                          >
                            HỦY ĐƠN
                          </Button>
                        )}
                        {b.status === "Checked_in" && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleCheckOut(b.id)}
                            sx={{
                              fontWeight: 700,
                              borderRadius: 1,
                              boxShadow: "none",
                              textTransform: "none",
                            }}
                          >
                            CHECK-OUT
                          </Button>
                        )}
                        {b.status === "Confirmed" && (
                          <Button
                            variant="contained"
                            color="info"
                            size="small"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => handleOpenCheckIn(b)}
                            sx={{
                              fontWeight: 700,
                              borderRadius: 1,
                              boxShadow: "none",
                              textTransform: "none",
                            }}
                          >
                            CHECK-IN
                          </Button>
                        )}
                        {b.status === "Checked_out" && (
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<ReceiptLongIcon />}
                            onClick={() => handleDownloadInvoice(b.id)}
                            disabled={isSubmitting}
                            sx={{
                              fontWeight: 700,
                              borderRadius: 1,
                              textTransform: "none",
                            }}
                          >
                            HÓA ĐƠN
                          </Button>
                        )}
                        {(b.status === "Pending" ||
                          b.status === "Confirmed") && (
                          <Tooltip title="Đổi phòng vật lý hoặc Nâng hạng miễn phí">
                            <IconButton
                              color="warning"
                              onClick={() => handleOpenUpgradeDialog(b)}
                              sx={{
                                border: "1px solid #f59e0b",
                                borderRadius: "8px",
                                p: 1,
                                "&:hover": { bgcolor: "#f59e0b10" },
                              }}
                            >
                              <MeetingRoomIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Xem chi tiết đơn">
                          <IconButton
                            onClick={() => handleViewDetails(b)}
                            sx={{
                              color: COLORS.teal,
                              bgcolor: "rgba(0, 150, 136, 0.1)",
                              border: "1px solid rgba(0,150,136,0.2)",
                              borderRadius: 1,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: "rgba(0, 150, 136, 0.18)",
                                transform: "translateY(-1px)",
                              },
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalRecords} // ✨ ĐÃ SỬA: Lấy con số từ Backend
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
              "&:focus": {
                borderRadius: "8px",
              },
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
                "& .MuiSvgIcon-root": {
                  fontSize: "18px",
                },
              },
            },
          }}
        />
      </Paper>

      {/* DIALOGS BÊN DƯỚI GIỮ NGUYÊN 100% */}
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
        autoHideDuration={3000}
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

      <Dialog
        disableScrollLock={true}
        open={detailDialog.open}
        onClose={() =>
          setDetailDialog({
            open: false,
            booking: null,
            dynamicRoomTotal: null,
            servicesTotal: 0,
          })
        }
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            bgcolor: "#f8f9fa",
            border: "1px solid rgba(11,27,63,0.12)",
            boxShadow: "0 22px 44px rgba(11, 27, 63, 0.22)",
          },
        }}
      >
        {detailDialog.booking && (
          <>
            <DialogTitle
              sx={{
                bgcolor: COLORS.navy,
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Chi Tiết Đơn Đặt Phòng #{detailDialog.booking.id}
              </Typography>
              {getStatusChip(detailDialog.booking)}
            </DialogTitle>
            <DialogContent sx={{ pt: 4, pb: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 1,
                      border: "1px solid rgba(11,27,63,0.1)",
                      height: "100%",
                      bgcolor: "rgba(255,255,255,0.92)",
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
                      Họ và tên:{" "}
                      <b>
                        {detailDialog.booking.customer_name ||
                          detailDialog.booking.user_name}
                      </b>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Số điện thoại:{" "}
                      <b>
                        {detailDialog.booking.customer_phone ||
                          detailDialog.booking.user_phone}
                      </b>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      CCCD/CMND:{" "}
                      <b>
                        {detailDialog.booking.identity_number ||
                          "Chưa cập nhật"}
                      </b>
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
                      borderRadius: 1,
                      border: "1px solid rgba(11,27,63,0.1)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      bgcolor: "rgba(255,255,255,0.92)",
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

                    {(() => {
                      const finalDbAmount = parseFloat(
                        detailDialog.dynamicRoomTotal ??
                          detailDialog.booking.total_amount ??
                          0,
                      );
                      const discountAmt = parseFloat(
                        detailDialog.booking.discount_amount || 0,
                      );
                      const servicesTotal = parseFloat(
                        detailDialog.servicesTotal || 0,
                      );
                      const originalRoomTotal = finalDbAmount + discountAmt;

                      const checkIn = new Date(
                        detailDialog.booking.check_in_date,
                      );
                      const checkOut = new Date(
                        detailDialog.booking.check_out_date,
                      );
                      let totalDays = Math.ceil(
                        Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24),
                      );
                      if (totalDays === 0) totalDays = 1;

                      const basePrice = parseFloat(
                        detailDialog.booking.base_price || 0,
                      );
                      const rawRoomTotal = basePrice > 0 ? basePrice * totalDays : originalRoomTotal;
                      let roomGoc = rawRoomTotal;
                      let totalSurcharge = originalRoomTotal - rawRoomTotal;

                      if (totalSurcharge < 0) {
                        roomGoc = originalRoomTotal;
                        totalSurcharge = 0;
                      }

                      const finalTotal =
                        originalRoomTotal + servicesTotal - discountAmt;
                      const depositAmt = parseFloat(
                        detailDialog.booking.deposit_amount || 0,
                      );
                      const remainingAmt = finalTotal - depositAmt;

                      let fallbackReason = "";
                      const noteStr = detailDialog.booking.note || "";
                      const sysNotes = noteStr.match(/\[Hệ thống:(.*?)\]/g);
                      if (sysNotes && sysNotes.length > 0) {
                        fallbackReason = sysNotes.map((n) => n.replace('[Hệ thống:', '').replace(']', '').trim()).join('; ');
                      }

                      return (
                        <Stack spacing={1.5} sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Tiền phòng lưu trú ({totalDays} đêm):
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {roomGoc.toLocaleString()} đ
                            </Typography>
                          </Box>
                          
                          {totalSurcharge > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography variant="body2" color="error.main">
                                  Phụ thu (Lễ Tết/Check-in sớm/Trả trễ):
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  color="error.main"
                                >
                                  +{totalSurcharge.toLocaleString()} đ
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {/* MINH BẠCH LỊCH SỬ BIẾN ĐỘNG (Luôn hiển thị nếu có note) */}
                          {fallbackReason && (
                            <Box sx={{ mb: 1.5, p: 1, bgcolor: "rgba(0,0,0,0.03)", borderRadius: 1, borderLeft: "3px solid #9e9e9e" }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic", display: "block", whiteSpace: "pre-wrap" }}>
                                <b>Lịch sử biến động giá:</b><br/>{fallbackReason.split('; ').join('\n')}
                              </Typography>
                            </Box>
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Tiền dịch vụ phát sinh:
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {servicesTotal.toLocaleString()} đ
                            </Typography>
                          </Box>
                          {discountAmt > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Giảm giá (Coupon/Hạng):
                              </Typography>
                              <Typography
                                variant="body2"
                                color="error.main"
                                fontWeight="bold"
                              >
                                - {discountAmt.toLocaleString()} đ
                              </Typography>
                            </Box>
                          )}
                          <Divider />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body1" fontWeight="bold">
                              Tổng thanh toán:
                            </Typography>
                            <Typography
                              variant="h6"
                              color="primary.main"
                              fontWeight="bold"
                            >
                              {finalTotal.toLocaleString()} đ
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="warning.main"
                              fontWeight="bold"
                            >
                              Đã đặt cọc/Thanh toán trước:
                            </Typography>
                            <Typography
                              variant="body2"
                              color="warning.main"
                              fontWeight="bold"
                            >
                              - {depositAmt.toLocaleString()} đ
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              mt: 1,
                              p: 1.5,
                              bgcolor: remainingAmt > 0 ? "#ffebee" : "#e8f5e9",
                              borderRadius: 1,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight="bold"
                              color={
                                remainingAmt > 0 ? "error.main" : "success.main"
                              }
                            >
                              {remainingAmt > 0
                                ? "CẦN THU THÊM:"
                                : "ĐÃ THANH TOÁN ĐỦ / CẦN HOÀN TRẢ:"}
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight="bold"
                              color={
                                remainingAmt > 0 ? "error.main" : "success.main"
                              }
                            >
                              {Math.abs(remainingAmt).toLocaleString()} đ
                            </Typography>
                          </Box>
                        </Stack>
                      );
                    })()}

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
                        borderRadius: 1,
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
                onClick={() =>
                  setDetailDialog({
                    open: false,
                    booking: null,
                    dynamicRoomTotal: null,
                    servicesTotal: 0,
                  })
                }
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

      <Dialog
        disableScrollLock={true}
        open={walkInDialog}
        onClose={() => setWalkInDialog(false)}
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
            background: "linear-gradient(135deg, #e65100 0%, #ff8a3d 100%)",
            color: "white",
            fontWeight: 800,
            textAlign: "center",
            py: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          LÀM THỦ TỤC NHẬN PHÒNG TRỰC TIẾP (WALK-IN)
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Alert
            severity="info"
            sx={{ mb: 3, borderRadius: 1, border: "1px solid #bae6fd" }}
          >
            Hệ thống tự động điền tên nếu SĐT đã tồn tại. Khách sẽ được{" "}
            <b>Check-in ngay</b> sau khi hoàn tất.
          </Alert>

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
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  Số điện thoại liên hệ (*)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={walkInForm.phone}
                  onChange={(e) =>
                    setWalkInForm({ ...walkInForm, phone: e.target.value })
                  }
                  onBlur={handlePhoneBlur}
                  placeholder="Gõ SĐT khách..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  Họ tên khách hàng (*)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={walkInForm.full_name}
                  onChange={(e) =>
                    setWalkInForm({ ...walkInForm, full_name: e.target.value })
                  }
                  placeholder="Nhập họ và tên..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  Chọn phòng trống (*)
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={walkInForm.room_id}
                    displayEmpty
                    onChange={(e) =>
                      setWalkInForm({ ...walkInForm, room_id: e.target.value })
                    }
                  >
                    <MenuItem value="" disabled>
                      -- Chọn phòng còn trống --
                    </MenuItem>
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
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  Ngày nhận phòng (Hôm nay)
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={walkInForm.check_in}
                  disabled
                  sx={{ bgcolor: "#f1f5f9" }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  Ngày trả phòng dự kiến (*)
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={walkInForm.check_out}
                  onChange={(e) =>
                    setWalkInForm({ ...walkInForm, check_out: e.target.value })
                  }
                  error={
                    new Date(walkInForm.check_in) >=
                    new Date(walkInForm.check_out)
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  Tiền mặt/Chuyển khoản đã thu (VNĐ)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  size="small"
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

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  Ghi chú (Yêu cầu thêm)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={walkInForm.note}
                  onChange={(e) =>
                    setWalkInForm({ ...walkInForm, note: e.target.value })
                  }
                  placeholder="Ví dụ: Khách ở tầng cao..."
                />
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
          <Button
            onClick={() => setWalkInDialog(false)}
            color="inherit"
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1 }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmitWalkIn}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #e65100 0%, #ff8a3d 100%)",
              px: 4,
              py: 1,
              borderRadius: 1,
              textTransform: "none",
              "&:hover": { boxShadow: "0 12px 24px rgba(230,81,0,0.28)" },
              boxShadow: "0 10px 20px rgba(230,81,0,0.2)",
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "XÁC NHẬN & GIAO PHÒNG"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={upgradeDialog}
        onClose={() => setUpgradeDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#1A1A1A",
            borderBottom: "1px solid #e2e8f0",
            pb: 2,
          }}
        >
          Xử lý Đổi phòng / Nâng hạng miễn phí
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {selectedBookingForUpgrade && (
            <Stack gap={2}>
              <Alert severity="info" sx={{ borderRadius: "8px" }}>
                Khách hàng:{" "}
                <strong>
                  {selectedBookingForUpgrade.customer_name ||
                    selectedBookingForUpgrade.user_name ||
                    "Khách hàng"}
                </strong>{" "}
                <br />
                Hạng phòng đã đặt:{" "}
                <strong>{selectedBookingForUpgrade.type_name}</strong> <br />
                Phòng hiện tại:{" "}
                <strong>
                  Phòng {selectedBookingForUpgrade.room_number || "Chưa xếp"}
                </strong>
              </Alert>

              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "#4a5568", mt: 1 }}
              >
                Chọn căn phòng trống mới để chuyển sang:
              </Typography>

              <FormControl fullWidth>
                <InputLabel id="select-new-room-label">
                  Danh sách phòng trống
                </InputLabel>
                <Select
                  labelId="select-new-room-label"
                  value={selectedNewRoomId}
                  label="Danh sách phòng trống"
                  onChange={(e) => setSelectedNewRoomId(e.target.value)}
                  sx={{ borderRadius: "8px" }}
                >
                  {availableRoomsForUpgrade.length === 0 ? (
                    <MenuItem disabled value="">
                      <em>Không có phòng nào trống hiện tại!</em>
                    </MenuItem>
                  ) : (
                    availableRoomsForUpgrade.map((room) => {
                      const isSameType =
                        room.room_type_id ===
                        selectedBookingForUpgrade.room_type_id;
                      return (
                        <MenuItem key={room.id} value={room.id}>
                          Phòng {room.room_number} - Hạng: {room.type_name}{" "}
                          {isSameType
                            ? "(Cùng hạng)"
                            : "⭐ (Nâng hạng miễn phí)"}
                        </MenuItem>
                      );
                    })
                  )}
                </Select>
              </FormControl>

              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ fontStyle: "italic" }}
              >
                * Hệ thống sẽ tự động giữ nguyên tổng tiền hóa đơn cũ của khách
                hàng và chỉ thực hiện điều chuyển thông tin phòng vật lý.
              </Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: "1px solid #e2e8f0",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => setUpgradeDialog(false)}
            color="inherit"
            sx={{ fontWeight: 700, textTransform: "none" }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirmUpgrade}
            variant="contained"
            disabled={isSubmitting || !selectedNewRoomId}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              background: "linear-gradient(135deg, #d4af37 0%, #b8962a 100%)",
              color: "#FAFAF9",
              px: 3,
              "&:hover": { bgcolor: "#b8962a" },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Xác nhận chuyển"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG SMART CHECK-IN TÍCH HỢP */}
      <Dialog
        open={checkInDialog.open}
        onClose={() => setCheckInDialog({ ...checkInDialog, open: false })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontWeight: 800, borderBottom: "1px solid #e2e8f0", pb: 2 }}
        >
          Xác nhận Check-in & Giao phòng
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {checkInDialog.booking &&
            (() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const expectedDate = new Date(
                checkInDialog.booking.check_in_date,
              );
              expectedDate.setHours(0, 0, 0, 0);
              const isEarlyCheckIn = today < expectedDate; // Tự động phát hiện Check-in sớm ngày

              return (
                <Stack gap={2}>
                  <Alert severity="info" sx={{ borderRadius: "8px" }}>
                    Khách hàng:{" "}
                    <strong>
                      {checkInDialog.booking.customer_name ||
                        checkInDialog.booking.user_name}
                    </strong>{" "}
                    <br />
                    Phòng dự kiến:{" "}
                    <strong>
                      Phòng {checkInDialog.booking.room_number || "Chưa xếp"}
                    </strong>{" "}
                    <br />
                    Ngày bắt đầu:{" "}
                    <strong>{expectedDate.toLocaleDateString("vi-VN")}</strong>
                  </Alert>

                  {/* Cảnh báo UX xuất sắc cho Lễ tân khi khách đến sớm */}
                  {isEarlyCheckIn && (
                    <Alert severity="warning" sx={{ borderRadius: "8px" }}>
                      <strong>Khách đến sớm trước ngày!</strong> Hệ thống sẽ tự
                      động chuyển ngày Check-in về hôm nay và tính thêm tiền
                      phòng phụ thu vào hóa đơn.
                    </Alert>
                  )}

                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#4a5568", mt: 1 }}
                  >
                    Xử lý sự cố (Nếu phòng hiện tại đang bẩn/bận):
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>Đổi phòng thay thế (Tùy chọn)</InputLabel>
                    <Select
                      value={checkInDialog.overrideRoomId}
                      label="Đổi phòng thay thế (Tùy chọn)"
                      onChange={(e) =>
                        setCheckInDialog({
                          ...checkInDialog,
                          overrideRoomId: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="">
                        <em>-- Giữ nguyên phòng dự kiến ban đầu --</em>
                      </MenuItem>
                      {checkInDialog.availableRooms.map((room) => (
                        <MenuItem key={room.id} value={room.id}>
                          Đổi sang Phòng {room.room_number} ({room.type_name})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              );
            })()}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setCheckInDialog({ ...checkInDialog, open: false })}
            color="inherit"
            sx={{ fontWeight: 700 }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={submitCheckIn}
            variant="contained"
            color="info"
            disabled={isSubmitting}
            sx={{ fontWeight: 700, px: 3 }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Xác nhận Check-in"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBookingsPage;
