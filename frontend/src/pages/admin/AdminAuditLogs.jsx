/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from "react";
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
  TablePagination,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AuditService from "../../services/auditService";

const COLORS = {
  primary: "#5e35b1",
  navy: "#0b1b3f",
  teal: "#009688",
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

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  const paginatedLogs = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return logs.slice(startIndex, startIndex + rowsPerPage);
  }, [logs, page, rowsPerPage]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionChip = (action) => {
    switch (action) {
      case "WALK_IN_CHECKIN":
        return (
          <Chip
            label="Tạo đơn Walk-in"
            sx={{
              bgcolor: "#e8f5e9",
              color: "#2e7d32",
              fontWeight: 700,
              borderRadius: 1,
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
              fontWeight: 700,
              borderRadius: 1,
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
              fontWeight: 700,
              borderRadius: 1,
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
              fontWeight: 700,
              borderRadius: 1,
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
              fontWeight: 700,
              borderRadius: 1,
            }}
            size="small"
          />
        );
      default:
        return <Chip label={action} sx={{ borderRadius: 1 }} size="small" />;
    }
  };

  const renderJsonData = (dataStr) => {
    if (!dataStr)
      return (
        <Typography variant="caption" color="text.secondary" fontStyle="italic">
          Không có dữ liệu
        </Typography>
      );
    try {
      const parsed =
        typeof dataStr === "string" ? JSON.parse(dataStr) : dataStr;

      return Object.entries(parsed).map(([key, value]) => (
        <Box key={key} sx={{ fontSize: "0.8rem", mb: 0.5 }}>
          <b style={{ color: COLORS.primary }}>{key}:</b> {String(value)}
        </Box>
      ));
    } catch (e) {
      return <Typography variant="caption">{dataStr}</Typography>;
    }
  };

  if (loading && logs.length === 0) {
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
  }

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
        <Box sx={{ maxWidth: { xs: "100%", md: "70%" } }}>
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{
              color: COLORS.navy,
              letterSpacing: "-0.03em",
              fontSize: { xs: "1.65rem", sm: "2rem", md: "2.2rem" },
            }}
            gutterBottom
          >
            Nhật Ký Hệ Thống (Audit Logs)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Theo dõi 100 thao tác cập nhật gần nhất của Nhân viên và Khách hàng.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Chip
            label={`${logs.length} bản ghi`}
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
            startIcon={<RefreshIcon />}
            onClick={fetchLogs}
            disableElevation
            sx={{
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              boxShadow: "0 10px 22px rgba(11, 27, 63, 0.24)",
              fontWeight: 700,
              borderRadius: 1,
              px: 2.25,
              py: 1,
              textTransform: "none",
              "&:hover": { boxShadow: "0 14px 26px rgba(11, 27, 63, 0.32)" },
            }}
          >
            Làm mới
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "4px" }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          ...glassCardSx,
          border: "1px solid rgba(11,27,63,0.12)",
          overflow: "hidden",
          bgcolor: "rgba(255,255,255,0.86)",
        }}
      >
        <TableContainer sx={{}}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    background:
                      "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  Thời gian
                </TableCell>
                <TableCell
                  sx={{
                    background:
                      "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  Người thao tác
                </TableCell>
                <TableCell
                  sx={{
                    background:
                      "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  Hành động
                </TableCell>
                <TableCell
                  sx={{
                    background:
                      "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  ID Đối tượng
                </TableCell>
                <TableCell
                  sx={{
                    background:
                      "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    width: "20%",
                  }}
                >
                  Dữ liệu cũ
                </TableCell>
                <TableCell
                  sx={{
                    background:
                      "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    width: "20%",
                  }}
                >
                  Dữ liệu mới
                </TableCell>
                <TableCell
                  sx={{
                    background:
                      "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
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
                paginatedLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      transition: "background-color 0.2s ease",
                      "& td": {
                        borderBottom: "1px solid rgba(11,27,63,0.08)",
                        py: 1.5,
                      },
                      "&:nth-of-type(even)": {
                        bgcolor: "rgba(11,27,63,0.015)",
                      },
                      "&:hover": {
                        bgcolor: "rgba(0,150,136,0.06)",
                      },
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
                          bgcolor: "rgba(11,27,63,0.06)",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
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
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={logs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số dòng hiển thị:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trong số ${count}`
          }
          sx={{
            borderTop: "1px solid rgba(11,27,63,0.08)",
            bgcolor: "rgba(255, 255, 255, 0.85)",
            color: COLORS.navy,
            fontWeight: "bold",

            "& .MuiTablePagination-toolbar": {
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              minHeight: "56px !important",
              py: 0,
            },

            "& .MuiTablePagination-selectLabel": {
              fontWeight: 700,
              color: "text.secondary",
              fontSize: "0.85rem",
              margin: 0,
              display: "flex",
              alignItems: "center",
            },

            "& .MuiTablePagination-input": {
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "20px",
              marginLeft: "8px",
              height: "100%",
            },

            "& .MuiTablePagination-select": {
              fontWeight: 800,
              color: COLORS.primary,
              bgcolor: "rgba(94, 53, 177, 0.05)",
              borderRadius: "8px",
              border: "1px solid rgba(94, 53, 177, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              pt: "4px !important",
              pb: "4px !important",
              pl: "12px !important",
              pr: "32px !important",
              "&:focus": {
                borderRadius: "8px",
              },
            },

            "& .MuiTablePagination-selectIcon": {
              color: COLORS.primary,
              top: "calc(50% - 10px)",
              right: "4px",
            },

            "& .MuiTablePagination-displayedRows": {
              fontWeight: 800,
              color: COLORS.navy,
              fontSize: "0.85rem",
              letterSpacing: "0.02em",
              margin: 0,
              display: "flex",
              alignItems: "center",
            },

            "& .MuiTablePagination-actions": {
              marginLeft: "16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              "& .MuiIconButton-root": {
                bgcolor: "white",
                border: "1px solid rgba(11,27,63,0.08)",
                borderRadius: "8px",
                padding: "5px",
                color: COLORS.teal,
                boxShadow: "0 2px 6px rgba(11,27,63,0.04)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  bgcolor: COLORS.teal,
                  color: "white",
                  borderColor: COLORS.teal,
                },
                "&.Mui-disabled": {
                  bgcolor: "rgba(0,0,0,0.02)",
                  color: "rgba(0,0,0,0.2)",
                  borderColor: "rgba(0,0,0,0.05)",
                  boxShadow: "none",
                },
                "& .MuiSvgIcon-root": {
                  fontSize: "18px",
                },
              },
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default AdminAuditLogs;
