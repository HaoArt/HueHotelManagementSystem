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
  Grid,
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
  transition: "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 18px 36px rgba(11, 27, 63, 0.15)",
    borderColor: "rgba(0, 150, 136, 0.35)",
  },
};

const AdminRoomSettingsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

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

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = [];
      let hasLargeFile = false;

      files.forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          hasLargeFile = true;
        } else {
          validFiles.push(file);
        }
      });

      if (hasLargeFile) {
        setSnackbar({
          open: true,
          message: "Một số ảnh quá lớn (>10MB) đã bị hệ thống loại bỏ!",
          severity: "warning",
        });
      }

      if (validFiles.length > 0) {
        setSelectedImages((prev) => [...prev, ...validFiles]);
      }
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
      confirmColor: "error",
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
            confirmColor: "primary"
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
              fontWeight: 700,
              borderRadius: 1,
              border: "none"
            }}
            size="small"
          />
        );
      case "Occupied":
        return (
          <Chip
            label="Đang sử dụng"
            sx={{
              bgcolor: "rgba(94, 53, 177, 0.1)",
              color: COLORS.primary,
              fontWeight: 700,
              borderRadius: 1,
              border: "none"
            }}
            size="small"
          />
        );
      case "Dirty":
        return (
          <Chip
            label="Chưa dọn dẹp"
            sx={{
              bgcolor: "rgba(237, 108, 2, 0.1)",
              color: COLORS.orange,
              fontWeight: 700,
              borderRadius: 1,
              border: "none"
            }}
            size="small"
          />
        );
      case "Maintenance":
        return (
          <Chip
            label="Bảo trì"
            sx={{
              bgcolor: "white",
              color: COLORS.error,
              fontWeight: 700,
              borderRadius: 1,
              border: `1px solid ${COLORS.error}`
            }}
            size="small"
          />
        );
      default:
        return (
          <Chip label={status} size="small" sx={{ borderRadius: 1 }} />
        );
    }
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
      {/* Header */}
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
            Thiết Lập Dữ Liệu
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Quản lý hệ thống hạ tầng phòng nghỉ của khách sạn
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
          {tabValue === 0 && (
            <Button
              variant="contained"
              onClick={() => handleOpenTypeDialog()}
              startIcon={<AddIcon />}
              disableElevation
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
              THÊM SỐ PHÒNG
            </Button>
          )}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
          {error}
        </Alert>
      )}

    
      <Paper
        elevation={0}
        sx={{
          ...glassCardSx,
          p: 0,
          border: "1px solid rgba(11,27,63,0.12)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{ borderBottom: 1, borderColor: "rgba(11,27,63,0.1)", bgcolor: "rgba(255,255,255,0.84)" }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
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
              icon={<HotelIcon fontSize="small" sx={{ mr: 0.5 }} />}
              iconPosition="start"
              label="Hạng Phòng"
            />
            <Tab
              icon={<MeetingRoomIcon fontSize="small" sx={{ mr: 0.5 }} />}
              iconPosition="start"
              label="Danh Sách Số Phòng"
            />
          </Tabs>
        </Box>

        {/* loại phòng */}
        {tabValue === 0 && (
          <TableContainer sx={{ bgcolor: "rgba(255,255,255,0.72)", overflowX: "auto" }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead
                sx={{
                  background:
                    "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
                }}
              >
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                    Tên Hạng Phòng
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                    Giá Cơ Bản
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                    Diện tích
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                    Sức Chứa
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        Chưa có dữ liệu hạng phòng.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  roomTypes.map((type) => (
                    <TableRow
                      key={type.id}
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
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          {type.image_url ? (
                            <img
                              src={type.image_url}
                              alt={type.type_name}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: "8px",
                                objectFit: "cover",
                                border: "1px solid rgba(11,27,63,0.1)"
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                borderRadius: "8px",
                                bgcolor: "rgba(11,27,63,0.05)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px dashed rgba(11,27,63,0.2)"
                              }}
                            >
                              <HotelIcon sx={{ color: "rgba(11,27,63,0.3)" }} />
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
                        <Typography variant="body2" fontWeight="500">
                          {type.area ? `${type.area} m²` : "---"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
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
                                borderRadius: 1,
                                border: "1px solid rgba(0, 150, 136, 0.2)",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "rgba(0, 150, 136, 0.18)",
                                  transform: "translateY(-1px)",
                                },
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
                                borderRadius: 1,
                                border: "1px solid rgba(211, 47, 47, 0.2)",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "rgba(211, 47, 47, 0.18)",
                                  transform: "translateY(-1px)",
                                },
                              }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
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
        )}

        {/* Phòng */}
        {tabValue === 1 && (
          <TableContainer sx={{ bgcolor: "rgba(255,255,255,0.72)", overflowX: "auto" }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead
                sx={{
                  background:
                    "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
                }}
              >
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                    Số Phòng
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                    Thuộc Hạng Phòng
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                    Trạng thái hiện tại
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        Chưa có dữ liệu phòng.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room) => (
                    <TableRow
                      key={room.id}
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
                      <TableCell>
                        <Typography
                          variant="subtitle1"
                          fontWeight="900"
                          color={COLORS.navy}
                        >
                          P.{room.room_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600" color="text.secondary">
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
                                borderRadius: 1,
                                border: "1px solid rgba(0, 150, 136, 0.2)",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "rgba(0, 150, 136, 0.18)",
                                  transform: "translateY(-1px)",
                                },
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
                                borderRadius: 1,
                                border: "1px solid rgba(211, 47, 47, 0.2)",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "rgba(211, 47, 47, 0.18)",
                                  transform: "translateY(-1px)",
                                },
                              }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
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
        )}
      </Paper>

      <Dialog
        disableScrollLock={true}
        open={typeDialog.open}
        onClose={() => setTypeDialog({ open: false, isEdit: false, id: null })}
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
            background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
            color: "white",
            fontWeight: 800,
            textAlign: "center",
            py: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {typeDialog.isEdit ? "CẬP NHẬT HẠNG PHÒNG" : "THÊM HẠNG PHÒNG MỚI"}
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
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Tên Hạng (VD: Deluxe, Suite...) (*)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={typeForm.type_name}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, type_name: e.target.value })
                  }
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Giá tiền 1 đêm (VNĐ) (*)
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  value={typeForm.base_price}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, base_price: e.target.value })
                  }
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                 <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Diện tích (m²)
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  value={typeForm.area}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, area: e.target.value })
                  }
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Sức chứa (Người)
                </Typography>
                <TextField
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
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Mô tả tiện ích phòng
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={typeForm.description}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, description: e.target.value })
                  }
                />
              </Box>
            </Box>

            <Box
              sx={{
                p: 3,
                mt: 4,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 1,
                bgcolor: "#fbfbfb",
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight="800"
                gutterBottom
              >
                QUẢN LÝ HÌNH ẢNH
              </Typography>

              {typeDialog.isEdit && existingImages.length > 0 && (
                <>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 2, mb: 2, overflowX: "auto", pb: 1 }}
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
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: `1px solid ${COLORS.border}`,
                          }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveExistingImage(img)}
                          sx={{
                            position: "absolute",
                            top: -10,
                            right: -10,
                            bgcolor: "white",
                            border: `1px solid ${COLORS.border}`,
                            "&:hover": { bgcolor: "#ffebee" },
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                  <Divider sx={{ my: 3 }} />
                </>
              )}

              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<AddPhotoAlternateIcon />}
                sx={{
                  borderStyle: "dashed",
                  borderWidth: 2,
                  height: 50,
                  fontWeight: "bold",
                  borderRadius: 1,
                  color: COLORS.teal,
                  borderColor: "rgba(0, 150, 136, 0.4)",
                  bgcolor: "rgba(0, 150, 136, 0.02)",
                  "&:hover": {
                    borderColor: COLORS.teal,
                    bgcolor: "rgba(0, 150, 136, 0.05)"
                  }
                }}
              >
                BẤM VÀO ĐÂY ĐỂ CHỌN THÊM ẢNH TỪ MÁY TÍNH
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
                  sx={{ mt: 3, overflowX: "auto", pb: 1 }}
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
                          width: 100,
                          height: 100,
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: `2px solid ${COLORS.teal}`,
                        }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: "absolute",
                          top: -10,
                          right: -10,
                          bgcolor: "white",
                          border: `1px solid ${COLORS.border}`,
                          "&:hover": { bgcolor: "#ffebee" },
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                        }}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
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
            onClick={() =>
              setTypeDialog({ open: false, isEdit: false, id: null })
            }
            color="inherit"
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1 }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitType}
            disableElevation
            disabled={isSubmitting}
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              px: 4,
              py: 1,
              borderRadius: 1,
              textTransform: "none",
              boxShadow: "0 10px 20px rgba(11,27,63,0.2)",
              "&:hover": { boxShadow: "0 12px 24px rgba(11,27,63,0.28)" },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "LƯU LẠI"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        disableScrollLock={true}
        open={roomDialog.open}
        onClose={() => setRoomDialog({ open: false, isEdit: false, id: null })}
        maxWidth="xs"
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
            background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
            color: "white",
            fontWeight: 800,
            textAlign: "center",
            py: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {roomDialog.isEdit
            ? `CHỈNH SỬA PHÒNG ${roomForm.room_number}`
            : "THÊM SỐ PHÒNG MỚI"}
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 2 }}>
           <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 1,
              border: "1px solid #e2e8f0",
              bgcolor: "white",
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Số phòng (VD: 101, 502) (*)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={roomForm.room_number}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, room_number: e.target.value })
                  }
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Chọn Hạng Phòng (*)
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={roomForm.room_type_id}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, room_type_id: e.target.value })
                    }
                  >
                    {roomTypes.map((rt) => (
                      <MenuItem key={rt.id} value={rt.id}>
                        {rt.type_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
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
            onClick={() =>
              setRoomDialog({ open: false, isEdit: false, id: null })
            }
            color="inherit"
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1 }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitRoom}
            disableElevation
            disabled={isSubmitting}
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              px: 3,
              py: 1,
              borderRadius: 1,
              textTransform: "none",
              boxShadow: "0 10px 20px rgba(11,27,63,0.2)",
              "&:hover": { boxShadow: "0 12px 24px rgba(11,27,63,0.28)" },
            }}
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
            color: confirmDialog.confirmColor === "error" ? "error.main" : `${confirmDialog.confirmColor}.main`,
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
            sx={{ fontWeight: 700, textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color={confirmDialog.confirmColor || "error"}
            disableElevation
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1 }}
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
          sx={{ width: "100%", borderRadius: 1 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminRoomSettingsPage;