/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/AdminAuditLogs.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AuditService from "../../services/auditService";

// Đồng bộ Theme Colors
const COLORS = {
  primary: "#5e35b1", // Tím chủ đạo
  headerBg: "#5e35b1", // Nền Header bảng
  teal: "#009688",
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
  textMain: "#1a1a1a",
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await AuditService.getLogs();
      setLogs(res.data || res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Cập nhật thẻ Action Chip theo phong cách Flat Design, bo góc 4px
  const getActionChip = (action) => {
    switch (action) {
      case "WALK_IN_CHECKIN":
        return (
          <Chip
            label="Tạo đơn Walk-in"
            sx={{
              bgcolor: "#e8f5e9",
              color: "#2e7d32",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
            size="small"
          />
        );
      case "CANCEL_BOOKING":
        return (
          <Chip
            label="Hủy đơn đặt phòng"
            sx={{
              bgcolor: "#ffebee",
              color: "#c62828",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
            size="small"
          />
        );
      case "UPDATE_ROOM":
        return (
          <Chip
            label="Cập nhật phòng"
            sx={{
              bgcolor: "#e3f2fd",
              color: "#1976d2",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
            size="small"
          />
        );
      case "CHANGE_ROOM":
        return (
          <Chip
            label="Đổi phòng"
            sx={{
              bgcolor: "#fff3e0",
              color: "#ed6c02",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
            size="small"
          />
        );
      case "CHECK_OUT":
        return (
          <Chip
            label="Check-out"
            sx={{
              bgcolor: "#f5f5f5",
              color: "#616161",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
            size="small"
          />
        );
      default:
        return (
          <Chip label={action} sx={{ borderRadius: "4px" }} size="small" />
        );
    }
  };

  // Helper function để parse JSON từ Database (old_value, new_value)
  const renderJsonData = (dataStr) => {
    if (!dataStr)
      return (
        <Typography variant="caption" color="text.secondary" fontStyle="italic">
          Không có dữ liệu
        </Typography>
      );
    try {
      // Thử parse xem có phải Object JSON không
      const parsed =
        typeof dataStr === "string" ? JSON.parse(dataStr) : dataStr;

      return Object.entries(parsed).map(([key, value]) => (
        <Box key={key} sx={{ fontSize: "0.8rem", mb: 0.5 }}>
          <b style={{ color: COLORS.primary }}>{key}:</b> {String(value)}
        </Box>
      ));
    } catch (e) {
      // Nếu không phải JSON thì in ra chuỗi bình thường
      return <Typography variant="caption">{dataStr}</Typography>;
    }
  };

  if (loading && logs.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: COLORS.teal }} />
      </Box>
    );
  }

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
            gutterBottom
          >
            Nhật Ký Hệ Thống (Audit Logs)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi 100 thao tác cập nhật gần nhất của Nhân viên và Khách hàng.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchLogs}
          disableElevation
          sx={{
            bgcolor: COLORS.teal,
            "&:hover": { bgcolor: "#00796b" },
            fontWeight: "bold",
            borderRadius: "4px",
            px: 3,
            py: 1,
            textTransform: "none",
          }}
        >
          LÀM MỚI
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "4px" }}>
          {error}
        </Alert>
      )}

      {/* BẢNG DỮ LIỆU */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "4px",
          border: `1px solid ${COLORS.border}`,
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
        <TableContainer sx={{ maxHeight: "75vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: COLORS.headerBg,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Thời gian
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: COLORS.headerBg,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Người thao tác
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: COLORS.headerBg,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Hành động
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: COLORS.headerBg,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  ID Đối tượng
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: COLORS.headerBg,
                    color: "white",
                    fontWeight: "bold",
                    width: "20%",
                  }}
                >
                  Dữ liệu cũ
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: COLORS.headerBg,
                    color: "white",
                    fontWeight: "bold",
                    width: "20%",
                  }}
                >
                  Dữ liệu mới
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: COLORS.headerBg,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  IP / Thiết bị
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Chưa có dữ liệu nhật ký nào.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      "& td": { borderBottom: `1px solid ${COLORS.border}` },
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={COLORS.textMain}
                      >
                        {new Date(log.created_at).toLocaleDateString("vi-VN")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.created_at).toLocaleTimeString("vi-VN")}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={COLORS.textMain}
                      >
                        {log.full_name || "Khách ẩn danh"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.email || `ID: ${log.user_id}`}
                      </Typography>
                    </TableCell>

                    <TableCell>{getActionChip(log.action)}</TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={COLORS.primary}
                      >
                        #{log.target_id}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ bgcolor: "rgba(211, 47, 47, 0.03)" }}>
                      {renderJsonData(log.old_value)}
                    </TableCell>

                    <TableCell sx={{ bgcolor: "rgba(46, 125, 50, 0.03)" }}>
                      {renderJsonData(log.new_value)}
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontFamily: "monospace",
                          bgcolor: "#f5f5f5",
                          px: 1,
                          py: 0.5,
                          borderRadius: "4px",
                        }}
                      >
                        {log.ip_address || "N/A"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminAuditLogs;
