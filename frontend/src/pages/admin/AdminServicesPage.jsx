/* eslint-disable react-hooks/set-state-in-effect */
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
  Tooltip,
  Snackbar,
} from "@mui/material";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RoomServiceIcon from "@mui/icons-material/RoomService";

import ServiceService from "../../services/serviceService";

// Đồng bộ Theme Colors
const COLORS = {
  primary: "#5e35b1", // Tím chủ đạo
  headerBg: "#5e35b1", // Nền Header bảng và Dialog
  teal: "#009688", // Nút Thêm mới, Icon Edit
  orange: "#e65100",
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
  textMain: "#1a1a1a",
};

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialog, setDialog] = useState({
    open: false,
    isEdit: false,
    serviceId: null,
  });
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });

  // --- STATE QUẢN LÝ SNACKBAR & CONFIRM DIALOG ---
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

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await ServiceService.getAllServices();
      setServices(res.data || res);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi lấy danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenDialog = (service = null) => {
    if (service) {
      setFormData({
        name: service.name,
        price: service.price,
        description: service.description || "",
      });
      setDialog({ open: true, isEdit: true, serviceId: service.id });
    } else {
      setFormData({ name: "", price: "", description: "" });
      setDialog({ open: true, isEdit: false, serviceId: null });
    }
  };

  const handleCloseDialog = () => {
    setDialog({ open: false, isEdit: false, serviceId: null });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      return setSnackbar({
        open: true,
        message: "Vui lòng nhập tên và giá dịch vụ!",
        severity: "warning",
      });
    }

    try {
      setIsSubmitting(true);
      if (dialog.isEdit) {
        await ServiceService.updateService(dialog.serviceId, formData);
        setSnackbar({
          open: true,
          message: "Cập nhật thành công!",
          severity: "success",
        });
      } else {
        await ServiceService.createService(formData);
        setSnackbar({
          open: true,
          message: "Thêm dịch vụ thành công!",
          severity: "success",
        });
      }
      handleCloseDialog();
      fetchServices();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Có lỗi xảy ra!",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id, name) => {
    setConfirmDialog({
      open: true,
      title: "Xóa Dịch Vụ",
      message: `Bạn có chắc chắn muốn xóa dịch vụ "${name}"? Thao tác này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          await ServiceService.deleteService(id);
          setSnackbar({
            open: true,
            message: "Xóa thành công!",
            severity: "success",
          });
          fetchServices();
        } catch (err) {
          setSnackbar({
            open: true,
            message: err.response?.data?.message || "Lỗi khi xóa dịch vụ",
            severity: "error",
          });
        } finally {
          setIsSubmitting(false);
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

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: COLORS.teal }} />
      </Box>
    );

  const buttonStyle = {
    borderRadius: "4px",
    boxShadow: "none",
    textTransform: "none",
    fontWeight: "bold",
  };
  const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: "4px" } };

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
      {/* HEADER */}
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
            Quản Lý Dịch Vụ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thiết lập các dịch vụ đi kèm như ăn uống, spa, giặt ủi...
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
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
          THÊM DỊCH VỤ
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "4px" }}>
          {error}
        </Alert>
      )}

      {/* BẢNG DỮ LIỆU */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: "4px",
          bgcolor: "white",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ bgcolor: COLORS.headerBg }}>
            <TableRow>
              <TableCell
                sx={{ fontWeight: "bold", width: "80px", color: "white" }}
              >
                ID
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                TÊN DỊCH VỤ
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                GIÁ TIỀN
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                MÔ TẢ
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", textAlign: "right", color: "white" }}
              >
                THAO TÁC
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    Không có dịch vụ nào.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              services.map((svc) => (
                <TableRow
                  key={svc.id}
                  hover
                  sx={{
                    "& td": { borderBottom: `1px solid ${COLORS.border}` },
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="text.secondary"
                    >
                      #{svc.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: "#f5f5f5",
                          borderRadius: "4px",
                          display: "flex",
                        }}
                      >
                        <RoomServiceIcon
                          sx={{ color: COLORS.primary, fontSize: 20 }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={COLORS.textMain}
                      >
                        {svc.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {parseFloat(svc.price).toLocaleString()} đ
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ color: "text.secondary", maxWidth: "300px" }}
                  >
                    <Typography variant="body2" noWrap>
                      {svc.description || "—"}
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
                          onClick={() => handleOpenDialog(svc)}
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
                          onClick={() => handleDelete(svc.id, svc.name)}
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* =============================================================== */}
      {/* DIALOG THÊM / SỬA DỊCH VỤ */}
      {/* =============================================================== */}
      <Dialog
        disableScrollLock={true} // Ngăn lỗi đơ trang
        open={dialog.open}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "4px" } }}
      >
        <DialogTitle
          sx={{ fontWeight: "bold", bgcolor: COLORS.headerBg, color: "white" }}
        >
          {dialog.isEdit ? "Cập Nhật Dịch Vụ" : "Thêm Dịch Vụ Mới"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Tên dịch vụ (VD: Thuê xe máy, Giặt ủi...)"
              fullWidth
              size="small"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              sx={inputStyle}
            />
            <TextField
              label="Giá tiền (VNĐ)"
              type="number"
              fullWidth
              size="small"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
              sx={inputStyle}
            />
            <TextField
              label="Mô tả chi tiết"
              multiline
              rows={3}
              fullWidth
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              sx={inputStyle}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ ...buttonStyle, color: "text.secondary" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disableElevation
            sx={{
              ...buttonStyle,
              bgcolor: COLORS.teal,
              "&:hover": { bgcolor: "#00796b" },
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : dialog.isEdit ? (
              "LƯU THAY ĐỔI"
            ) : (
              "TẠO DỊCH VỤ"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =============================================================== */}
      {/* DIALOG XÁC NHẬN XÓA (THAY THẾ WINDOW.CONFIRM) */}
      {/* =============================================================== */}
      <Dialog
        disableScrollLock={true} // Ngăn lỗi đơ trang
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({
            open: false,
            title: "",
            message: "",
            onConfirm: null,
          })
        }
        PaperProps={{ sx: { borderRadius: "4px", minWidth: 350 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#d32f2f" }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() =>
              setConfirmDialog({
                open: false,
                title: "",
                message: "",
                onConfirm: null,
              })
            }
            color="inherit"
            sx={buttonStyle}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color="error"
            disableElevation
            sx={buttonStyle}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Xác nhận xóa"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =============================================================== */}
      {/* SNACKBAR THÔNG BÁO (THAY THẾ ALERT) */}
      {/* =============================================================== */}
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
          sx={{ width: "100%", borderRadius: "4px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminServicesPage;
