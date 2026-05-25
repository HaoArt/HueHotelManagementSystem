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
  navy: "#0b1b3f",
  teal: "#009688",
  orange: "#e65100",
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
  transition:
    "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 18px 36px rgba(11, 27, 63, 0.15)",
    borderColor: "rgba(0, 150, 136, 0.35)",
  },
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
        expiry_date: new Date().toISOString().split("T")[0],
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

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1,
      bgcolor: "rgba(255,255,255,0.95)",
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
            Quản Lý Khuyến Mãi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Thiết lập các mã giảm giá (Coupon) cho khách hàng.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Chip
            label={`${coupons.length} coupon`}
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
            Tạo mã mới
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
          border: "1px solid rgba(11,27,63,0.12)",
          overflowX: "auto",
          p: 0,
          bgcolor: "rgba(255,255,255,0.86)",
        }}
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
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "0.03em",
                }}
              >
                Mã Coupon
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "0.03em",
                }}
              >
                Giá trị giảm
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "0.03em",
                }}
              >
                Thời hạn & Lượt dùng
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "0.03em",
                  textAlign: "center",
                }}
              >
                Trạng thái
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  textAlign: "right",
                  color: "white",
                }}
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
                      sx={{ fontWeight: 700, borderRadius: 1 }}
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
                          onClick={() => handleDelete(item.id, item.code)}
                          sx={{
                            color: "#d32f2f",
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

      <Dialog
        disableScrollLock={true}
        open={dialog.open}
        onClose={() =>
          setDialog({ open: false, isEdit: false, couponId: null })
        }
        maxWidth="md"
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
          sx={{ fontWeight: 800, bgcolor: COLORS.navy, color: "white" }}
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
                fullWidth
                size="small"
                value={formData.expiry_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiry_date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                sx={{
                  ...inputStyle,
                  "& .MuiInputBase-root": { whiteSpace: "nowrap" },
                }}
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
              borderRadius: 1,
              color: "text.secondary",
              fontWeight: 700,
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
              borderRadius: 1,
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              "&:hover": { boxShadow: "0 12px 24px rgba(11,27,63,0.3)" },
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "0 8px 18px rgba(11,27,63,0.22)",
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
        PaperProps={{
          sx: {
            borderRadius: 1,
            border: "1px solid rgba(11,27,63,0.12)",
            boxShadow: "0 22px 44px rgba(11, 27, 63, 0.22)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#d32f2f" }}>
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
            sx={{ borderRadius: 1, fontWeight: 700, textTransform: "none" }}
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
          sx={{ width: "100%", borderRadius: 1 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCouponsPage;
