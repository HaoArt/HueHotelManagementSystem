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
} from "@mui/material";

// Icons
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

// Services
import RoomService from "../../services/roomService";
import BookingService from "../../services/bookingService";
import FolioService from "../../services/folioService";
import ServiceService from "../../services/serviceService";

const COLORS = {
  primary: "#5e35b1",
  primaryDark: "#4527a0",
  teal: "#009688",
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
  textMain: "#001529",
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

  // THÊM: STATE LƯU CÁC DỊCH VỤ ĐANG CHỜ PHỤC VỤ (CỦA TẤT CẢ CÁC PHÒNG)
  const [pendingOrders, setPendingOrders] = useState([]);

  // HÀM QUÉT YÊU CẦU DỊCH VỤ TỪ KHÁCH HÀNG
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
        .catch((e) => console.log("Lỗi quét ngầm phòng:", e));
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
    if (!selectedServiceId || serviceQty < 1)
      return setSnackbar({
        open: true,
        message: "Dữ liệu không hợp lệ!",
        severity: "warning",
      });
    try {
      await FolioService.orderService({
        booking_id: currentBooking.id,
        service_id: selectedServiceId,
        quantity: serviceQty,
      });
      setAddServiceDialog(false);
      setSelectedServiceId("");
      setServiceQty(1);
      await reloadFolioData(currentBooking.id, currentBooking.total_amount);
      await fetchPendingOrders();
      setSnackbar({
        open: true,
        message: "Đã thêm dịch vụ!",
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
      await fetchPendingOrders(); // Cập nhật lại số lượng chuông cảnh báo ở ngoài
    } catch (error) {
      setSnackbar({ open: true, message: error.toString(), severity: "error" });
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: COLORS.teal }} />
      </Box>
    );

  const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: "4px" } };
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
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
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
            color={COLORS.textMain}
            sx={{ letterSpacing: "-1px" }}
          >
            Sơ Đồ Phòng
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Hiển thị {filteredRooms.length} phòng trong hệ thống
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            height: "42px",
            mt: 0.5,
          }}
        >
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            sx={{
              bgcolor: "#f9f9f9",
              borderRadius: "4px",
              border: `1px solid ${COLORS.border}`,
              height: "100%",
              "& .MuiToggleButton-root": {
                py: 0,
                px: 2.5,
                textTransform: "none",
                borderRadius: "4px",
                borderColor: "transparent",
                fontWeight: "600",
                color: "text.secondary",
                fontSize: "0.85rem",
              },
              "& .Mui-selected": {
                bgcolor: "#e0e0e0 !important",
                color: `${COLORS.textMain} !important`,
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
            disableElevation
            sx={{
              ...buttonStyle,
              bgcolor: COLORS.teal,
              "&:hover": { bgcolor: "#00796b" },
              px: 3,
              height: "100%",
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
            mb: 4,
            borderRadius: "8px",
            bgcolor: "#fff3e0",
            border: "1px solid #ffe0b2",
            alignItems: "center",
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
          p: 3,
          mb: 4,
          borderRadius: "4px",
          border: `1px solid ${COLORS.border}`,
          bgcolor: "white",
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
              <Box key={floor} sx={{ mb: 6 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color={COLORS.primary}
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <MeetingRoomIcon /> {floor}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box
                  sx={{
                    display: "grid",
                    gap: 3,
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(160px, 1fr))",
                  }}
                >
                  {groupedRooms[floor].map((room) => {
                    const config = getStatusConfig(room.status);

                    // KIỂM TRA XEM PHÒNG NÀY CÓ ĐANG ORDER MÓN GÌ KHÔNG ĐỂ HIỆN CHUÔNG
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
                            width: "100%",
                            aspectRatio: "1 / 1",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            bgcolor: config.bg,
                            color: config.color,
                            borderRadius: "4px",
                            border: `1px solid ${hasPendingOrder ? "#ed6c02" : config.border}`,
                            position: "relative",
                            cursor: "pointer",
                            overflow: "hidden",
                            transition: "all 0.2s ease",
                            boxShadow: hasPendingOrder
                              ? "0 0 10px rgba(237, 108, 2, 0.5)"
                              : "none",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: `0 4px 12px ${config.color}30`,
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
            border: `1px solid ${COLORS.border}`,
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: COLORS.primary }}>
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
                      "& td": { borderBottom: `1px solid ${COLORS.border}` },
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
                          borderColor: COLORS.border,
                          color: COLORS.textMain,
                          "&:hover": { bgcolor: "#f5f5f5" },
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

      {/* DIALOG CHỈNH TRẠNG THÁI PHÒNG TRỐNG */}
      <Dialog
        disableScrollLock={true}
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, room: null })}
        PaperProps={{ sx: { borderRadius: "4px", minWidth: 350 } }}
      >
        <DialogTitle
          sx={{ fontWeight: "bold", color: "white", bgcolor: COLORS.primary }}
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
            disableElevation
            sx={{ ...buttonStyle, bgcolor: COLORS.primary }}
          >
            LƯU THAY ĐỔI
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG KHÁCH IN-HOUSE CÓ DỊCH VỤ */}
      <Dialog
        disableScrollLock={true}
        open={occupiedDialog.open}
        onClose={() => setOccupiedDialog({ open: false, room: null })}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "4px", bgcolor: "#f8f9fa" } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#1565c0",
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
        <DialogContent sx={{ pt: 3, minHeight: 400 }}>
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
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "4px",
                    border: `1px solid ${COLORS.border}`,
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    color="#1565c0"
                  >
                    Thông Tin Đơn Hàng #{currentBooking.id}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Khách hàng:{" "}
                    <b style={{ color: "#000" }}>
                      {currentBooking.user_full_name}
                    </b>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    SĐT: <b style={{ color: "#000" }}>{currentBooking.phone}</b>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Nhận phòng:{" "}
                    <b style={{ color: "#000" }}>
                      {new Date(
                        currentBooking.check_in_date,
                      ).toLocaleDateString("vi-VN")}
                    </b>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Trả phòng:{" "}
                    <b style={{ color: "#000" }}>
                      {new Date(
                        currentBooking.check_out_date,
                      ).toLocaleDateString("vi-VN")}
                    </b>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tiền phòng:{" "}
                    <b style={{ color: "#000" }}>
                      {parseFloat(currentBooking.total_amount).toLocaleString()}{" "}
                      đ
                    </b>
                  </Typography>
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      bgcolor: "#fff3e0",
                      borderRadius: "4px",
                      border: "1px solid #ffe0b2",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="warning.main"
                      fontWeight="bold"
                    >
                      SỐ TIỀN ĐÃ CỌC/THANH TOÁN:
                    </Typography>
                    <Typography
                      variant="h6"
                      color="warning.main"
                      fontWeight="bold"
                    >
                      {parseFloat(
                        currentBooking.deposit_amount || 0,
                      ).toLocaleString()}{" "}
                      đ
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={7}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "4px",
                    border: `1px solid ${COLORS.border}`,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
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
                      color="#1565c0"
                    >
                      Hóa Đơn Dịch Vụ (Folio)
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddShoppingCartIcon />}
                      onClick={() => setAddServiceDialog(true)}
                      sx={{ borderRadius: "4px", textTransform: "none" }}
                    >
                      Thêm DV
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <List sx={{ flexGrow: 1, overflow: "auto", maxHeight: 200 }}>
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
                      folioData.map((item, index) => (
                        <ListItem
                          key={index}
                          disablePadding
                          sx={{
                            mb: 1.5,
                            bgcolor:
                              item.status === "Pending"
                                ? "#fffde7"
                                : "transparent",
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight="bold">
                                {item.services_name ||
                                  item.service_name ||
                                  "Dịch vụ"}{" "}
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
                              >
                                {item.status === "Pending"
                                  ? "⏳ Khách đang chờ..."
                                  : "✅ Đã phục vụ"}
                              </Typography>
                            }
                          />
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Typography fontWeight="bold" variant="body2">
                              {parseFloat(item.total_price).toLocaleString()}đ
                            </Typography>
                            {item.status === "Pending" && (
                              <Tooltip
                                title="Xác nhận đã mang lên phòng"
                                placement="top"
                              >
                                <IconButton
                                  color="success"
                                  size="small"
                                  onClick={() => handleMarkAsDelivered(item.id)}
                                  sx={{
                                    border: "1px solid #4caf50",
                                    bgcolor: "#e8f5e9",
                                  }}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </ListItem>
                      ))
                    )}
                  </List>

                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        Tổng Bill Hiện Tại:
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (Đã cộng cả tiền phòng)
                      </Typography>
                    </Box>
                    <Typography
                      variant="h5"
                      color="error.main"
                      fontWeight="bold"
                    >
                      {totalFolioAmount.toLocaleString()} đ
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
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
              onClick={() => setChangeRoomDialog(true)}
              sx={buttonStyle}
            >
              Nâng cấp / Đổi phòng
            </Button>
            <Button
              variant="contained"
              color="success"
              disableElevation
              startIcon={<ReceiptLongIcon />}
              disabled={!currentBooking}
              sx={buttonStyle}
              onClick={() => {
                setConfirmDialog({
                  open: true,
                  title: "Xác nhận Check-out",
                  message: `Thu đủ ${totalFolioAmount.toLocaleString()}đ và Check-out?`,
                  confirmColor: "success",
                  onConfirm: async () => {
                    try {
                      // 1. Gọi API Check-out
                      await BookingService.checkOutBooking(currentBooking.id);
                      setSnackbar({
                        open: true,
                        message: "Check-out thành công!",
                        severity: "success",
                      });

                      // 2. Kích hoạt tải PDF hóa đơn (Sửa lỗi số 3 - không in được hóa đơn ở sơ đồ phòng)
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

                      // 3. Đóng popup và làm mới
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
        PaperProps={{ sx: { borderRadius: "4px" } }}
      >
        <DialogTitle
          sx={{ fontWeight: "bold", bgcolor: COLORS.primary, color: "white" }}
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
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
          <Button
            onClick={() => setAddServiceDialog(false)}
            sx={buttonStyle}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            disableElevation
            sx={{ ...buttonStyle, bgcolor: COLORS.primary }}
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
        PaperProps={{ sx: { borderRadius: "4px" } }}
      >
        <DialogTitle
          sx={{ fontWeight: "bold", bgcolor: "#9c27b0", color: "white" }}
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
            disableElevation
            sx={buttonStyle}
            onClick={async () => {
              try {
                await BookingService.changeRoom(
                  currentBooking.id,
                  selectedNewRoom,
                );
                setSnackbar({
                  open: true,
                  message: "Đổi phòng thành công!",
                  severity: "success",
                });
                setChangeRoomDialog(false);
                setOccupiedDialog({ open: false, room: null });
                fetchRoomsOnly();
              } catch (error) {
                setSnackbar({
                  open: true,
                  message: "Lỗi: " + error,
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
