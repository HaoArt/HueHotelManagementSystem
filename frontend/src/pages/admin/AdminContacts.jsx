/* eslint-disable react-hooks/set-state-in-effect */
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
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  Chip,
  TextField,
  Snackbar,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import ContactService from "../../services/contactService";
import api from "../../services/api"; // Lấy instance api để gọi hàm read

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
  transition: "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 18px 36px rgba(11, 27, 63, 0.15)",
    borderColor: "rgba(0, 150, 136, 0.35)",
  },
};

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [replyDialog, setReplyDialog] = useState({
    open: false,
    data: null,
    message: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [isSending, setIsSending] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ContactService.getAllContacts();
      setContacts(res.data || res);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleReplySubmit = async () => {
    if (!replyDialog.message.trim()) {
      return setSnackbar({
        open: true,
        message: "Vui lòng nhập nội dung trả lời!",
        severity: "warning",
      });
    }
    try {
      setIsSending(true);
      await ContactService.replyContact(
        replyDialog.data.id,
        replyDialog.message,
      );
      setSnackbar({
        open: true,
        message: "Đã gửi email phản hồi tới khách hàng!",
        severity: "success",
      });
      setReplyDialog({ open: false, data: null, message: "" });
      fetchContacts();
    } catch (err) {
      setSnackbar({ open: true, message: String(err), severity: "error" });
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      open: true,
      title: "Xóa thư liên hệ",
      message: "Bạn có chắc chắn muốn xóa vĩnh viễn thư này không?",
      onConfirm: async () => {
        try {
          await ContactService.deleteContact(id);
          setSnackbar({
            open: true,
            message: "Đã xóa thư thành công!",
            severity: "success",
          });
          fetchContacts();
        } catch (err) {
          setSnackbar({ open: true, message: String(err), severity: "error" });
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  const handleOpenDetail = async (item) => {
    setDetailDialog({ open: true, data: item });
    // Nếu là thư 'New', tự động chuyển thành 'Read'
    if (item.status === "New") {
      try {
        await api.put(`/contacts/${item.id}/read`);
        fetchContacts(); // Gọi lại để update màu Chip
      } catch (e) {
        console.error("Lỗi khi update status", e);
      }
    }
  };

  const getStatusChip = (status) => {
    if (status === "Resolved")
      return (
        <Chip
          label="Đã phản hồi"
          color="success"
          size="small"
          sx={{ fontWeight: "bold", borderRadius: 1 }}
        />
      );
    if (status === "Read")
      return (
        <Chip
          label="Đã xem"
          color="info"
          size="small"
          sx={{ fontWeight: "bold", borderRadius: 1 }}
        />
      );
    return (
      <Chip
        label="Thư mới"
        color="error"
        size="small"
        sx={{ fontWeight: "bold", borderRadius: 1 }}
      />
    );
  };

  if (loading && contacts.length === 0) {
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
        <Box sx={{ maxWidth: { xs: "100%", md: "68%" } }}>
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
            Hộp Thư Liên Hệ
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Tiếp nhận, xử lý và phản hồi trực tiếp qua Email của khách hàng.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Chip
            label={`${contacts.length} liên hệ`}
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
            onClick={fetchContacts}
            disableElevation
            sx={{
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              boxShadow: "0 10px 22px rgba(11, 27, 63, 0.24)",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 1,
              px: 2.25,
              py: 1,
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
        <TableContainer sx={{ maxHeight: "75vh", overflowX: "auto" }}>
          <Table stickyHeader hover>
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
                  THỜI GIAN
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
                  NGƯỜI GỬI
                </TableCell>
                <TableCell
                  sx={{
                    background:
                      "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    width: "25%",
                  }}
                >
                  CHỦ ĐỀ
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
                  TRẠNG THÁI
                </TableCell>
                <TableCell
                  sx={{
                    background:
                      "linear-gradient(180deg, rgba(11,27,63,0.95) 0%, rgba(15,42,97,0.93) 100%)",
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    textAlign: "right",
                  }}
                >
                  THAO TÁC
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary" fontWeight="500">
                      Hộp thư hiện đang trống.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      transition: "background-color 0.2s ease",
                      "& td": {
                        borderBottom: "1px solid rgba(11,27,63,0.08)",
                        py: 1.5,
                      },
                      bgcolor: item.status === "New" ? "rgba(211,47,47,0.05)" : "inherit",
                      "&:nth-of-type(even)": {
                        backgroundColor:
                          item.status === "New" ? "rgba(211,47,47,0.05)" : "rgba(11,27,63,0.015)",
                      },
                      "&:hover": {
                        bgcolor: "rgba(0,150,136,0.06)",
                      },
                    }}
                  >
                    <TableCell>
                      {item.created_at && (
                        <>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={COLORS.textMain}
                          >
                            {new Date(item.created_at).toLocaleDateString(
                              "vi-VN",
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(item.created_at).toLocaleTimeString(
                              "vi-VN",
                            )}
                          </Typography>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={COLORS.textMain}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={item.status === "New" ? "bold" : "normal"}
                        color={COLORS.primary}
                      >
                        {item.subject}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          overflow: "hidden",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 1,
                        }}
                      >
                        {item.message}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(item.status)}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        {item.status !== "Resolved" && (
                          <Tooltip title="Trả lời Email">
                            <IconButton
                              onClick={() =>
                                setReplyDialog({
                                  open: true,
                                  data: item,
                                  message: "",
                                })
                              }
                              sx={{
                                color: "#1976d2",
                                bgcolor: "rgba(25, 118, 210, 0.1)",
                                border: "1px solid rgba(25,118,210,0.2)",
                                borderRadius: 1,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "rgba(25,118,210,0.16)",
                                  transform: "translateY(-1px)",
                                },
                              }}
                              size="small"
                            >
                              <ReplyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            onClick={() => handleOpenDetail(item)}
                            sx={{
                              color: COLORS.teal,
                              bgcolor: "rgba(0, 150, 136, 0.1)",
                              border: "1px solid rgba(0,150,136,0.2)",
                              borderRadius: 1,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: "rgba(0, 150, 136, 0.18)",
                                transform: "translateY(-1px)",
                              },
                            }}
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa thư">
                          <IconButton
                            onClick={() => handleDelete(item.id)}
                            sx={{
                              color: "#d32f2f",
                              bgcolor: "rgba(211, 47, 47, 0.1)",
                              border: "1px solid rgba(211,47,47,0.2)",
                              borderRadius: 1,
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

      {/* DIALOG XEM CHI TIẾT */}
      <Dialog
        disableScrollLock={true}
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="sm"
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
          sx={{ bgcolor: COLORS.navy, color: "white", fontWeight: 800 }}
        >
          Chi tiết tin nhắn
        </DialogTitle>
        {detailDialog.data && (
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  NGƯỜI GỬI
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={COLORS.textMain}
                >
                  {detailDialog.data.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {detailDialog.data.email}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  TRẠNG THÁI
                </Typography>
                <Box mt={0.5}>{getStatusChip(detailDialog.data.status)}</Box>
              </Box>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
              >
                CHỦ ĐỀ
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={COLORS.primary}>
                {detailDialog.data.subject}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                bgcolor: "#f9f9f9",
                borderRadius: 1,
                border: `1px solid ${COLORS.border}`,
                minHeight: "150px",
              }}
            >
              <Typography
                variant="body2"
                color={COLORS.textMain}
                sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
              >
                {detailDialog.data.message}
              </Typography>
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
          <Button
            onClick={() => setDetailDialog({ open: false, data: null })}
            variant="contained"
            disableElevation
            sx={{
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              fontWeight: 700,
              borderRadius: 1,
              textTransform: "none",
              boxShadow: "0 10px 20px rgba(11,27,63,0.24)",
              "&:hover": {
                boxShadow: "0 14px 26px rgba(11,27,63,0.32)",
              },
            }}
          >
            ĐÓNG
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG TRẢ LỜI EMAIL */}
      <Dialog
        disableScrollLock={true}
        open={replyDialog.open}
        onClose={() => setReplyDialog({ open: false, data: null, message: "" })}
        maxWidth="sm"
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
            background: "linear-gradient(135deg, #0b1b3f 0%, #1976d2 100%)",
            color: "white",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ReplyIcon /> Trả lời Email
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Hệ thống sẽ tự động gửi email này tới{" "}
            <b>{replyDialog.data?.email}</b> bằng hòm thư của hệ thống.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            placeholder="Nhập nội dung phản hồi của bạn..."
            value={replyDialog.message}
            onChange={(e) =>
              setReplyDialog({ ...replyDialog, message: e.target.value })
            }
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.94)",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() =>
              setReplyDialog({ open: false, data: null, message: "" })
            }
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleReplySubmit}
            variant="contained"
            color="primary"
            disableElevation
            disabled={isSending}
            sx={{
              fontWeight: 700,
              borderRadius: 1,
              background: "linear-gradient(135deg, #0b1b3f 0%, #009688 100%)",
              boxShadow: "0 10px 20px rgba(11,27,63,0.2)",
              "&:hover": {
                boxShadow: "0 14px 26px rgba(11,27,63,0.28)",
              },
            }}
          >
            {isSending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "GỬI PHẢN HỒI"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DIALOG CHUNG */}
      <Dialog
        disableScrollLock={true}
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        PaperProps={{
          sx: {
            borderRadius: 1,
            minWidth: 350,
            border: "1px solid rgba(11,27,63,0.12)",
            boxShadow: "0 22px 44px rgba(11, 27, 63, 0.22)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "error.main" }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color="error"
            disableElevation
            sx={{ borderRadius: 1, fontWeight: 700, textTransform: "none" }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR THÔNG BÁO */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default AdminContacts;
