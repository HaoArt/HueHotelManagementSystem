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
import ConfigService from "../../services/configService"; 

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
        message: "Cấu hình hệ thống đã được cập nhật thành công!",
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
      {/* HEADER ĐỒNG BỘ MỚI */}
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
            Cấu Hình Hệ Thống
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Quản lý thông tin vận hành, quy định đặt phòng và chính sách cọc.
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSubmitting}
            disableElevation
            sx={{
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)", // Nút gradient đồng bộ
              fontWeight: 700,
              borderRadius: 1,
              textTransform: "none",
              px: 3,
              py: 1.2,
              boxShadow: "0 10px 20px rgba(11,27,63,0.2)",
              "&:hover": { boxShadow: "0 12px 24px rgba(11,27,63,0.28)" },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "LƯU THAY ĐỔI"
            )}
          </Button>
        </Box>
      </Box>

      {/* CONTAINER FORM GLASSMORPHISM */}
      <Paper
        elevation={0}
        sx={{
          ...glassCardSx,
          p: { xs: 3, md: 4 },
          border: "1px solid rgba(11,27,63,0.12)",
        }}
      >
        <Stack spacing={4}>
          <Box>
            <Typography
              variant="h6"
              fontWeight="800"
              sx={{
                color: COLORS.navy,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                letterSpacing: "-0.02em"
              }}
            >
              <SettingsSuggestIcon sx={{ color: COLORS.teal }} /> 
              Thông tin cơ bản & Chính sách
            </Typography>
            <Divider sx={{ mb: 4, borderColor: "rgba(11,27,63,0.1)" }} />

            <Grid container spacing={4}>
              {configs.map((config) => (
                <Grid item xs={12} md={6} key={config.id}>
                  <Typography
                    variant="body2"
                    fontWeight="700"
                    sx={{ mb: 1, color: COLORS.navy }}
                  >
                    {config.display_name}
                  </Typography>
                  <TextField
                    fullWidth
                    size="medium"
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
                          <InputAdornment position="end">
                            <Typography fontWeight="bold" color="text.secondary">%</Typography>
                          </InputAdornment>
                        ) : null,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255,255,255,0.9)", // Nền trắng nhẹ cho ô input
                        borderRadius: 1,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "#fff"
                        },
                        "&.Mui-focused": {
                          bgcolor: "#fff",
                          boxShadow: "0 0 0 2px rgba(0, 150, 136, 0.2)" // Viền xanh teal khi focus
                        }
                      }
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
          sx={{ width: "100%", borderRadius: 1 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSystemConfig;