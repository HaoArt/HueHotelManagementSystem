/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
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
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Stack,
  Tooltip,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SurchargeService from "../../services/surchargeService";

// ĐỒNG BỘ BẢNG MÀU CHUẨN TỪ MẪU CỦA THẦY
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

// HIỆU ỨNG GLASSMORPHISM SANG TRỌNG
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

const AdminPricingPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [dialog, setDialog] = useState({
    open: false,
    isEdit: false,
    ruleId: null,
  });
  const [formData, setFormData] = useState({
    event_name: "",
    start_date: "",
    end_date: "",
    surcharge_percent: "",
  });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await SurchargeService.getAll();
      setRules(res.data || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Lỗi tải dữ liệu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenDialog = (rule = null) => {
    if (rule) {
      setFormData({
        event_name: rule.event_name,
        start_date: rule.start_date.split("T")[0],
        end_date: rule.end_date.split("T")[0],
        surcharge_percent: rule.surcharge_percent,
      });
      setDialog({ open: true, isEdit: true, ruleId: rule.id });
    } else {
      setFormData({
        event_name: "",
        start_date: "",
        end_date: "",
        surcharge_percent: "",
      });
      setDialog({ open: true, isEdit: false, ruleId: null });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (dialog.isEdit) {
        await SurchargeService.update(dialog.ruleId, formData);
        setSnackbar({
          open: true,
          message: "Cập nhật thành công! Hệ thống đã ghi Log.",
          severity: "success",
        });
      } else {
        await SurchargeService.create(formData);
        setSnackbar({
          open: true,
          message: "Tạo cấu hình giá thành công! Hệ thống đã ghi Log.",
          severity: "success",
        });
      }
      setDialog({ open: false, isEdit: false, ruleId: null });
      fetchRules();
    } catch (err) {
      setSnackbar({ open: true, message: "Lỗi hệ thống", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa cấu hình này? (Hành động sẽ được ghi Log)",
      )
    ) {
      try {
        await SurchargeService.delete(id);
        setSnackbar({
          open: true,
          message: "Đã xóa và ghi Log!",
          severity: "success",
        });
        fetchRules();
      } catch (err) {
        setSnackbar({ open: true, message: "Lỗi khi xóa", severity: "error" });
      }
    }
  };

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
      {/* HEADER ĐỒNG BỘ */}
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
            Quản Lý Giá Theo Mùa
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Thiết lập tự động Tăng giá (+) dịp Lễ Tết hoặc Giảm giá (-) mùa vắng khách. Mọi thay đổi đều được lưu Audit Log.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
          <Chip
            label={`${rules.length} cấu hình`}
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
              background: "linear-gradient(135deg, #e65100 0%, #ff8a3d 100%)", // Nút cam chuẩn
              fontWeight: 700,
              borderRadius: 1,
              textTransform: "none",
              px: 2.25,
              py: 1,
              boxShadow: "0 10px 20px rgba(230, 81, 0, 0.24)",
              "&:hover": { boxShadow: "0 14px 24px rgba(230,81,0,0.32)" },
            }}
          >
            THÊM CẤU HÌNH GIÁ
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <CircularProgress sx={{ color: COLORS.teal }} />
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            ...glassCardSx,
            p: 0,
            border: "1px solid rgba(11,27,63,0.12)",
            overflow: "hidden",
          }}
        >
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
                    Mùa / Sự kiện
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                    Thời gian áp dụng
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 700, letterSpacing: "0.03em" }}>
                    Biến động giá (%)
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
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        Không có cấu hình giá nào được thiết lập.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        transition: "background-color 0.2s ease",
                        "& td": {
                          borderBottom: "1px solid rgba(11,27,63,0.08)",
                          py: 2,
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
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              bgcolor: "rgba(11,27,63,0.05)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: COLORS.navy,
                            }}
                          >
                            <LocalOfferIcon fontSize="small" />
                          </Box>
                          <Typography variant="body1" fontWeight="800" color={COLORS.navy}>
                            {row.event_name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600" color={COLORS.textMain}>
                          {new Date(row.start_date).toLocaleDateString("vi-VN")} &nbsp;&rarr;&nbsp;{" "}
                          {new Date(row.end_date).toLocaleDateString("vi-VN")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {parseFloat(row.surcharge_percent) > 0 ? (
                          <Chip
                            icon={<TrendingUpIcon fontSize="small" />}
                            label={`Tăng +${parseFloat(row.surcharge_percent)}%`}
                            size="small"
                            sx={{
                              bgcolor: "rgba(211, 47, 47, 0.1)",
                              color: COLORS.error,
                              fontWeight: 800,
                              borderRadius: 1,
                              border: "none",
                              px: 1,
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<TrendingDownIcon fontSize="small" />}
                            label={`Giảm ${Math.abs(parseFloat(row.surcharge_percent))}%`}
                            size="small"
                            sx={{
                              bgcolor: "rgba(46, 125, 50, 0.1)",
                              color: "#2e7d32",
                              fontWeight: 800,
                              borderRadius: 1,
                              border: "none",
                              px: 1,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              onClick={() => handleOpenDialog(row)}
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
                          <Tooltip title="Xóa cấu hình">
                            <IconButton
                              onClick={() => handleDelete(row.id)}
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
        </Paper>
      )}

      {/* DIALOG THÊM / CẬP NHẬT */}
      <Dialog
        disableScrollLock={true}
        open={dialog.open}
        onClose={() => setDialog({ ...dialog, open: false })}
        maxWidth="sm"
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
            background: dialog.isEdit 
                ? "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)" 
                : "linear-gradient(135deg, #e65100 0%, #ff8a3d 100%)", // Cam cho Thêm mới, Teal/Navy cho Cập nhật
            color: "white",
            fontWeight: 800,
            textAlign: "center",
            py: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {dialog.isEdit ? "CẬP NHẬT GIÁ THEO MÙA" : "THIẾT LẬP GIÁ THEO MÙA"}
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
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Tên Sự kiện / Mùa (VD: Mùa Hè 2026, Lễ 2/9)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.event_name}
                  onChange={(e) =>
                    setFormData({ ...formData, event_name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                 <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Từ ngày
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  fullWidth
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                 <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Đến ngày
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  fullWidth
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                 <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Biến động phần trăm (%)
                </Typography>
                <TextField
                  type="number"
                  placeholder="VD: 20 hoặc -10"
                  size="small"
                  fullWidth
                  value={formData.surcharge_percent}
                  onChange={(e) =>
                    setFormData({ ...formData, surcharge_percent: e.target.value })
                  }
                  helperText="Nhập số dương (vd: 20) để TĂNG giá. Nhập số âm (vd: -15) để GIẢM giá."
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
          <Button onClick={() => setDialog({ ...dialog, open: false })} color="inherit" sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1 }}>
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{
              fontWeight: 700,
              background: dialog.isEdit 
                ? "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)" 
                : "linear-gradient(135deg, #e65100 0%, #ff8a3d 100%)",
              px: 4,
              py: 1,
              borderRadius: 1,
              textTransform: "none",
              boxShadow: "0 10px 20px rgba(11,27,63,0.15)",
              "&:hover": { boxShadow: "0 12px 24px rgba(11,27,63,0.25)" },
            }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "LƯU CẤU HÌNH"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%", borderRadius: 1 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPricingPage;