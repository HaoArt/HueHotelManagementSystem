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
  headerBg: "#5e35b1",
  teal: "#009688",
  bgLight: "#f4f6f8",
  border: "#e0e0e0",
  textMain: "#1a1a1a",
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
            Hộp Thư Liên Hệ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tiếp nhận, xử lý và phản hồi trực tiếp qua Email của khách hàng.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchContacts}
          disableElevation
          sx={{
            bgcolor: COLORS.teal,
            "&:hover": { bgcolor: "#00796b" },
            fontWeight: "bold",
            borderRadius: "4px",
            px: 3,
            py: 1,
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

      <Paper
        elevation={0}
        sx={{
          borderRadius: "4px",
          border: `1px solid ${COLORS.border}`,
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
        <TableContainer sx={{ maxHeight: "75vh", overflowX: "auto" }}>
          <Table stickyHeader hover>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: COLORS.headerBg,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  THỜI GIAN
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: COLORS.headerBg,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  NGƯỜI GỬI
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: COLORS.headerBg,
                    color: "white",
                    fontWeight: "bold",
                    width: "25%",
                  }}
                >
                  CHỦ ĐỀ
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: COLORS.headerBg,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  TRẠNG THÁI
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: COLORS.headerBg,
                    color: "white",
                    fontWeight: "bold",
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
                      "& td": { borderBottom: `1px solid ${COLORS.border}` },
                      bgcolor: item.status === "New" ? "#ffebee" : "inherit",
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
                                borderRadius: "4px",
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
                              borderRadius: "4px",
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
      </Paper>

      {/* DIALOG XEM CHI TIẾT */}
      <Dialog
        disableScrollLock={true}
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "4px" } }}
      >
        <DialogTitle
          sx={{ bgcolor: COLORS.headerBg, color: "white", fontWeight: "bold" }}
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
                borderRadius: "4px",
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
              bgcolor: COLORS.primary,
              fontWeight: "bold",
              textTransform: "none",
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
        PaperProps={{ sx: { borderRadius: "4px" } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#1976d2",
            color: "white",
            fontWeight: "bold",
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
            sx={{ fontWeight: "bold" }}
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
        PaperProps={{ sx: { borderRadius: "4px", minWidth: 350 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "error.main" }}>
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminContacts;
