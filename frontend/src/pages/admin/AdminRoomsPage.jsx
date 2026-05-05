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

// Services
import RoomService from "../../services/roomService";
import BookingService from "../../services/bookingService";
import FolioService from "../../services/folioService";
import ServiceService from "../../services/serviceService";

// Đồng bộ Theme Colors
const COLORS = {
  primary: "#5e35b1", // Tím chủ đạo
  primaryDark: "#4527a0",
  teal: "#009688",
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
  textMain: "#1a1a1a",
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

  // --- STATE QUẢN LÝ KHÁCH IN-HOUSE ---
  const [occupiedDialog, setOccupiedDialog] = useState({
    open: false,
    room: null,
  });
  const [loadingOccupied, setLoadingOccupied] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [folioData, setFolioData] = useState([]);
  const [totalFolioAmount, setTotalFolioAmount] = useState(0);

  // --- STATE THÊM DỊCH VỤ ---
  const [addServiceDialog, setAddServiceDialog] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [serviceQty, setServiceQty] = useState(1);
  const [changeRoomDialog, setChangeRoomDialog] = useState(false);
  const [selectedNewRoom, setSelectedNewRoom] = useState("");

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
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const fetchRoomsOnly = async () => {
    try {
      const res = await RoomService.getRooms();
      setRooms(res.data || res);
    } catch (err) {
      alert("Lỗi làm mới: " + err);
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
      fetchRoomsOnly();
    } catch (err) {
      alert(err);
    }
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

        const folioRes = await FolioService.getFolio(booking.id);

        const servicesUsed = folioRes.data?.services || [];
        setFolioData(servicesUsed);

        const totalService = servicesUsed.reduce(
          (sum, item) => sum + parseFloat(item.total_price),
          0,
        );
        setTotalFolioAmount(parseFloat(booking.total_amount) + totalService);
      } catch (err) {
        alert("Lỗi tải thông tin phòng: " + err);
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
      return alert("Vui lòng chọn dịch vụ và số lượng hợp lệ!");
    try {
      await FolioService.orderService({
        booking_id: currentBooking.id,
        service_id: selectedServiceId,
        quantity: serviceQty,
      });
      setAddServiceDialog(false);
      setSelectedServiceId("");
      setServiceQty(1);

      const folioRes = await FolioService.getFolio(currentBooking.id);

      const servicesUsed = folioRes.data?.services || [];
      setFolioData(servicesUsed);
      const totalService = servicesUsed.reduce(
        (sum, item) => sum + parseFloat(item.total_price),
        0,
      );
      setTotalFolioAmount(
        parseFloat(currentBooking.total_amount) + totalService,
      );
      alert("Đã thêm dịch vụ thành công!");
    } catch (error) {
      alert(error);
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
    <Box sx={{ p: 4, bgcolor: COLORS.bgLight, minHeight: "100vh" }}>
      {/* HEADER & NÚT BẤM (CẬP NHẬT GIAO DIỆN NHỎ GỌN & CĂN CHỈNH) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
          mb: 4,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ mr: 2 }}>
          <Typography
            variant="h4"
            fontWeight="900"
            color={COLORS.textMain}
            sx={{ letterSpacing: "-1px" }}
          >
            Sơ Đồ Phòng Khách
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {filteredRooms.length} phòng trong hệ thống
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* ToggleButtonGroup đã được ép height và padding nhỏ lại */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            sx={{
              bgcolor: "white",
              borderRadius: "4px",
              border: `1px solid ${COLORS.border}`,
              "& .MuiToggleButton-root": {
                py: 0.5,
                px: 2,
                textTransform: "none",
                borderRadius: "4px",
                borderColor: "transparent",
              },
              "& .Mui-selected": {
                bgcolor: "rgba(0, 150, 136, 0.08) !important",
                color: `${COLORS.teal} !important`,
                fontWeight: "bold",
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

          {/* Button LÀM MỚI cũng đồng bộ kích thước */}
          <Button
            variant="contained"
            onClick={fetchRoomsOnly}
            disableElevation
            sx={{
              ...buttonStyle,
              bgcolor: COLORS.teal,
              "&:hover": { bgcolor: "#00796b" },
              px: 3,
              py: 0.8, // Giảm padding dọc để nút thon lại
            }}
          >
            LÀM MỚI
          </Button>
        </Box>
      </Box>

      {/* FILTER BAR */}
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
                <MenuItem value="All">Tất cả trạng thái</MenuItem>
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
                    {type === "All" ? "Tất cả loại phòng" : type}
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

      {/* RENDER DỮ LIỆU */}
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
                    return (
                      <Tooltip
                        title={`Nhấn để quản lý phòng ${room.room_number}`}
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
                            borderRadius: "4px", // Giảm độ bo góc
                            border: `1px solid ${config.border}`,
                            position: "relative",
                            cursor: "pointer",
                            overflow: "hidden",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: `0 4px 12px ${config.color}30`,
                            },
                          }}
                        >
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

                          <Box
                            sx={{
                              position: "absolute",
                              opacity: 0.05,
                              transform: "scale(4)",
                              bottom: -10,
                              left: -10,
                              color: "rgba(0,0,0,0.5)",
                            }}
                          >
                            <HotelIcon />
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
                              bgcolor: config.color,
                              color: "white",
                              textAlign: "center",
                              py: 0.5,
                              zIndex: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "bold",
                                fontSize: "0.7rem",
                              }}
                            >
                              {config.label.toUpperCase()}
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
        /* ================= CHẾ ĐỘ BẢNG (LIST VIEW) ================= */
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: "4px", border: `1px solid ${COLORS.border}` }}
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
                        {config.icon}
                        <Typography variant="caption" fontWeight="bold">
                          {config.label}
                        </Typography>
                      </Box>
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
                  <CheckCircleIcon color="success" /> Sẵn sàng đón khách
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

      {/* =============================================================== */}
      {/* DIALOG KHÁCH IN-HOUSE */}
      {/* =============================================================== */}
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
                    Trả phòng (Dự kiến):{" "}
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
                    Tiền phòng (Tổng):{" "}
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

                  <List sx={{ flexGrow: 1, overflow: "auto", maxHeight: 150 }}>
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
                        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                          <ListItemText
                            primary={`${item.services_name || item.service_name || "Dịch vụ"} (x${item.quantity})`}
                            secondary={new Date(item.created_at).toLocaleString(
                              "vi-VN",
                            )}
                          />
                          <Typography fontWeight="bold">
                            {parseFloat(item.total_price).toLocaleString()}đ
                          </Typography>
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
              Không lấy được thông tin khách hàng. Vui lòng kiểm tra lại!
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
              onClick={async () => {
                if (
                  window.confirm(
                    `Xác nhận khách thanh toán đủ số tiền ${totalFolioAmount.toLocaleString()}đ và Check-out?`,
                  )
                ) {
                  try {
                    await BookingService.checkOutBooking(currentBooking.id);
                    alert("Check-out thành công!");
                    setOccupiedDialog({ open: false, room: null });
                    fetchRoomsOnly();
                  } catch (error) {
                    alert(error);
                  }
                }
              }}
            >
              Thanh Toán & Check-out
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* DIALOG CON: THÊM DỊCH VỤ VÀO PHÒNG */}
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
          Thêm Dịch Vụ Mới
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
                  {svc.name} -{" "}
                  <span style={{ color: "#ed6c02", marginLeft: "5px" }}>
                    {parseFloat(svc.price).toLocaleString()}đ
                  </span>
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
            XÁC NHẬN THÊM
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG CON 2: ĐỔI PHÒNG */}
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
            Hệ thống chỉ hiển thị các phòng đang ở trạng thái{" "}
            <b>Sẵn sàng (Available)</b>.
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
              {rooms.filter((r) => r.status === "Available").length === 0 && (
                <MenuItem disabled>Không có phòng trống nào!</MenuItem>
              )}
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
              if (!selectedNewRoom) return alert("Vui lòng chọn 1 phòng mới!");
              try {
                await BookingService.changeRoom(
                  currentBooking.id,
                  selectedNewRoom,
                );
                alert("Đổi phòng thành công!");
                setChangeRoomDialog(false);
                setOccupiedDialog({ open: false, room: null });
                fetchRoomsOnly();
              } catch (error) {
                alert(error);
              }
            }}
          >
            XÁC NHẬN ĐỔI
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminRoomsPage;
