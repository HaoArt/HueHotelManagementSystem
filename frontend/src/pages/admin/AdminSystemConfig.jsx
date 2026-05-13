/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import ConfigService from "../../services/configService"; // Dùng service đã sửa

const COLORS = {
  primary: "#5e35b1",
  teal: "#009688",
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
};

const AdminSystemConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await ConfigService.getConfigs();
      setConfigs(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: String(err), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleChange = (key, newValue) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.config_key === key ? { ...c, config_value: newValue } : c,
      ),
    );
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const settings = configs.map((c) => ({
        key: c.config_key,
        value: c.config_value,
      }));
      await ConfigService.updateConfigs(settings);
      setSnackbar({
        open: true,
        message: "Cấu hình hệ thống đã được cập nhật!",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Lỗi: " + String(err),
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );

  return (
    <Box sx={{ p: 4, bgcolor: COLORS.bgLight, minHeight: "100vh" }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{ color: "#1a1a1a", letterSpacing: "-1px" }}
          >
            Cấu Hình Hệ Thống
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý thông tin vận hành, quy định đặt phòng và chính sách cọc.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={isSubmitting}
          sx={{
            bgcolor: COLORS.teal,
            "&:hover": { bgcolor: "#00796b" },
            fontWeight: "bold",
            px: 4,
            py: 1.2,
            boxShadow: "none",
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "LƯU THAY ĐỔI"
          )}
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: "8px",
          border: `1px solid ${COLORS.border}`,
          bgcolor: "white",
        }}
      >
        <Stack spacing={4}>
          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                color: COLORS.primary,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SettingsSuggestIcon /> Thông tin cơ bản & Chính sách
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={4}>
              {configs.map((config) => (
                <Grid item xs={12} md={6} key={config.id}>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{ mb: 1, color: "#333" }}
                  >
                    {config.display_name}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={config.config_value}
                    onChange={(e) =>
                      handleChange(config.config_key, e.target.value)
                    }
                    placeholder={`Nhập ${config.display_name}...`}
                    helperText={config.description}
                    InputProps={{
                      // Tự động thêm đơn vị % nếu là trường đặt cọc
                      endAdornment:
                        config.config_key === "deposit_percent" ? (
                          <InputAdornment position="end">%</InputAdornment>
                        ) : null,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          variant="filled"
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSystemConfig;
