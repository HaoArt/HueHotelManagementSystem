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
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RoomServiceIcon from "@mui/icons-material/RoomService";

import ServiceService from "../../services/serviceService";

const COLORS = {
  primary: "#5e35b1",
  teal: "#009688",
  navy: "#0b1b3f",
  orange: "#e65100",
  error: "#d32f2f",
  border: "#e0e0e0",
  bgLight: "#f4f6f8",
  textMain: "#1a1a1a",
};

const glassCardSx = {
  p: { xs: 2.25, sm: 2.75, md: 3 },
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
    service_type: "Immediate",
    is_surchargeable: 0,
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
        service_type: service.service_type || "Immediate",
        is_surchargeable: service.is_surchargeable || 0,
      });
      setDialog({ open: true, isEdit: true, serviceId: service.id });
    } else {
      setFormData({
        name: "",
        price: "",
        description: "",
        service_type: "Immediate",
        is_surchargeable: 0,
      });
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
    borderRadius: 1,
    boxShadow: "none",
    textTransform: "none",
    fontWeight: 700,
    px: 2.25,
    py: 1,
  };
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1,
      bgcolor: "rgba(255,255,255,0.9)",
    },
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
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "flex-start" },
          justifyContent: "space-between",
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 2.5, sm: 3, md: 4 },
          flexWrap: "wrap",
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
            Quản Lý Dịch Vụ
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Thiết lập các dịch vụ đi kèm như ăn uống, spa, giặt ủi...
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Chip
            label={`${services.length} dịch vụ`}
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
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disableElevation
            sx={{
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              boxShadow: "0 10px 22px rgba(11, 27, 63, 0.24)",
              borderRadius: 1,
              px: 2.25,
              py: 1,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": {
                boxShadow: "0 14px 26px rgba(11, 27, 63, 0.32)",
              },
            }}
          >
            Thêm dịch vụ
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "4px" }}>
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          ...glassCardSx,
          p: 0,
          border: "1px solid rgba(11,27,63,0.12)",
          bgcolor: "rgba(255,255,255,0.86)",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 700 }}>
          <TableHead
            sx={{
              background:
                "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
            }}
          >
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  width: "80px",
                  color: "white",
                  letterSpacing: "0.03em",
                }}
              >
                ID
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "0.03em",
                }}
              >
                TÊN DỊCH VỤ
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "0.03em",
                }}
              >
                GIÁ TIỀN
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "0.03em",
                }}
              >
                MÔ TẢ
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  textAlign: "right",
                  color: "white",
                  letterSpacing: "0.03em",
                }}
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
                          bgcolor: "rgba(11,27,63,0.07)",
                          borderRadius: 1,
                          display: "flex",
                          border: "1px solid rgba(11,27,63,0.1)",
                        }}
                      >
                        <RoomServiceIcon
                          sx={{ color: COLORS.primary, fontSize: 20 }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={COLORS.textMain}
                        >
                          {svc.name}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip
                            label={
                              svc.service_type === "Immediate"
                                ? "Dùng ngay"
                                : "Đặt trước"
                            }
                            size="small"
                            sx={{
                              fontSize: "0.7rem",
                              height: "20px",
                              bgcolor:
                                svc.service_type === "Immediate"
                                  ? "#f5f5f5"
                                  : "#e3f2fd",
                              color:
                                svc.service_type === "Immediate"
                                  ? "#616161"
                                  : "#1976d2",
                              fontWeight: "bold",
                            }}
                          />
                          {svc.is_surchargeable === 1 && (
                            <Chip
                              label="Phụ thu Lễ"
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                height: "20px",
                                bgcolor: "#fff3e0",
                                color: "#ed6c02",
                                fontWeight: "bold",
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="error.main"
                      sx={{ letterSpacing: "0.01em" }}
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
                            bgcolor: "rgba(0, 150, 136, 0.11)",
                            borderRadius: 1,
                            border: "1px solid rgba(0,150,136,0.2)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "rgba(0,150,136,0.18)",
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
                          onClick={() => handleDelete(svc.id, svc.name)}
                          sx={{
                            color: COLORS.error,
                            bgcolor: "rgba(211, 47, 47, 0.1)",
                            borderRadius: 1,
                            border: "1px solid rgba(211,47,47,0.2)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "rgba(211,47,47,0.18)",
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

      {/* Thêm dịch vụ*/}
      <Dialog
        disableScrollLock={true}
        open={dialog.open}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            border: "1px solid rgba(11,27,63,0.12)",
            boxShadow: "0 22px 44px rgba(11, 27, 63, 0.22)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            bgcolor: COLORS.navy,
            color: "white",
            letterSpacing: "0.01em",
          }}
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
          {/* THÊM 2 Ô CẤU HÌNH LOẠI DỊCH VỤ VÀ PHỤ THU */}
          <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Loại hình vận hành</InputLabel>
              <Select
                value={formData.service_type}
                label="Loại hình vận hành"
                onChange={(e) =>
                  setFormData({ ...formData, service_type: e.target.value })
                }
                sx={inputStyle}
              >
                <MenuItem value="Immediate">
                  Dùng ngay (Đồ uống, Ăn vặt...)
                </MenuItem>
                <MenuItem value="PreOrder">
                  Đặt trước (Thuê xe, Ăn sáng...)
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Chính sách Lễ/Tết</InputLabel>
              <Select
                value={formData.is_surchargeable}
                label="Chính sách Lễ/Tết"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_surchargeable: parseInt(e.target.value),
                  })
                }
                sx={inputStyle}
              >
                <MenuItem value={0}>Không phụ thu</MenuItem>
                <MenuItem value={1}>Có áp dụng phụ thu</MenuItem>
              </Select>
            </FormControl>
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
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              "&:hover": {
                boxShadow: "0 10px 20px rgba(11,27,63,0.22)",
              },
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
      <Dialog
        disableScrollLock={true}
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({
            open: false,
            title: "",
            message: "",
            onConfirm: null,
          })
        }
        PaperProps={{
          sx: {
            borderRadius: 1,
            minWidth: 350,
            border: "1px solid rgba(11,27,63,0.12)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: COLORS.error }}>
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
    </Box>
  );
};

export default AdminServicesPage;
