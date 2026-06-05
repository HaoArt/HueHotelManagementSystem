/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Snackbar,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import HotelIcon from "@mui/icons-material/Hotel";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";

import RoomService from "../../services/roomService";
import BookingService from "../../services/bookingService";
import FolioService from "../../services/folioService";
import ServiceService from "../../services/serviceService";

const COLORS = {
  primary: "#5e35b1",
  primaryDark: "#4527a0",
  teal: "#009688",
  navy: "#0b1b3f",
  bgLight: "#f6f9fe",
  border: "rgba(11, 27, 63, 0.14)",
  textMain: "#1a1a1a",
  textSecondary: "#667085",
};

const glassCardSx = {
  borderRadius: "4px",
  border: "1px solid rgba(255,255,255,0.4)",
  bgcolor: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 12px 30px rgba(11, 27, 63, 0.1)",
  transition:
    "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 18px 36px rgba(11, 27, 63, 0.15)",
    borderColor: "rgba(0, 150, 136, 0.35)",
  },
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "4px",
    bgcolor: "rgba(255,255,255,0.9)",
    "& fieldset": {
      borderColor: "rgba(11,27,63,0.12)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0,150,136,0.35)",
    },
    "&.Mui-focused fieldset": {
      borderColor: COLORS.teal,
    },
  },
};

const sectionTitleSx = {
  fontWeight: 700,
  color: COLORS.textMain,
  letterSpacing: "-0.02em",
};

const AdminRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  const [statusDialog, setStatusDialog] = useState({ open: false, room: null });
  const [newStatus, setNewStatus] = useState("");

  const [occupiedDialog, setOccupiedDialog] = useState({
    open: false,
    room: null,
  });
  const [loadingOccupied, setLoadingOccupied] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [folioData, setFolioData] = useState([]);
  const [totalFolioAmount, setTotalFolioAmount] = useState(0);

  const [addServiceDialog, setAddServiceDialog] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [serviceQty, setServiceQty] = useState(1);
  const [changeRoomDialog, setChangeRoomDialog] = useState(false);
  const [selectedNewRoom, setSelectedNewRoom] = useState("");
  const [isFreeUpgrade, setIsFreeUpgrade] = useState(false);
  const [usageTime, setUsageTime] = useState("");
  const [serviceNote, setServiceNote] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmColor: "primary",
    onConfirm: null,
  });

  const [pendingOrders, setPendingOrders] = useState([]);

  const fetchPendingOrders = async () => {
    try {
      const res = await FolioService.getPendingOrders();
      setPendingOrders(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách chờ:", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [resRooms, resServices] = await Promise.all([
          RoomService.getRooms(),
          ServiceService.getAllServices(),
        ]);
        setRooms(resRooms.data || resRooms);
        setServicesList(resServices.data || []);
        await fetchPendingOrders();
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
    const interval = setInterval(() => {
      fetchPendingOrders();
      RoomService.getRooms()
        .then((res) => setRooms(res.data || res))
        .catch((e) => e);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRoomsOnly = async () => {
    try {
      const res = await RoomService.getRooms();
      setRooms(res.data || res);
      await fetchPendingOrders();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Lỗi làm mới: " + err,
        severity: "error",
      });
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const roomNum = room.room_number ? room.room_number.toString() : "";
      return (
        roomNum.includes(searchTerm) &&
        (filterStatus === "All" || room.status === filterStatus) &&
        (filterType === "All" || (room.type_name || room.name) === filterType)
      );
    });
  }, [rooms, searchTerm, filterStatus, filterType]);

  const groupedRooms = useMemo(() => {
    const groups = {};
    filteredRooms.forEach((room) => {
      const floorNumber = Math.floor(parseInt(room.room_number) / 100);
      const floorName = isNaN(floorNumber)
        ? "Khu vực khác"
        : `Tầng ${floorNumber}`;
      if (!groups[floorName]) groups[floorName] = [];
      groups[floorName].push(room);
    });
    return groups;
  }, [filteredRooms]);

  const roomTypes = useMemo(() => {
    const types = rooms.map((r) => r.type_name || r.name).filter(Boolean);
    return ["All", ...new Set(types)];
  }, [rooms]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "Available":
        return {
          label: "Sẵn sàng",
          bg: "#f1f8e9",
          color: "#2e7d32",
          border: "#c8e6c9",
          icon: <CheckCircleIcon fontSize="small" />,
        };
      case "Occupied":
        return {
          label: "Có khách",
          bg: "#e3f2fd",
          color: "#1565c0",
          border: "#bbdefb",
          icon: <PersonIcon fontSize="small" />,
        };
      case "Dirty":
        return {
          label: "Cần dọn dẹp",
          bg: "#ffebee",
          color: "#c62828",
          border: "#ffcdd2",
          icon: <CleaningServicesIcon fontSize="small" />,
        };
      case "Maintenance":
        return {
          label: "Bảo trì",
          bg: "#fff8e1",
          color: "#ef6c00",
          border: "#ffecb3",
          icon: <BuildIcon fontSize="small" />,
        };
      default:
        return {
          label: status,
          bg: "#f5f5f5",
          color: "#616161",
          border: "#e0e0e0",
          icon: <MeetingRoomIcon fontSize="small" />,
        };
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await RoomService.updateRoomStatus(statusDialog.room.id, newStatus);
      setStatusDialog({ open: false, room: null });
      setSnackbar({
        open: true,
        message: "Cập nhật thành công!",
        severity: "success",
      });
      fetchRoomsOnly();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Lỗi cập nhật: " + err,
        severity: "error",
      });
    }
  };

  const reloadFolioData = async (bookingId, roomTotalAmount) => {
    const folioRes = await FolioService.getFolio(bookingId);
    const servicesUsed = folioRes.data?.services || [];
    setFolioData(servicesUsed);
    const dynamicRoomTotal = folioRes.data?.roomTotal || roomTotalAmount;
    const totalService = servicesUsed.reduce(
      (sum, item) => sum + parseFloat(item.total_price),
      0,
    );
    setTotalFolioAmount(parseFloat(dynamicRoomTotal) + totalService);
    setCurrentBooking((prev) => ({
      ...prev,
      total_amount: dynamicRoomTotal,
    }));
  };

  const handleRoomClick = async (room) => {
    if (room.status === "Occupied") {
      setOccupiedDialog({ open: true, room: room });
      setLoadingOccupied(true);
      try {
        const bookingRes = await BookingService.getCurrentBookingByRoomId(
          room.id,
        );
        const booking = bookingRes.data;
        setCurrentBooking(booking);
        await reloadFolioData(booking.id, booking.total_amount);
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Lỗi tải thông tin: " + err,
          severity: "error",
        });
        setOccupiedDialog({ open: false, room: null });
      } finally {
        setLoadingOccupied(false);
      }
    } else {
      setStatusDialog({ open: true, room: room });
      setNewStatus(room.status);
    }
  };

  const handleAddServiceSubmit = async () => {
    if (!selectedServiceId || serviceQty < 1) {
      return setSnackbar({
        open: true,
        message: "Dữ liệu không hợp lệ!",
        severity: "warning",
      });
    }

    // 1. Tìm thông tin dịch vụ đang được chọn để biết nó thuộc loại nào
    const selectedSvc = servicesList.find((s) => s.id === selectedServiceId);

    // 2. Bắt lỗi: Nếu là dịch vụ Đặt trước (PreOrder) thì bắt buộc phải nhập giờ
    if (selectedSvc?.service_type === "PreOrder" && !usageTime) {
      return setSnackbar({
        open: true,
        message: "Vui lòng chọn thời gian hẹn phục vụ!",
        severity: "warning",
      });
    }

    try {
      // 3. Đóng gói dữ liệu gửi xuống API
      await FolioService.orderService({
        booking_id: currentBooking.id,
        service_id: selectedServiceId,
        quantity: serviceQty,
        // Nếu là PreOrder thì gửi giờ lên, nếu là Immediate thì ép về null
        usage_time: selectedSvc?.service_type === "PreOrder" ? usageTime : null,
        note: serviceNote,
      });

      // 4. Reset toàn bộ form về mặc định sau khi thành công
      setAddServiceDialog(false);
      setSelectedServiceId("");
      setServiceQty(1);
      setUsageTime("");
      setServiceNote("");

      await reloadFolioData(currentBooking.id, currentBooking.total_amount);
      await fetchPendingOrders();
      setSnackbar({
        open: true,
        message: "Đã thêm dịch vụ thành công!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({ open: true, message: "Lỗi: " + error, severity: "error" });
    }
  };

  const handleMarkAsDelivered = async (itemId) => {
    try {
      await FolioService.markAsDelivered(itemId);
      setSnackbar({
        open: true,
        message: "Đã xác nhận phục vụ dịch vụ!",
        severity: "success",
      });
      await reloadFolioData(currentBooking.id, currentBooking.total_amount);
      await fetchPendingOrders();
    } catch (error) {
      setSnackbar({ open: true, message: error.toString(), severity: "error" });
    }
  };
  const handleCancelFolioItem = async (itemId) => {
    try {
      const res = await FolioService.deleteFolioItem(itemId);
      setSnackbar({
        open: true,
        message: res.message || "Đã xử lý yêu cầu hủy dịch vụ!",
        severity:
          res.message && res.message.includes("phạt") ? "warning" : "success",
      });
      await reloadFolioData(currentBooking.id, currentBooking.total_amount);
      await fetchPendingOrders();
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          "Lỗi khi hủy: " + (error.response?.data?.message || error.toString()),
        severity: "error",
      });
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

  const buttonStyle = {
    borderRadius: "4px",
    textTransform: "none",
    fontWeight: 700,
    letterSpacing: "0.01em",
    px: 2.2,
    py: 0.95,
    transition: "all 0.22s ease",
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        background:
          "radial-gradient(circle at 14% 8%, rgba(0,150,136,0.07), transparent 34%), radial-gradient(circle at 88% 92%, rgba(11,27,63,0.06), transparent 32%), linear-gradient(180deg, #f6f9fe 0%, #eef3fa 52%, #f8fbff 100%)",
        minHeight: "100vh",
        overflowX: "hidden",
        pb: { xs: 5, md: 8 },
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
        <Box sx={{ maxWidth: { xs: "100%", md: "70%" } }}>
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{
              color: COLORS.navy,
              letterSpacing: "-0.03em",
              fontSize: { xs: "1.65rem", sm: "2rem", md: "2.2rem" },
            }}
          >
            Sơ Đồ Phòng
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Hiển thị {filteredRooms.length} phòng trong hệ thống
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "space-between", sm: "flex-start" },
            width: { xs: "100%", sm: "auto" },
            gap: 1.25,
          }}
        >
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            sx={{
              bgcolor: "rgba(255,255,255,0.78)",
              borderRadius: "4px",
              border: "1px solid rgba(11,27,63,0.12)",
              boxShadow: "0 6px 16px rgba(11, 27, 63, 0.08)",
              "& .MuiToggleButton-root": {
                py: 0.7,
                px: 1.6,
                textTransform: "none",
                borderRadius: "4px",
                borderColor: "transparent",
                fontWeight: 700,
                color: COLORS.navy,
                fontSize: "0.85rem",
              },
              "& .Mui-selected": {
                bgcolor: `${COLORS.teal} !important`,
                color: "white !important",
              },
            }}
          >
            <ToggleButton value="grid">
              <ViewModuleIcon sx={{ mr: 1, fontSize: 18 }} /> Sơ đồ
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon sx={{ mr: 1, fontSize: 18 }} /> Danh sách
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            onClick={fetchRoomsOnly}
            sx={{
              ...buttonStyle,
              color: "white",
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              boxShadow: "0 8px 18px rgba(11,27,63,0.22)",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 12px 24px rgba(11,27,63,0.3)",
              },
              fontSize: "0.85rem",
            }}
          >
            LÀM MỚI
          </Button>
        </Box>
      </Box>

      {/* THÔNG BÁO TỔNG QUÁT NẾU CÓ ĐƠN DỊCH VỤ MỚI */}
      {pendingOrders.length > 0 && (
        <Alert
          severity="warning"
          icon={<NotificationsActiveIcon fontSize="inherit" />}
          sx={{
            mb: { xs: 2.5, sm: 3, md: 4 },
            borderRadius: "4px",
            bgcolor: "rgba(255,243,224,0.85)",
            border: "1px solid rgba(237,108,2,0.3)",
            alignItems: "center",
            boxShadow: "0 10px 22px rgba(237,108,2,0.12)",
          }}
        >
          <Typography variant="body1" fontWeight="bold" color="#e65100">
            CÓ {pendingOrders.length} YÊU CẦU DỊCH VỤ MỚI CHƯA PHỤC VỤ!
          </Typography>
          <Typography variant="body2" color="#e65100">
            Các phòng đang yêu cầu:{" "}
            <b>
              {Array.from(
                new Set(pendingOrders.map((p) => p.room_number)),
              ).join(", ")}
            </b>
            . Vui lòng nhấp vào phòng để xem chi tiết.
          </Typography>
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          ...glassCardSx,
          p: { xs: 2, sm: 2.5, md: 3 },
          mb: { xs: 2.5, sm: 3, md: 4 },
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm số phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={inputStyle}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={inputStyle}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                label="Trạng thái"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="All">Tất cả</MenuItem>
                <MenuItem value="Available">Sẵn sàng (Available)</MenuItem>
                <MenuItem value="Occupied">Đang có khách (Occupied)</MenuItem>
                <MenuItem value="Dirty">Cần dọn dẹp (Dirty)</MenuItem>
                <MenuItem value="Maintenance">Bảo trì (Maintenance)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={inputStyle}>
              <InputLabel>Loại phòng</InputLabel>
              <Select
                value={filterType}
                label="Loại phòng"
                onChange={(e) => setFilterType(e.target.value)}
              >
                {roomTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type === "All" ? "Tất cả" : type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("All");
                setFilterType("All");
              }}
              sx={{
                ...buttonStyle,
                py: 0.8,
                color: COLORS.textSecondary,
                borderColor: COLORS.border,
              }}
            >
              Xóa lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {viewMode === "grid" ? (
        <Box>
          {Object.keys(groupedRooms)
            .sort()
            .map((floor) => (
              <Box key={floor} sx={{ mb: { xs: 3.5, md: 5 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    ...sectionTitleSx,
                    color: COLORS.navy,
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <MeetingRoomIcon /> {floor}
                </Typography>
                <Divider sx={{ mb: 2.5, borderColor: "rgba(11,27,63,0.1)" }} />
                <Box
                  sx={{
                    display: "grid",
                    gap: { xs: 1.5, sm: 2, md: 2.5 },
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(160px, 1fr))",
                  }}
                >
                  {groupedRooms[floor].map((room) => {
                    const config = getStatusConfig(room.status);

                    const hasPendingOrder = pendingOrders.some(
                      (p) => p.room_number === room.room_number,
                    );

                    return (
                      <Tooltip
                        title={`Quản lý phòng ${room.room_number}`}
                        arrow
                        placement="top"
                        key={room.id}
                      >
                        <Paper
                          elevation={0}
                          onClick={() => handleRoomClick(room)}
                          sx={{
                            ...glassCardSx,
                            width: "100%",
                            aspectRatio: "1 / 1",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "4px",
                            border: `1px solid ${hasPendingOrder ? "#ed6c02" : config.border}`,
                            position: "relative",
                            cursor: "pointer",
                            overflow: "hidden",
                            background: `linear-gradient(180deg, ${config.bg} 0%, rgba(255,255,255,0.96) 100%)`,
                            boxShadow: hasPendingOrder
                              ? "0 0 0 1px rgba(237,108,2,0.35), 0 10px 24px rgba(237,108,2,0.18)"
                              : "0 8px 18px rgba(11,27,63,0.09)",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: `0 12px 26px ${config.color}36`,
                            },
                          }}
                        >
                          {/* CHUÔNG NHẤP NHÁY NẾU CÓ YÊU CẦU MỚI */}
                          {hasPendingOrder && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                left: 10,
                                color: "#ed6c02",
                                "@keyframes blinker": {
                                  "0%": { opacity: 1 },
                                  "50%": { opacity: 0.2 },
                                  "100%": { opacity: 1 },
                                },
                                animation: "blinker 1s linear infinite",
                              }}
                            >
                              <NotificationsActiveIcon fontSize="small" />
                            </Box>
                          )}

                          <Box
                            sx={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              opacity: 0.8,
                            }}
                          >
                            {config.icon}
                          </Box>
                          <Typography
                            variant="h4"
                            fontWeight="900"
                            sx={{ zIndex: 1, color: config.color }}
                          >
                            {room.room_number}
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight="500"
                            sx={{
                              zIndex: 1,
                              mt: 0.5,
                              opacity: 0.8,
                              textAlign: "center",
                              px: 1,
                            }}
                          >
                            {room.type_name || room.name}
                          </Typography>
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              width: "100%",
                              bgcolor: hasPendingOrder
                                ? "#ed6c02"
                                : config.color,
                              color: "white",
                              textAlign: "center",
                              py: 0.5,
                              zIndex: 1,
                              transition: "0.3s",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: "bold", fontSize: "0.7rem" }}
                            >
                              {hasPendingOrder
                                ? "CÓ YÊU CẦU"
                                : config.label.toUpperCase()}
                            </Typography>
                          </Box>
                        </Paper>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            ))}
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: "4px",
            border: "1px solid rgba(11,27,63,0.12)",
            overflowX: "auto",
            bgcolor: "rgba(255,255,255,0.92)",
            boxShadow: "0 10px 24px rgba(11,27,63,0.1)",
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead
              sx={{
                bgcolor: "rgba(11,27,63,0.96)",
                "& .MuiTableCell-root": {
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                },
              }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Số phòng
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Loại phòng
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Trạng thái
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Dịch vụ phòng
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
              {filteredRooms.map((room) => {
                const config = getStatusConfig(room.status);
                const hasPendingOrder = pendingOrders.some(
                  (p) => p.room_number === room.room_number,
                );
                return (
                  <TableRow
                    key={room.id}
                    hover
                    sx={{
                      "& td": { borderBottom: "1px solid rgba(11,27,63,0.08)" },
                      "&:nth-of-type(even)": {
                        backgroundColor: "rgba(11,27,63,0.015)",
                      },
                      "&:hover": {
                        backgroundColor: "rgba(0,150,136,0.06)",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                      {room.room_number}
                    </TableCell>
                    <TableCell>{room.type_name || room.name}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                          bgcolor: config.bg,
                          color: config.color,
                          px: 2,
                          py: 0.5,
                          borderRadius: "4px",
                          border: `1px solid ${config.border}`,
                        }}
                      >
                        {config.icon}{" "}
                        <Typography variant="caption" fontWeight="bold">
                          {config.label}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {hasPendingOrder ? (
                        <Chip
                          icon={<NotificationsActiveIcon />}
                          label="Có yêu cầu mới"
                          color="warning"
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: "bold" }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Không có yêu cầu
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleRoomClick(room)}
                        sx={{
                          ...buttonStyle,
                          borderColor: "rgba(11,27,63,0.2)",
                          color: COLORS.navy,
                          "&:hover": {
                            borderColor: COLORS.teal,
                            bgcolor: "rgba(0,150,136,0.08)",
                          },
                        }}
                      >
                        Cập nhật
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* update trạng thái phòng */}
      <Dialog
        disableScrollLock={true}
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, room: null })}
        PaperProps={{
          sx: {
            borderRadius: "4px",
            minWidth: 350,
            border: "1px solid rgba(11,27,63,0.12)",
            boxShadow: "0 20px 40px rgba(11,27,63,0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: "white",
            background: "linear-gradient(135deg, #0b1b3f 0%, #5e35b1 100%)",
          }}
        >
          Cập nhật phòng {statusDialog.room?.room_number}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth sx={{ mt: 2, ...inputStyle }}>
            <InputLabel>Trạng thái thực tế</InputLabel>
            <Select
              value={newStatus}
              label="Trạng thái thực tế"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="Available">
                <Box sx={{ display: "flex", gap: 2 }}>
                  <CheckCircleIcon color="success" /> Sẵn sàng
                </Box>
              </MenuItem>
              <MenuItem value="Dirty">
                <Box sx={{ display: "flex", gap: 2 }}>
                  <CleaningServicesIcon color="error" /> Cần dọn dẹp
                </Box>
              </MenuItem>
              <MenuItem value="Maintenance">
                <Box sx={{ display: "flex", gap: 2 }}>
                  <BuildIcon color="warning" /> Đang bảo trì
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
          <Button
            onClick={() => setStatusDialog({ open: false, room: null })}
            color="inherit"
            sx={buttonStyle}
          >
            HỦY
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            sx={{
              ...buttonStyle,
              color: "white",
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              boxShadow: "0 8px 18px rgba(11,27,63,0.22)",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 12px 24px rgba(11,27,63,0.3)",
              },
            }}
          >
            LƯU THAY ĐỔI
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        disableScrollLock={true}
        open={occupiedDialog.open}
        onClose={() => setOccupiedDialog({ open: false, room: null })}
        maxWidth="lg" // ✨ Mở rộng Dialog ra một chút để chứa bảng kê chi tiết
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            bgcolor: "#f1f5f9",
            border: "1px solid rgba(11,27,63,0.12)",
            boxShadow: "0 20px 44px rgba(11,27,63,0.22)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Phòng {occupiedDialog.room?.room_number} - Khách Đang Lưu Trú
          </Typography>
          <Chip
            label="Occupied"
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
          />
        </DialogTitle>
        <DialogContent sx={{ pt: 3, minHeight: 500 }}>
          {loadingOccupied ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : currentBooking ? (
            (() => {
              // ✨ BỘ TÍNH TOÁN TÀI CHÍNH MINH BẠCH
              let holiday = 0,
                earlyIn = 0,
                lateOut = 0;
              const noteStr = currentBooking.note || "";
              const hMatch = noteStr.match(
                /\[HolidaySurcharge:(\d+(?:\.\d+)?)\]/,
              );
              if (hMatch) holiday = parseFloat(hMatch[1]);
              const eMatch = noteStr.match(
                /\[EarlyInSurcharge:(\d+(?:\.\d+)?)\]/,
              );
              if (eMatch) earlyIn = parseFloat(eMatch[1]);
              const lMatches = [
                ...noteStr.matchAll(/\[LateOutSurcharge:(\d+(?:\.\d+)?)\]/g),
              ];
              lMatches.forEach((m) => (lateOut += parseFloat(m[1])));

              const knownTotal = holiday + earlyIn + lateOut;
              const originalRoomTotal =
                parseFloat(currentBooking.total_amount || 0) +
                parseFloat(currentBooking.discount_amount || 0);

              const checkIn = new Date(currentBooking.check_in_date);
              const checkOut = new Date(currentBooking.check_out_date);
              let totalDays =
                Math.ceil(
                  Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24),
                ) || 1;

              const rawRoomTotal =
                parseFloat(currentBooking.base_price || 0) * totalDays;
              let roomGoc = rawRoomTotal;
              let fallback = originalRoomTotal - rawRoomTotal - knownTotal;

              if (fallback < 0) {
                roomGoc = originalRoomTotal - knownTotal;
                fallback = 0;
              }

              let fallbackReason = "";
              const sysNotes = noteStr.match(/\[Hệ thống:(.*?)\]/g);
              if (sysNotes && sysNotes.length > 0) {
                fallbackReason = sysNotes
                  .map((n) =>
                    n.replace("[Hệ thống:", "").replace("]", "").trim(),
                  )
                  .join("; ");
              }

              if (fallback > 0 && !fallbackReason) {
                roomGoc += fallback;
                fallback = 0;
              }

              const activeSvcs = folioData.filter(
                (s) => s.status !== "Cancelled",
              );
              const activeSvcsTotal = activeSvcs.reduce(
                (sum, s) => sum + parseFloat(s.total_price || 0),
                0,
              );
              const cancelledFeesTotal = folioData
                .filter((s) => s.status === "Cancelled")
                .reduce(
                  (sum, s) => sum + parseFloat(s.cancellation_fee || 0),
                  0,
                );
              const discountAmt = parseFloat(
                currentBooking.discount_amount || 0,
              );
              const depositAmt = parseFloat(currentBooking.deposit_amount || 0);
              const remainingAmt = totalFolioAmount - depositAmt;

              // ✨ AI NHẬN DIỆN PHỤ THU TRỄ (LATE CHECKOUT)
              const checkOutTime = new Date(currentBooking.check_out_date);
              checkOutTime.setHours(12, 0, 0, 0); // Giờ checkout tiêu chuẩn 12h trưa
              const nowTime = new Date();
              const isLateCheckOut = nowTime > checkOutTime;
              const lateHoursCount = isLateCheckOut
                ? Math.ceil((nowTime - checkOutTime) / (1000 * 60 * 60))
                : 0;

              return (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                    height: "100%",
                  }}
                >
                  {/* CỘT TRÁI: THÔNG TIN VÀ DỊCH VỤ SỬ DỤNG */}
                  <Paper
                    elevation={0}
                    sx={{
                      ...glassCardSx,
                      p: 3,
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color={COLORS.navy}
                    >
                      Thông Tin Đơn Hàng #{currentBooking.id}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Box
                      sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}
                    >
                      <Chip
                        icon={<PersonIcon />}
                        label={currentBooking.user_full_name}
                        variant="outlined"
                        sx={{ fontWeight: "bold" }}
                      />
                      <Chip
                        label={`SĐT: ${currentBooking.phone}`}
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                      <Box
                        sx={{
                          bgcolor: "#e3f2fd",
                          p: 1.5,
                          borderRadius: 1,
                          flex: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          NHẬN PHÒNG (IN):
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {new Date(
                            currentBooking.check_in_date,
                          ).toLocaleDateString("vi-VN")}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          bgcolor: isLateCheckOut ? "#ffebee" : "#e3f2fd",
                          p: 1.5,
                          borderRadius: 1,
                          flex: 1,
                          border: isLateCheckOut ? "1px solid #f44336" : "none",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color={
                            isLateCheckOut ? "error.main" : "text.secondary"
                          }
                        >
                          TRẢ PHÒNG (OUT):
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={isLateCheckOut ? "error.main" : "text.primary"}
                        >
                          {new Date(
                            currentBooking.check_out_date,
                          ).toLocaleDateString("vi-VN")}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color={COLORS.navy}
                      >
                        Nhật Ký Dịch Vụ
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddShoppingCartIcon />}
                        onClick={() => setAddServiceDialog(true)}
                        sx={{
                          borderRadius: "4px",
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        + Thêm DV
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    <List
                      sx={{
                        flexGrow: 1,
                        overflowY: "auto",
                        maxHeight: 280,
                        pr: 1,
                      }}
                    >
                      {folioData.length === 0 ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          textAlign="center"
                          sx={{ mt: 2 }}
                        >
                          Khách chưa sử dụng dịch vụ nào.
                        </Typography>
                      ) : (
                        folioData.map((item, index) => {
                          const isCancelled = item.status === "Cancelled";
                          const isPending = item.status === "Pending";

                          return (
                            <ListItem
                              key={index}
                              disablePadding
                              sx={{
                                mb: 1.5,
                                bgcolor: isCancelled
                                  ? "#ffebee"
                                  : isPending
                                    ? "#fffde7"
                                    : "#fff",
                                border: isCancelled
                                  ? "1px dashed #ffcdd2"
                                  : "1px solid #e2e8f0",
                                p: 1.5,
                                borderRadius: "6px",
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    sx={{
                                      textDecoration: isCancelled
                                        ? "line-through"
                                        : "none",
                                      color: isCancelled
                                        ? "text.secondary"
                                        : "text.primary",
                                    }}
                                  >
                                    {item.services_name ||
                                      item.service_name ||
                                      "Dịch vụ"}{" "}
                                    (x{item.quantity})
                                  </Typography>
                                }
                                secondary={
                                  <Box sx={{ mt: 0.5 }}>
                                    <Typography
                                      variant="caption"
                                      fontWeight="bold"
                                      color={
                                        isCancelled
                                          ? "error.main"
                                          : isPending
                                            ? "warning.main"
                                            : "success.main"
                                      }
                                    >
                                      {isCancelled
                                        ? parseFloat(item.cancellation_fee) > 0
                                          ? "🚫 Đã hủy (Tính phí phạt)"
                                          : "🚫 Hủy ép / Hủy sớm (Miễn phí)"
                                        : isPending
                                          ? "⏳ Khách đang chờ..."
                                          : "✅ Đã phục vụ"}
                                    </Typography>

                                    {item.usage_time && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "#d32f2f",
                                          display: "block",
                                          mt: 0.5,
                                          fontWeight: 600,
                                        }}
                                      >
                                        ⏰ Giờ hẹn:{" "}
                                        {new Date(
                                          item.usage_time,
                                        ).toLocaleString("vi-VN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          day: "2-digit",
                                          month: "2-digit",
                                        })}
                                      </Typography>
                                    )}

                                    {item.note && (
                                      <Box
                                        sx={{
                                          mt: 0.5,
                                          p: 1,
                                          bgcolor: "rgba(0,0,0,0.04)",
                                          borderRadius: "6px",
                                          borderLeft: "3px solid #009688",
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          color="text.primary"
                                          sx={{
                                            display: "block",
                                            fontStyle: "italic",
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                            lineHeight: 1.5,
                                          }}
                                        >
                                          📝 Yêu cầu: {item.note}
                                        </Typography>
                                      </Box>
                                    )}

                                    {isPending &&
                                      item.service_type === "PreOrder" && (
                                        <Typography
                                          display="block"
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ mt: 0.5, fontStyle: "italic" }}
                                        >
                                          * Hủy trước 2 tiếng: Miễn phí | Dưới 2
                                          tiếng: Phạt 50% | Quá hạn: Phạt 100%
                                        </Typography>
                                      )}
                                    {isPending &&
                                      item.service_type !== "PreOrder" && (
                                        <Typography
                                          display="block"
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ mt: 0.5, fontStyle: "italic" }}
                                        >
                                          * Hủy miễn phí trước khi xác nhận "Đã
                                          phục vụ".
                                        </Typography>
                                      )}
                                  </Box>
                                }
                              />
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  pl: 2,
                                }}
                              >
                                <Box sx={{ textAlign: "right" }}>
                                  {isCancelled ? (
                                    <>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          textDecoration: "line-through",
                                          color: "text.secondary",
                                          display: "block",
                                        }}
                                      >
                                        {parseFloat(
                                          item.total_price,
                                        ).toLocaleString()}{" "}
                                        đ
                                      </Typography>
                                      <Typography
                                        fontWeight="bold"
                                        variant="body2"
                                        color="error.main"
                                      >
                                        Phạt:{" "}
                                        {parseFloat(
                                          item.cancellation_fee || 0,
                                        ).toLocaleString()}{" "}
                                        đ
                                      </Typography>
                                    </>
                                  ) : (
                                    <Typography
                                      fontWeight="bold"
                                      variant="body2"
                                    >
                                      {parseFloat(
                                        item.total_price,
                                      ).toLocaleString()}{" "}
                                      đ
                                    </Typography>
                                  )}
                                </Box>
                                {(isPending || item.status === "Delivered") && (
                                  <Stack direction="row" spacing={0.5} ml={1}>
                                    {isPending && (
                                      <Tooltip
                                        title="Đã mang lên phòng"
                                        placement="top"
                                      >
                                        <IconButton
                                          color="success"
                                          size="small"
                                          onClick={() =>
                                            handleMarkAsDelivered(item.id)
                                          }
                                          sx={{
                                            border: "1px solid #4caf50",
                                            bgcolor: "#e8f5e9",
                                          }}
                                        >
                                          <CheckCircleIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    <Tooltip
                                      title={
                                        isPending
                                          ? "Hủy dịch vụ"
                                          : "Hủy ép / Hoàn trả (Void)"
                                      }
                                      placement="top"
                                    >
                                      <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() =>
                                          handleCancelFolioItem(item.id)
                                        }
                                        onClick={() => {
                                          let warningMsg =
                                            "Bạn đang hủy dịch vụ (chưa phục vụ) giúp khách hàng. Khách sẽ được hủy miễn phí.";
                                          let isPenalty = false;

                                          if (item.status === "Delivered") {
                                            warningMsg =
                                              "Bạn đang dùng quyền HỦY ÉP (Void) cho món đã phục vụ. Hệ thống sẽ hoàn tiền 100% (Phạt 0đ).";
                                          } else if (
                                            item.service_type === "PreOrder" &&
                                            item.usage_time
                                          ) {
                                            const diffHours =
                                              (new Date(item.usage_time) -
                                                new Date()) /
                                              (1000 * 60 * 60);
                                            if (diffHours <= 0) {
                                              warningMsg =
                                                "LƯU Ý: Khách báo hủy sau giờ hẹn. Hệ thống sẽ TỰ ĐỘNG PHẠT 100% giá trị theo quy định.";
                                              isPenalty = true;
                                            } else if (diffHours <= 2) {
                                              warningMsg =
                                                "LƯU Ý: Khách báo hủy quá sát giờ (dưới 2 tiếng). Hệ thống sẽ TỰ ĐỘNG PHẠT 50% giá trị theo quy định.";
                                              isPenalty = true;
                                            }
                                          }

                                          setConfirmDialog({
                                            open: true,
                                            title:
                                              item.status === "Delivered"
                                                ? "Xác nhận Hủy ép (Void)"
                                                : "Xác nhận Hủy dịch vụ",
                                            message: warningMsg,
                                            confirmColor: isPenalty
                                              ? "error"
                                              : "primary",
                                            onConfirm: async () => {
                                              setConfirmDialog((prev) => ({
                                                ...prev,
                                                open: false,
                                              }));
                                              await handleCancelFolioItem(
                                                item.id,
                                              );
                                            },
                                          });
                                        }}
                                        sx={{
                                          border: "1px solid #f44336",
                                          bgcolor: "#ffebee",
                                        }}
                                      >
                                        <CancelIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                )}
                              </Box>
                            </ListItem>
                          );
                        })
                      )}
                    </List>
                  </Paper>

                  {/* CỘT PHẢI: BẢNG KÊ MINH BẠCH */}
                  <Paper
                    elevation={0}
                    sx={{
                      ...glassCardSx,
                      p: 3,
                      flex: "0 0 380px",
                      bgcolor: "#fff",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="900"
                      textAlign="center"
                      color={COLORS.navy}
                      mb={2}
                    >
                      BẢNG KÊ CHI PHÍ
                    </Typography>

                    {/* CẢNH BÁO LATE CHECKOUT */}
                    {isLateCheckOut && (
                      <Alert
                        severity="warning"
                        icon={<WarningIcon />}
                        sx={{ mb: 3, borderRadius: 1 }}
                      >
                        Khách đang trả phòng trễ <b>{lateHoursCount} giờ</b>.
                        Khi bấm Check-out, hệ thống sẽ <b>TỰ ĐỘNG</b> tính phụ
                        phí trả trễ hoặc ở lố ngày.
                      </Alert>
                    )}

                    <Stack spacing={2} sx={{ mb: 3, px: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          1. Tiền phòng lưu trú
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {roomGoc.toLocaleString()} đ
                        </Typography>
                      </Box>

                      {holiday > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="error.main"
                            fontWeight="500"
                          >
                            Phụ phí Lễ/Tết
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="error.main"
                          >
                            +{holiday.toLocaleString()} đ
                          </Typography>
                        </Box>
                      )}
                      {earlyIn > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="error.main"
                            fontWeight="500"
                          >
                            Phụ thu Check-in sớm
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="error.main"
                          >
                            +{earlyIn.toLocaleString()} đ
                          </Typography>
                        </Box>
                      )}
                      {lateOut > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="error.main"
                            fontWeight="500"
                          >
                            Phụ thu Check-out trễ
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="error.main"
                          >
                            +{lateOut.toLocaleString()} đ
                          </Typography>
                        </Box>
                      )}
                      {fallback > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="error.main"
                              fontWeight="500"
                            >
                              Phụ thu phát sinh
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="error.main"
                            >
                              +{fallback.toLocaleString()} đ
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* MINH BẠCH LỊCH SỬ BIẾN ĐỘNG (Luôn hiển thị nếu có note) */}
                      {fallbackReason && (
                        <Box
                          sx={{
                            mb: 1.5,
                            p: 1,
                            bgcolor: "rgba(0,0,0,0.03)",
                            borderRadius: 1,
                            borderLeft: "3px solid #9e9e9e",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontStyle: "italic",
                              display: "block",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            <b>Lịch sử biến động giá:</b>
                            <br />
                            {fallbackReason.split("; ").join("\n")}
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
                          2. Dịch vụ ({activeSvcs.length} món)
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {activeSvcsTotal.toLocaleString()} đ
                        </Typography>
                      </Box>
                      {cancelledFeesTotal > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" color="error.main">
                            3. Phí phạt hủy dịch vụ
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="error.main"
                          >
                            +{cancelledFeesTotal.toLocaleString()} đ
                          </Typography>
                        </Box>
                      )}
                      {discountAmt > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" color="success.main">
                            4. Giảm giá (Voucher)
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="success.main"
                          >
                            -{discountAmt.toLocaleString()} đ
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    <Divider sx={{ borderStyle: "dashed", mb: 2 }} />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                        px: 1,
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color={COLORS.navy}
                      >
                        TỔNG THANH TOÁN
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="900"
                        color={COLORS.navy}
                      >
                        {totalFolioAmount.toLocaleString()} đ
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 3,
                        px: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="warning.main"
                      >
                        Đã đặt cọc
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="warning.main"
                      >
                        -{depositAmt.toLocaleString()} đ
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        mt: "auto",
                        p: 2,
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
                        color={remainingAmt > 0 ? "error.main" : "success.main"}
                      >
                        {remainingAmt > 0 ? "CẦN THU THÊM:" : "CẦN HOÀN TRẢ:"}
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="900"
                        color={remainingAmt > 0 ? "error.main" : "success.main"}
                      >
                        {Math.abs(remainingAmt).toLocaleString()} đ
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              );
            })()
          ) : (
            <Alert severity="error" sx={{ borderRadius: "4px" }}>
              Lỗi dữ liệu
            </Alert>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            bgcolor: "white",
            borderTop: `1px solid ${COLORS.border}`,
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => setOccupiedDialog({ open: false, room: null })}
            color="inherit"
            sx={buttonStyle}
          >
            Đóng
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<SwapHorizIcon />}
              disabled={!currentBooking}
              onClick={() => {
                setChangeRoomDialog(true);
                setIsFreeUpgrade(false);
                setSelectedNewRoom("");
              }}
              sx={buttonStyle}
            >
              Nâng cấp / Đổi phòng
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<ReceiptLongIcon />}
              disabled={!currentBooking}
              sx={{
                ...buttonStyle,
                color: "white",
                background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
                boxShadow: "0 8px 18px rgba(11,27,63,0.22)",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 12px 24px rgba(11,27,63,0.3)",
                },
              }}
              onClick={() => {
                setConfirmDialog({
                  open: true,
                  title: "Xác nhận Check-out",
                  message: `Thu đủ ${totalFolioAmount.toLocaleString()}đ và Check-out?`,
                  confirmColor: "success",
                  onConfirm: async () => {
                    try {
                      await BookingService.checkOutBooking(currentBooking.id);
                      setSnackbar({
                        open: true,
                        message: "Check-out thành công!",
                        severity: "success",
                      });

                      const blobData = await BookingService.downloadInvoice(
                        currentBooking.id,
                      );
                      const url = window.URL.createObjectURL(
                        new Blob([blobData]),
                      );
                      const link = document.createElement("a");
                      link.href = url;
                      link.setAttribute(
                        "download",
                        `Invoice-HueHotel-${currentBooking.id}.pdf`,
                      );
                      document.body.appendChild(link);
                      link.click();
                      link.parentNode.removeChild(link);
                      window.URL.revokeObjectURL(url);

                      setOccupiedDialog({ open: false, room: null });
                      fetchRoomsOnly();
                    } catch (error) {
                      setSnackbar({
                        open: true,
                        message:
                          "Lỗi: " +
                          (error.response?.data?.message || error.toString()),
                        severity: "error",
                      });
                    } finally {
                      setConfirmDialog({ ...confirmDialog, open: false });
                    }
                  },
                });
              }}
            >
              Thanh Toán & Check-out
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <Dialog
        disableScrollLock={true}
        open={addServiceDialog}
        onClose={() => setAddServiceDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "4px",
            border: "1px solid rgba(11,27,63,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(135deg, #0b1b3f 0%, #5e35b1 100%)",
            color: "white",
          }}
        >
          Thêm Dịch Vụ
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth sx={{ mt: 1, mb: 3, ...inputStyle }}>
            <InputLabel>Chọn dịch vụ</InputLabel>
            <Select
              value={selectedServiceId}
              label="Chọn dịch vụ"
              onChange={(e) => setSelectedServiceId(e.target.value)}
            >
              {servicesList.map((svc) => (
                <MenuItem key={svc.id} value={svc.id}>
                  {svc.name} - {parseFloat(svc.price).toLocaleString()}đ
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="number"
            label="Số lượng"
            value={serviceQty}
            onChange={(e) => setServiceQty(parseInt(e.target.value))}
            inputProps={{ min: 1 }}
            sx={inputStyle}
          />
          {/* Lấy ra dịch vụ đang được chọn để kiểm tra loại dịch vụ */}
          {(() => {
            const selectedSvc = servicesList.find(
              (s) => s.id === selectedServiceId,
            );
            return (
              <>
                {/* CHỈ HIỆN Ô CHỌN GIỜ NẾU LÀ DỊCH VỤ "ĐẶT TRƯỚC" */}
                {selectedSvc?.service_type === "PreOrder" && (
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}
                    >
                      Thời gian hẹn phục vụ (*)
                    </Typography>
                    <TextField
                      fullWidth
                      sx={inputStyle}
                      type="datetime-local"
                      value={usageTime}
                      onChange={(e) => setUsageTime(e.target.value)}
                      required
                    />
                  </Box>
                )}

                {/* Ô GHI CHÚ LUÔN HIỆN CHO MỌI LOẠI DỊCH VỤ */}
                <TextField
                  fullWidth
                  sx={{ mt: 3, ...inputStyle }}
                  label="Ghi chú / Yêu cầu đặc biệt"
                  multiline
                  rows={2}
                  placeholder="VD: Phở không hành, xe tay ga màu đỏ..."
                  value={serviceNote}
                  onChange={(e) => setServiceNote(e.target.value)}
                />
              </>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
          <Button
            onClick={() => {
              setAddServiceDialog(false);
              setUsageTime("");
              setServiceNote("");
            }}
            sx={buttonStyle}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            sx={{
              ...buttonStyle,
              color: "white",
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
            }}
            onClick={handleAddServiceSubmit}
          >
            XÁC NHẬN
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        disableScrollLock={true}
        open={changeRoomDialog}
        onClose={() => setChangeRoomDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "4px",
            border: "1px solid rgba(11,27,63,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(135deg, #5e35b1 0%, #0b1b3f 100%)",
            color: "white",
          }}
        >
          Đổi Phòng / Nâng Cấp
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: "4px" }}>
            Chỉ hiển thị các phòng <b>Sẵn sàng (Available)</b>.
          </Alert>
          <FormControl fullWidth sx={{ mt: 1, ...inputStyle }}>
            <InputLabel>Chọn phòng mới</InputLabel>
            <Select
              value={selectedNewRoom}
              label="Chọn phòng mới"
              onChange={(e) => setSelectedNewRoom(e.target.value)}
            >
              {rooms
                .filter((r) => r.status === "Available")
                .map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    Phòng {r.room_number} - {r.type_name || r.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={isFreeUpgrade}
                onChange={(e) => setIsFreeUpgrade(e.target.checked)}
                color="warning"
                sx={{ "&.Mui-checked": { color: "#d4af37" } }}
              />
            }
            label={
              <Typography
                variant="body2"
                fontWeight="bold"
                color="text.primary"
              >
                Đổi/Nâng hạng phòng miễn phí (Không tính thêm tiền)
              </Typography>
            }
            sx={{
              mt: 2,
              bgcolor: "#fff8e1",
              p: 1,
              borderRadius: 1,
              border: "1px dashed #ffe082",
            }}
          />
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ fontStyle: "italic", mt: 2, display: "block" }}
          >
            {isFreeUpgrade
              ? "* Hệ thống sẽ giữ nguyên hóa đơn, chỉ điều chuyển phòng vật lý (dùng khi gặp sự cố khách sạn)."
              : "* Hệ thống sẽ TỰ ĐỘNG TÍNH TOÁN chênh lệch giá gốc cho số đêm còn lại và cập nhật thẳng vào hóa đơn."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
          <Button
            onClick={() => setChangeRoomDialog(false)}
            sx={buttonStyle}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={buttonStyle}
            onClick={async () => {
              if (!selectedNewRoom) {
                setSnackbar({
                  open: true,
                  message: "Vui lòng chọn phòng!",
                  severity: "warning",
                });
                return;
              }

              try {
                // Truyền đúng 3 tham số rời rạc để khớp 100% với bookingService.js của em
                await BookingService.changeRoom(
                  currentBooking.id,
                  selectedNewRoom,
                  isFreeUpgrade,
                );

                // Đợi load xong dữ liệu mới đóng hộp thoại
                await fetchRoomsOnly();

                // Bật thông báo xanh
                setSnackbar({
                  open: true,
                  message: isFreeUpgrade
                    ? "Đã nâng hạng phòng miễn phí!"
                    : "Đổi phòng thành công!",
                  severity: "success",
                });

                setChangeRoomDialog(false);
                setOccupiedDialog({ open: false, room: null });
              } catch (error) {
                setSnackbar({
                  open: true,
                  message:
                    "Lỗi: " +
                    (error.response?.data?.message || error.toString()),
                  severity: "error",
                });
              }
            }}
          >
            XÁC NHẬN ĐỔI
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        disableScrollLock={true}
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        PaperProps={{
          sx: {
            borderRadius: "4px",
            minWidth: 350,
            border: "1px solid rgba(11,27,63,0.12)",
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
          >
            Xác nhận
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
          sx={{ width: "100%", borderRadius: "4px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminRoomsPage;
