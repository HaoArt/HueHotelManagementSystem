/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Chip,
  Divider,
  Snackbar,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import HotelIcon from "@mui/icons-material/Hotel";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CancelIcon from "@mui/icons-material/Cancel";

import RoomService from "../../services/roomService";
import RoomTypeService from "../../services/roomTypeService";

// Đồng bộ Theme Colors với các trang Admin khác
const COLORS = {
  primary: "#5e35b1", // Tím chủ đạo
  headerBg: "#5e35b1", // Nền Header bảng và Dialog
  teal: "#009688", // Màu Tab, Nút bấm
  orange: "#e65100", // Màu Nút bấm nổi bật
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
  textMain: "#1a1a1a",
};

const AdminRoomSettingsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States quản lý thông báo Snackbar & Confirm Dialog
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
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);

  // --- STATE QUẢN LÝ ẢNH UPLOAD ---
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Dialog States - Hạng Phòng
  const [typeDialog, setTypeDialog] = useState({
    open: false,
    isEdit: false,
    id: null,
  });
  const [typeForm, setTypeForm] = useState({
    type_name: "",
    base_price: "",
    capacity: 2,
    description: "",
    area: "",
  });

  // Dialog States - Phòng
  const [roomDialog, setRoomDialog] = useState({
    open: false,
    isEdit: false,
    id: null,
  });
  const [roomForm, setRoomForm] = useState({
    room_number: "",
    room_type_id: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTypes, resRooms] = await Promise.all([
        RoomTypeService.getAllRoomTypes(),
        RoomService.getRooms(),
      ]);
      setRoomTypes(resTypes.data || resTypes);
      setRooms(resRooms.data || resRooms);
    } catch (err) {
      // Cập nhật: Trích xuất thông báo lỗi an toàn để tránh crash React
      setError(
        err.response?.data?.message || err.message || "Lỗi khi tải dữ liệu",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS CHO ẢNH ---
  const handleImageChange = (e) => {
    if (e.target.files) {
      setSelectedImages((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleRemoveExistingImage = (imageToRemove) => {
    setImagesToDelete((prev) => [...prev, imageToRemove.public_id]);
    setExistingImages((prev) =>
      prev.filter((img) => img.public_id !== imageToRemove.public_id),
    );
  };

  // --- QUẢN LÝ HẠNG PHÒNG ---
  const handleOpenTypeDialog = (type = null) => {
    setSelectedImages([]);
    setExistingImages([]);
    setImagesToDelete([]);
    if (type) {
      setTypeForm({
        type_name: type.type_name,
        base_price: type.base_price,
        capacity: type.capacity,
        description: type.description || "",
        area: type.area || "",
      });
      setExistingImages(type.images || []);
      setTypeDialog({ open: true, isEdit: true, id: type.id });
    } else {
      setTypeForm({
        type_name: "",
        base_price: "",
        capacity: 2,
        description: "",
        area: "",
      });
      setTypeDialog({ open: true, isEdit: false, id: null });
    }
  };

  const handleSubmitType = async () => {
    if (!typeForm.type_name || !typeForm.base_price) {
      return setSnackbar({
        open: true,
        message: "Vui lòng điền đủ thông tin bắt buộc!",
        severity: "warning",
      });
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("type_name", typeForm.type_name);
      formData.append("base_price", typeForm.base_price);
      formData.append("capacity", typeForm.capacity);
      formData.append("description", typeForm.description || "");
      formData.append("area", typeForm.area || 0);

      if (typeDialog.isEdit) {
        selectedImages.forEach((file) => formData.append("images", file));
        formData.append("images_to_delete", JSON.stringify(imagesToDelete));
        await RoomTypeService.updateRoomType(typeDialog.id, formData);
        setSnackbar({
          open: true,
          message: "Cập nhật thông tin thành công!",
          severity: "success",
        });
      } else {
        selectedImages.forEach((file) => {
          formData.append("images", file);
        });
        await RoomTypeService.createRoomType(formData);
        setSnackbar({
          open: true,
          message: "Tạo hạng phòng và tải ảnh lên thành công!",
          severity: "success",
        });
      }
      setTypeDialog({ open: false, isEdit: false, id: null });
      fetchData();
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          "Lỗi tạo/cập nhật hạng phòng: " +
          (err.response?.data?.message || err.message || err),
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- QUẢN LÝ PHÒNG ---
  const handleOpenRoomDialog = (room = null) => {
    if (room) {
      setRoomForm({
        room_number: room.room_number,
        room_type_id: room.room_type_id,
      });
      setRoomDialog({ open: true, isEdit: true, id: room.id });
    } else {
      setRoomForm({ room_number: "", room_type_id: "" });
      setRoomDialog({ open: true, isEdit: false, id: null });
    }
  };

  const handleSubmitRoom = async () => {
    if (!roomForm.room_number || !roomForm.room_type_id) {
      return setSnackbar({
        open: true,
        message: "Vui lòng điền đủ thông tin!",
        severity: "warning",
      });
    }

    try {
      setIsSubmitting(true);
      if (roomDialog.isEdit) {
        await RoomService.updateRoom(roomDialog.id, roomForm);
        setSnackbar({
          open: true,
          message: "Cập nhật phòng thành công!",
          severity: "success",
        });
      } else {
        await RoomService.createRoom(roomForm);
        setSnackbar({
          open: true,
          message: "Thêm phòng thành công!",
          severity: "success",
        });
      }
      setRoomDialog({ open: false, isEdit: false, id: null });
      fetchData();
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          "Lỗi tạo/cập nhật phòng: " +
          (err.response?.data?.message || err.message || err),
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = (id, roomNum) => {
    setConfirmDialog({
      open: true,
      title: "Xác nhận xóa phòng",
      message: `Bạn có chắc chắn muốn xóa phòng số ${roomNum}? Thao tác này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await RoomService.deleteRoom(id);
          setSnackbar({
            open: true,
            message: "Xóa phòng thành công!",
            severity: "success",
          });
          fetchData();
        } catch (err) {
          setSnackbar({
            open: true,
            message:
              "Lỗi xóa phòng: " +
              (err.response?.data?.message || err.message || err),
            severity: "error",
          });
        } finally {
          setConfirmDialog({
            open: false,
            title: "",
            message: "",
            onConfirm: null,
          });
        }
      },
    });
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "Available":
        return (
          <Chip
            label="Sẵn sàng"
            sx={{
              bgcolor: "#e8f5e9",
              color: "#2e7d32",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
            size="small"
          />
        );
      case "Occupied":
        return (
          <Chip
            label="Đang sử dụng"
            sx={{
              bgcolor: "#e3f2fd",
              color: "#1976d2",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
            size="small"
          />
        );
      case "Maintenance":
        return (
          <Chip
            label="Bảo trì"
            sx={{
              bgcolor: "#ffebee",
              color: "#d32f2f",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
            size="small"
          />
        );
      default:
        return (
          <Chip label={status} size="small" sx={{ borderRadius: "4px" }} />
        );
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
          alignItems: "flex-start",
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
            sx={{ color: COLORS.textMain, letterSpacing: "-1px" }}
          >
            Thiết Lập Dữ Liệu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý hệ thống hạ tầng phòng nghỉ của khách sạn
          </Typography>
        </Box>

        <Box>
          {/* NÚT THAO TÁC HIỂN THỊ DỰA TRÊN TAB ĐANG CHỌN */}
          {tabValue === 0 && (
            <Button
              variant="contained"
              onClick={() => handleOpenTypeDialog()}
              startIcon={<AddIcon />}
              disableElevation
              sx={{
                bgcolor: COLORS.orange,
                "&:hover": { bgcolor: "#d84315" },
                fontWeight: "bold",
                borderRadius: "4px",
                px: 3,
                py: 1,
              }}
            >
              THÊM HẠNG PHÒNG
            </Button>
          )}
          {tabValue === 1 && (
            <Button
              variant="contained"
              onClick={() => handleOpenRoomDialog()}
              startIcon={<AddIcon />}
              disableElevation
              sx={{
                bgcolor: COLORS.teal,
                "&:hover": { bgcolor: "#00796b" },
                fontWeight: "bold",
                borderRadius: "4px",
                px: 3,
                py: 1,
              }}
            >
              THÊM SỐ PHÒNG
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "4px" }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: "4px",
          border: `1px solid ${COLORS.border}`,
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
        <Box
          sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f8f9fa" }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
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
            <Tab
              icon={<HotelIcon fontSize="small" />}
              iconPosition="start"
              label="Hạng Phòng"
            />
            <Tab
              icon={<MeetingRoomIcon fontSize="small" />}
              iconPosition="start"
              label="Danh Sách Số Phòng"
            />
          </Tabs>
        </Box>

        {/* TAB 1: ROOM TYPES */}
        {tabValue === 0 && (
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead sx={{ bgcolor: COLORS.headerBg }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Tên Hạng Phòng
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Giá Cơ Bản
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Diện tích
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Sức Chứa
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomTypes.map((type) => (
                  <TableRow
                    key={type.id}
                    hover
                    sx={{
                      "& td": { borderBottom: `1px solid ${COLORS.border}` },
                    }}
                  >
                    <TableCell fontWeight="bold">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {type.image_url ? (
                          <img
                            src={type.image_url}
                            alt={type.type_name}
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: "4px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: "4px",
                              bgcolor: "#f5f5f5",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <HotelIcon color="disabled" />
                          </Box>
                        )}
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={COLORS.textMain}
                        >
                          {type.type_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color="error.main"
                        fontWeight="bold"
                        variant="body2"
                      >
                        {parseFloat(type.base_price).toLocaleString("vi-VN")} đ
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {type.area ? `${type.area} m²` : "Chưa cập nhật"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {type.capacity} Người
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            onClick={() => handleOpenTypeDialog(type)}
                            sx={{
                              color: COLORS.teal,
                              bgcolor: "rgba(0, 150, 136, 0.1)",
                              borderRadius: "4px",
                            }}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            onClick={() =>
                              setSnackbar({
                                open: true,
                                message:
                                  "Chức năng xóa hạng phòng tạm khóa để bảo mật dữ liệu",
                                severity: "info",
                              })
                            }
                            sx={{
                              color: "#d32f2f",
                              bgcolor: "rgba(211, 47, 47, 0.1)",
                              borderRadius: "4px",
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {roomTypes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Chưa có dữ liệu hạng phòng.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 2: ROOMS */}
        {tabValue === 1 && (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead sx={{ bgcolor: COLORS.headerBg }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Số Phòng
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Thuộc Hạng Phòng
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Trạng thái hiện tại
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow
                    key={room.id}
                    hover
                    sx={{
                      "& td": { borderBottom: `1px solid ${COLORS.border}` },
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color={COLORS.textMain}
                      >
                        P.{room.room_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {room.type_name || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(room.status)}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Chỉnh sửa thông tin phòng">
                          <IconButton
                            onClick={() => handleOpenRoomDialog(room)}
                            sx={{
                              color: COLORS.teal,
                              bgcolor: "rgba(0, 150, 136, 0.1)",
                              borderRadius: "4px",
                            }}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa phòng">
                          <IconButton
                            onClick={() =>
                              handleDeleteRoom(room.id, room.room_number)
                            }
                            sx={{
                              color: "#d32f2f",
                              bgcolor: "rgba(211, 47, 47, 0.1)",
                              borderRadius: "4px",
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {rooms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Chưa có dữ liệu phòng.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* =============================================================== */}
      {/* DIALOG HẠNG PHÒNG (ĐÃ TÍCH HỢP FORM TẢI ẢNH) */}
      {/* =============================================================== */}
      <Dialog
        disableScrollLock={true}
        open={typeDialog.open}
        onClose={() => setTypeDialog({ open: false, isEdit: false, id: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "4px" } }}
      >
        <DialogTitle
          sx={{ bgcolor: COLORS.headerBg, color: "white", fontWeight: "bold" }}
        >
          {typeDialog.isEdit ? "Cập Nhật Hạng Phòng" : "Thêm Hạng Phòng Mới"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Tên Hạng (VD: Deluxe, Suite...)"
              fullWidth
              size="small"
              value={typeForm.type_name}
              onChange={(e) =>
                setTypeForm({ ...typeForm, type_name: e.target.value })
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
            />
            <TextField
              label="Giá tiền 1 đêm (VNĐ)"
              type="number"
              fullWidth
              size="small"
              value={typeForm.base_price}
              onChange={(e) =>
                setTypeForm({ ...typeForm, base_price: e.target.value })
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Diện tích (m²)"
                type="number"
                fullWidth
                size="small"
                value={typeForm.area}
                onChange={(e) =>
                  setTypeForm({ ...typeForm, area: e.target.value })
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
              />
              <TextField
                label="Sức chứa (Người)"
                type="number"
                fullWidth
                size="small"
                value={typeForm.capacity}
                onChange={(e) =>
                  setTypeForm({
                    ...typeForm,
                    capacity: parseInt(e.target.value),
                  })
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
              />
            </Stack>
            <TextField
              label="Mô tả tiện ích phòng"
              multiline
              rows={3}
              fullWidth
              value={typeForm.description}
              onChange={(e) =>
                setTypeForm({ ...typeForm, description: e.target.value })
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
            />

            {/* KHU VỰC TẢI ẢNH */}
            <Box
              sx={{
                p: 2,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "4px",
                bgcolor: "#fbfbfb",
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight="bold"
                gutterBottom
              >
                QUẢN LÝ HÌNH ẢNH
              </Typography>

              {typeDialog.isEdit && existingImages.length > 0 && (
                <>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 1, mb: 2, overflowX: "auto", pb: 1 }}
                  >
                    {existingImages.map((img, index) => (
                      <Box
                        key={img.public_id || index}
                        sx={{ position: "relative", flexShrink: 0 }}
                      >
                        <img
                          src={img.image_url}
                          alt="existing preview"
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: "4px",
                            border: `1px solid ${COLORS.border}`,
                          }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveExistingImage(img)}
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            bgcolor: "white",
                            border: `1px solid ${COLORS.border}`,
                            "&:hover": { bgcolor: "#ffebee" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<AddPhotoAlternateIcon />}
                sx={{
                  borderStyle: "dashed",
                  height: 40,
                  fontWeight: "bold",
                  borderRadius: "4px",
                  color: COLORS.teal,
                  borderColor: COLORS.teal,
                }}
              >
                CHỌN THÊM ẢNH
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>

              {selectedImages.length > 0 && (
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ mt: 2, overflowX: "auto", pb: 1 }}
                >
                  {selectedImages.map((file, index) => (
                    <Box
                      key={index}
                      sx={{ position: "relative", flexShrink: 0 }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: "4px",
                          border: `1px solid ${COLORS.border}`,
                        }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          bgcolor: "white",
                          border: `1px solid ${COLORS.border}`,
                          "&:hover": { bgcolor: "#ffebee" },
                        }}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
          <Button
            onClick={() =>
              setTypeDialog({ open: false, isEdit: false, id: null })
            }
            sx={{ borderRadius: "4px", color: "text.secondary" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitType}
            disableElevation
            sx={{
              borderRadius: "4px",
              fontWeight: "bold",
              bgcolor: COLORS.teal,
              "&:hover": { bgcolor: "#00796b" },
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "LƯU LẠI"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =============================================================== */}
      {/* DIALOG PHÒNG */}
      {/* =============================================================== */}
      <Dialog
        disableScrollLock={true}
        open={roomDialog.open}
        onClose={() => setRoomDialog({ open: false, isEdit: false, id: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "4px" } }}
      >
        <DialogTitle
          sx={{ bgcolor: COLORS.headerBg, color: "white", fontWeight: "bold" }}
        >
          {roomDialog.isEdit
            ? `Chỉnh Sửa Phòng ${roomForm.room_number}`
            : "Thêm Số Phòng Mới"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Số phòng (VD: 101, 502)"
              fullWidth
              size="small"
              value={roomForm.room_number}
              onChange={(e) =>
                setRoomForm({ ...roomForm, room_number: e.target.value })
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Chọn Hạng Phòng</InputLabel>
              <Select
                value={roomForm.room_type_id}
                label="Chọn Hạng Phòng"
                onChange={(e) =>
                  setRoomForm({ ...roomForm, room_type_id: e.target.value })
                }
                sx={{ borderRadius: "4px" }}
              >
                {roomTypes.map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.type_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
          <Button
            onClick={() =>
              setRoomDialog({ open: false, isEdit: false, id: null })
            }
            sx={{ borderRadius: "4px", color: "text.secondary" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitRoom}
            disableElevation
            sx={{
              borderRadius: "4px",
              fontWeight: "bold",
              bgcolor: COLORS.teal,
              "&:hover": { bgcolor: "#00796b" },
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : roomDialog.isEdit ? (
              "CẬP NHẬT"
            ) : (
              "TẠO PHÒNG"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DIALOG CHUNG CHO XÓA PHÒNG/V.V */}
      <Dialog
        disableScrollLock={true}
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        PaperProps={{ sx: { borderRadius: "4px", minWidth: 350 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "error.main" }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="inherit"
            sx={{
              borderRadius: "4px",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color="error"
            disableElevation
            sx={{
              borderRadius: "4px",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR THÔNG BÁO CHUNG */}
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

export default AdminRoomSettingsPage;
