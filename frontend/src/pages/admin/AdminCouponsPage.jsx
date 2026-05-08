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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import CouponService from "../../services/couponService";

const COLORS = {
  primary: "#5e35b1",
  headerBg: "#5e35b1",
  teal: "#009688",
  orange: "#e65100",
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
  textMain: "#1a1a1a",
};

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialog, setDialog] = useState({
    open: false,
    isEdit: false,
    couponId: null,
  });
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "Percentage",
    discount_value: "",
    min_order_value: 0,
    max_discount_value: "",
    expiry_date: "",
    usage_limit: 100,
    status: "Active",
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

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await CouponService.getAllCoupons();
      setCoupons(res.data || res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenDialog = (coupon = null) => {
    if (coupon) {
      setFormData({
        ...coupon,
        expiry_date: coupon.expiry_date
          ? new Date(coupon.expiry_date).toISOString().split("T")[0]
          : "",
        max_discount_value: coupon.max_discount_value || "",
      });
      setDialog({ open: true, isEdit: true, couponId: coupon.id });
    } else {
      setFormData({
        code: "",
        description: "",
        discount_type: "Percentage",
        discount_value: "",
        min_order_value: 0,
        max_discount_value: "",
        expiry_date: "",
        usage_limit: 100,
        status: "Active",
      });
      setDialog({ open: true, isEdit: false, couponId: null });
    }
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.discount_value) {
      return setSnackbar({
        open: true,
        message: "Vui lòng nhập Mã và Giá trị giảm!",
        severity: "warning",
      });
    }

    try {
      setIsSubmitting(true);
      if (dialog.isEdit) {
        await CouponService.updateCoupon(dialog.couponId, formData);
        setSnackbar({
          open: true,
          message: "Cập nhật thành công!",
          severity: "success",
        });
      } else {
        await CouponService.createCoupon(formData);
        setSnackbar({
          open: true,
          message: "Thêm mã thành công!",
          severity: "success",
        });
      }
      setDialog({ open: false, isEdit: false, couponId: null });
      fetchCoupons();
    } catch (err) {
      setSnackbar({ open: true, message: err, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id, code) => {
    setConfirmDialog({
      open: true,
      title: "Xóa Mã Giảm Giá",
      message: `Bạn có chắc chắn muốn xóa mã "${code}"?`,
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          await CouponService.deleteCoupon(id);
          setSnackbar({
            open: true,
            message: "Xóa thành công!",
            severity: "success",
          });
          fetchCoupons();
        } catch (err) {
          setSnackbar({ open: true, message: err, severity: "error" });
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
            Quản Lý Khuyến Mãi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thiết lập các mã giảm giá (Coupon) cho khách hàng.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
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
          TẠO MÃ MỚI
        </Button>
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
          border: `1px solid ${COLORS.border}`,
          overflowX: "auto",
          borderRadius: "4px",
          bgcolor: "white",
        }}
      >
        <Table sx={{ minWidth: 900 }}>
          <TableHead sx={{ bgcolor: COLORS.headerBg }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Mã Coupon
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Giá trị giảm
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Thời hạn & Lượt dùng
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}
              >
                Trạng thái
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", textAlign: "right", color: "white" }}
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    Chưa có mã khuyến mãi nào.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{
                    "& td": { borderBottom: `1px solid ${COLORS.border}` },
                  }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <LocalOfferIcon sx={{ color: COLORS.orange }} />
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color={COLORS.textMain}
                        >
                          {item.code}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {item.discount_type === "Percentage"
                        ? `${item.discount_value}%`
                        : `${parseFloat(item.discount_value).toLocaleString()} đ`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Đơn tối thiểu:{" "}
                      {parseFloat(item.min_order_value).toLocaleString()}đ
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      HSD:{" "}
                      {item.expiry_date
                        ? new Date(item.expiry_date).toLocaleDateString("vi-VN")
                        : "Không thời hạn"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Đã dùng: {item.used_count} / {item.usage_limit}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.status}
                      size="small"
                      color={item.status === "Active" ? "success" : "default"}
                      sx={{ fontWeight: "bold", borderRadius: "4px" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          onClick={() => handleOpenDialog(item)}
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
                          onClick={() => handleDelete(item.id, item.code)}
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

      {/* DIALOG THÊM / SỬA */}
      <Dialog
        disableScrollLock={true}
        open={dialog.open}
        onClose={() =>
          setDialog({ open: false, isEdit: false, couponId: null })
        }
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "4px" } }}
      >
        <DialogTitle
          sx={{ fontWeight: "bold", bgcolor: COLORS.headerBg, color: "white" }}
        >
          {dialog.isEdit ? "Cập Nhật Mã Giảm Giá" : "Tạo Mã Giảm Giá Mới"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mã Coupon (VD: SUMMER2026)"
                fullWidth
                size="small"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                required
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" sx={inputStyle}>
                <InputLabel>Loại giảm giá</InputLabel>
                <Select
                  value={formData.discount_type}
                  label="Loại giảm giá"
                  onChange={(e) =>
                    setFormData({ ...formData, discount_type: e.target.value })
                  }
                >
                  <MenuItem value="Percentage">
                    Giảm theo phần trăm (%)
                  </MenuItem>
                  <MenuItem value="Fixed">Giảm số tiền cố định (VNĐ)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Giá trị giảm"
                type="number"
                fullWidth
                size="small"
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({ ...formData, discount_value: e.target.value })
                }
                required
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Giảm tối đa (VNĐ) - Dành cho loại %"
                type="number"
                fullWidth
                size="small"
                value={formData.max_discount_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_discount_value: e.target.value,
                  })
                }
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Giá trị đơn hàng tối thiểu (VNĐ)"
                type="number"
                fullWidth
                size="small"
                value={formData.min_order_value}
                onChange={(e) =>
                  setFormData({ ...formData, min_order_value: e.target.value })
                }
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ngày hết hạn"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                value={formData.expiry_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiry_date: e.target.value })
                }
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Giới hạn số lần sử dụng"
                type="number"
                fullWidth
                size="small"
                value={formData.usage_limit}
                onChange={(e) =>
                  setFormData({ ...formData, usage_limit: e.target.value })
                }
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" sx={inputStyle}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng thái"
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <MenuItem value="Active">Đang hoạt động</MenuItem>
                  <MenuItem value="Inactive">Tạm khóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Mô tả chi tiết"
                multiline
                rows={2}
                fullWidth
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                sx={inputStyle}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
          <Button
            onClick={() =>
              setDialog({ open: false, isEdit: false, couponId: null })
            }
            sx={{
              borderRadius: "4px",
              color: "text.secondary",
              fontWeight: "bold",
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disableElevation
            disabled={isSubmitting}
            sx={{
              borderRadius: "4px",
              bgcolor: COLORS.teal,
              "&:hover": { bgcolor: "#00796b" },
              fontWeight: "bold",
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : dialog.isEdit ? (
              "LƯU THAY ĐỔI"
            ) : (
              "TẠO MÃ"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG XÁC NHẬN XÓA */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({
            open: false,
            title: "",
            message: "",
            onConfirm: null,
          })
        }
        PaperProps={{ sx: { borderRadius: "4px" } }}
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
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color="error"
            disableElevation
            disabled={isSubmitting}
          >
            Xác nhận xóa
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

export default AdminCouponsPage;
