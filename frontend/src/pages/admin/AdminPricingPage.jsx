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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SurchargeService from "../../services/surchargeService";

const COLORS = {
  primary: "#5e35b1",
  teal: "#009688",
  orange: "#e65100",
  bgLight: "#f4f6f8",
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
   <Box sx={{ p: 4, bgcolor: COLORS.bgLight, minHeight: "100vh", overflowX: "hidden", pb: 10 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Quản Lý Giá Theo Mùa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tăng giá (+) dịp Lễ Tết hoặc Giảm giá (-) mùa vắng khách. Mọi thay
            đổi đều được ghi lưu vào Audit Log.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: COLORS.teal, fontWeight: "bold" }}
        >
          THÊM CẤU HÌNH GIÁ
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{overflowX: "auto"}}>
          <Table>
            <TableHead sx={{ bgcolor: COLORS.primary }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Mùa / Sự kiện
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Thời gian áp dụng
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Biến động giá (%)
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
              {rules.map((row) => (
                <TableRow key={row.id}>
                  <TableCell fontWeight="bold">{row.event_name}</TableCell>
                  <TableCell>
                    {new Date(row.start_date).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(row.end_date).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    {parseFloat(row.surcharge_percent) > 0 ? (
                      <Chip
                        icon={<TrendingUpIcon />}
                        label={`Tăng +${parseFloat(row.surcharge_percent)}%`}
                        color="error"
                        variant="outlined"
                        sx={{ fontWeight: "bold" }}
                      />
                    ) : (
                      <Chip
                        icon={<TrendingDownIcon />}
                        label={`Giảm ${parseFloat(row.surcharge_percent)}%`}
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: "bold" }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(row)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(row.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ ...dialog, open: false })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontWeight: "bold", bgcolor: COLORS.primary, color: "white" }}
        >
          {dialog.isEdit ? "Cập nhật Giá theo Mùa" : "Thêm Giá theo Mùa"}
        </DialogTitle>
        <DialogContent
          sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Tên Sự kiện / Mùa (VD: Mùa Hè 2026, Lễ 2/9)"
            fullWidth
            value={formData.event_name}
            onChange={(e) =>
              setFormData({ ...formData, event_name: e.target.value })
            }
            sx={{ mt: 1 }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              type="date"
              label="Từ ngày"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
            />
            <TextField
              type="date"
              label="Đến ngày"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
            />
          </Box>
          <TextField
            type="number"
            label="Biến động phần trăm (%)"
            placeholder="Nhập 20 để tăng 20%, hoặc -10 để giảm 10%"
            fullWidth
            value={formData.surcharge_percent}
            onChange={(e) =>
              setFormData({ ...formData, surcharge_percent: e.target.value })
            }
            helperText="Nhập số dương (vd: 20) để TĂNG giá. Nhập số âm (vd: -15) để GIẢM giá."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialog({ ...dialog, open: false })}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "LƯU LẠI"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPricingPage;
