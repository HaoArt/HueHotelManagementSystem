/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-useless-assignment */
import { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Avatar,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";

import BookingService from "../../services/bookingService";
import ServiceService from "../../services/serviceService";
import couponService from "../../services/couponService";
import { AuthContext } from "../../context/AuthContext";

// Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SecurityIcon from "@mui/icons-material/Security";
import HotelIcon from "@mui/icons-material/Hotel";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import RoomServiceIcon from "@mui/icons-material/RoomService";

// Custom Theme Colors matching the design
const COLORS = {
  primary: "#4a148c", // Tím đậm chủ đạo
  primaryLight: "#f3e5f5", // Tím nhạt cho item được chọn
  border: "#e0e0e0", // Viền xám nhạt
  depositBg: "#ffcdd2", // Nền đỏ nhạt cho tiền cọc
  textMain: "#333",
  borderRadius: "8px", // Hạn chế border radius quá lớn theo yêu cầu
};

const Booking = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const roomInfo = location.state?.room || {
    id: 1,
    type_name: "Phòng Deluxe City View",
    base_price: 1200000,
  };

  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    phone: user?.phone || "",
    checkIn: "",
    checkOut: "",
    paymentMethod: "DepositOnline", // Default theo design
    note: "",
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});

  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.full_name || "",
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const [policy, setPolicy] = useState({
    holdUntilText: "",
    depositPercent: 50,
    totalDays: 0,
    roomTotal: 0,
    servicesTotal: 0,
    discountAmount: 0,
    finalTotalAmount: 0,
    depositAmount: 0,
    isHighValue: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleServiceChange = (serviceId, delta) => {
    setSelectedServices((prev) => {
      const currentQty = prev[serviceId] || 0;
      const newQty = currentQty + delta;
      if (newQty < 0) return prev;
      return { ...prev, [serviceId]: newQty };
    });
  };

  // FETCH DỮ LIỆU
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [svcRes, couponRes] = await Promise.all([
          ServiceService.getAllServices(),
          couponService.getActiveCoupons(),
        ]);
        setAvailableServices(svcRes.data || []);

        const coupons = couponRes.data?.data || couponRes.data || [];
        setAvailableCoupons(
          coupons.filter((c) => c.status === "ACTIVE" || c.status === "Active"),
        );
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      }
    };
    fetchData();
  }, []);

  // LOGIC TÍNH TOÁN (Giữ nguyên)
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);

      const diffTime = checkOut - checkIn;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const leadTimeDays = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));

      let holdText = "";
      let percent = 30;

      if (leadTimeDays >= 1 && leadTimeDays <= 3) {
        holdText = "Hệ thống sẽ giữ phòng đến 14:00 ngày nhận phòng.";
        percent = 50;
      } else if (leadTimeDays > 3 && leadTimeDays <= 14) {
        holdText = "Hệ thống sẽ giữ phòng đến 18:00 ngày nhận phòng.";
        percent = 30;
      } else {
        holdText =
          "Hệ thống sẽ giữ phòng trong vòng 2 giờ kể từ khi đặt thành công.";
        percent = 50;
      }

      const roomTotal = diffDays > 0 ? diffDays * roomInfo.base_price : 0;
      let svcsTotal = 0;
      availableServices.forEach((svc) => {
        svcsTotal += (selectedServices[svc.id] || 0) * svc.price;
      });

      const subTotal = roomTotal + svcsTotal;

      let discount = 0;
      if (selectedCoupon && subTotal >= (selectedCoupon.min_order_value || 0)) {
        if (
          selectedCoupon.discount_type === "PERCENTAGE" ||
          selectedCoupon.discount_type === "Percentage"
        ) {
          discount =
            (subTotal * parseFloat(selectedCoupon.discount_value)) / 100;
          if (
            selectedCoupon.max_discount_value &&
            discount > selectedCoupon.max_discount_value
          ) {
            discount = parseFloat(selectedCoupon.max_discount_value);
          }
        } else {
          discount = parseFloat(selectedCoupon.discount_value);
        }
      }

      if (discount > subTotal) discount = subTotal;
      const finalTotal = subTotal - discount;

      const HIGH_VALUE_THRESHOLD = 4000000;
      const isHigh = finalTotal >= HIGH_VALUE_THRESHOLD;

      if (isHigh) {
        percent = 50;
        holdText =
          "Đơn hàng giá trị cao: Hệ thống sẽ giữ phòng 15 phút để chờ thanh toán cọc.";
        if (formData.paymentMethod === "PayAtDesk") {
          setFormData((prev) => ({ ...prev, paymentMethod: "DepositOnline" }));
        }
      }

      setPolicy({
        holdUntilText: holdText,
        depositPercent: percent,
        totalDays: diffDays > 0 ? diffDays : 0,
        roomTotal: roomTotal,
        servicesTotal: svcsTotal,
        discountAmount: discount,
        finalTotalAmount: finalTotal,
        depositAmount: (finalTotal * percent) / 100,
        isHighValue: isHigh,
      });
    }
  }, [
    formData.checkIn,
    formData.checkOut,
    roomInfo.base_price,
    selectedServices,
    availableServices,
    selectedCoupon,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      return setError("Ngày trả phòng phải sau ngày nhận phòng!");
    }

    setLoading(true);
    setError("");

    try {
      const servicesArray = Object.keys(selectedServices)
        .filter((id) => selectedServices[id] > 0)
        .map((id) => ({
          service_id: parseInt(id),
          quantity: selectedServices[id],
        }));

      const payload = {
        room_type_id: roomInfo.id,
        check_in: formData.checkIn,
        check_out: formData.checkOut,
        payment_method: formData.paymentMethod,
        note: formData.note,
        services: servicesArray,
        coupon_code: selectedCoupon ? selectedCoupon.code : null,
      };

      const res = await BookingService.createBooking(payload);
      navigate("/booking-success", {
        state: { bookingId: res.id || res.booking_id },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi đặt phòng.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoupon = (coupon) => {
    const subTotal = policy.roomTotal + policy.servicesTotal;
    if (subTotal < coupon.min_order_value) {
      alert(
        `Đơn hàng tối thiểu để áp dụng mã này là ${Number(coupon.min_order_value).toLocaleString()}đ`,
      );
      return;
    }
    setSelectedCoupon(coupon);
    setCouponDialogOpen(false);
  };

  // Dùng chung style cho các Paper bọc bên ngoài
  const paperSectionStyle = {
    p: 3,
    borderRadius: COLORS.borderRadius,
    mb: 3,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "none", // Bỏ shadow theo ý đồ thiết kế phẳng
  };

  const avatarStyle = {
    bgcolor: COLORS.primary,
    width: 36,
    height: 36,
    fontSize: "1rem",
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", pb: 10 }}>
      <Container className="py-4">
        {/* BREADCRUMBS */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <MuiLink
            component={Link}
            to="/"
            underline="hover"
            color="inherit"
            fontSize="0.9rem"
          >
            Trang chủ
          </MuiLink>
          <MuiLink
            component={Link}
            to="/rooms"
            underline="hover"
            color="inherit"
            fontSize="0.9rem"
          >
            Phòng nghỉ
          </MuiLink>
          <Typography color="text.primary" fontSize="0.9rem" fontWeight="500">
            Thanh toán
          </Typography>
        </Breadcrumbs>

        {/* TIÊU ĐỀ */}
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{ mb: 4, color: COLORS.primary }}
        >
          Chi tiết đặt phòng
        </Typography>

        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            <Col lg={8}>
              {/* --- KHUNG 1: THÔNG TIN NGƯỜI ĐẶT --- */}
              <Paper sx={paperSectionStyle}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <Avatar sx={avatarStyle}>1</Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Thông tin người đặt
                  </Typography>
                </Stack>
                <Row className="g-3">
                  <Col md={6}>
                    <Typography variant="body2" fontWeight="500" mb={1}>
                      Họ và tên
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={formData.fullName}
                      InputProps={{ readOnly: true }}
                      sx={{ bgcolor: "#f5f5f5" }}
                    />
                  </Col>
                  <Col md={6}>
                    <Typography variant="body2" fontWeight="500" mb={1}>
                      Số điện thoại liên hệ{" "}
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Typography variant="body2" fontWeight="500" mb={1}>
                      Ngày nhận phòng <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={(e) =>
                        setFormData({ ...formData, checkIn: e.target.value })
                      }
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Typography variant="body2" fontWeight="500" mb={1}>
                      Ngày trả phòng <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={(e) =>
                        setFormData({ ...formData, checkOut: e.target.value })
                      }
                      required
                    />
                  </Col>
                  <Col md={12}>
                    <Typography variant="body2" fontWeight="500" mb={1}>
                      Yêu cầu đặc biệt (Ghi chú)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Ví dụ: Phòng yên tĩnh, tầng cao..."
                      name="note"
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                    />
                  </Col>
                </Row>
              </Paper>

              {/* --- KHUNG 2: DỊCH VỤ ĐI KÈM --- */}
              <Paper sx={paperSectionStyle}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <Avatar sx={avatarStyle}>
                    <RoomServiceIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Dịch vụ đi kèm{" "}
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "normal",
                        color: "#666",
                      }}
                    >
                      (Tùy chọn)
                    </span>
                  </Typography>
                </Stack>
                <Stack spacing={2}>
                  {availableServices.map((svc) => {
                    const isSelected = selectedServices[svc.id] > 0;
                    return (
                      <Box
                        key={svc.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 2,
                          border: `1px solid ${isSelected ? COLORS.primary : COLORS.border}`,
                          borderRadius: COLORS.borderRadius,
                          bgcolor: isSelected
                            ? COLORS.primaryLight
                            : "transparent",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box>
                          <Typography fontWeight="bold" fontSize="0.95rem">
                            {svc.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: COLORS.primary,
                              fontWeight: "500",
                              mt: 0.5,
                            }}
                          >
                            {parseFloat(svc.price).toLocaleString()}đ
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <IconButton
                            sx={{
                              color: isSelected
                                ? "error.main"
                                : "action.disabled",
                            }}
                            onClick={() => handleServiceChange(svc.id, -1)}
                            disabled={!selectedServices[svc.id]}
                          >
                            <RemoveCircleIcon />
                          </IconButton>
                          <Typography
                            fontWeight="bold"
                            sx={{ width: 24, textAlign: "center" }}
                          >
                            {selectedServices[svc.id] || 0}
                          </Typography>
                          <IconButton
                            sx={{ color: COLORS.primary }}
                            onClick={() => handleServiceChange(svc.id, 1)}
                          >
                            <AddCircleIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>

              {/* --- KHUNG 3: PHƯƠNG THỨC THANH TOÁN --- */}
              <Paper sx={paperSectionStyle}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <Avatar sx={avatarStyle}>3</Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Phương thức thanh toán
                  </Typography>
                </Stack>
                <RadioGroup
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                >
                  <Box
                    sx={{
                      p: 2,
                      border: `1px solid ${formData.paymentMethod === "PayAtDesk" ? COLORS.primary : COLORS.border}`,
                      borderRadius: COLORS.borderRadius,
                      mb: 2,
                      bgcolor:
                        formData.paymentMethod === "PayAtDesk"
                          ? COLORS.primaryLight
                          : "transparent",
                      opacity: policy.isHighValue ? 0.6 : 1,
                    }}
                  >
                    <FormControlLabel
                      value="PayAtDesk"
                      control={
                        <Radio
                          sx={{
                            color: COLORS.primary,
                            "&.Mui-checked": { color: COLORS.primary },
                          }}
                        />
                      }
                      disabled={policy.isHighValue}
                      label={
                        <Typography fontWeight="500" fontSize="0.95rem">
                          Thanh toán trực tiếp tại quầy
                        </Typography>
                      }
                    />
                    {policy.isHighValue && (
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{ ml: 4, mt: 0.5, fontStyle: "italic" }}
                      >
                        <AccessTimeIcon
                          sx={{
                            fontSize: 14,
                            verticalAlign: "middle",
                            mr: 0.5,
                          }}
                        />
                        Đơn hàng vượt quá ngưỡng quy định (4 triệu VNĐ) bắt buộc
                        phải đặt cọc trực tuyến.
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      border: `1px solid ${formData.paymentMethod === "DepositOnline" ? COLORS.primary : COLORS.border}`,
                      borderRadius: COLORS.borderRadius,
                      bgcolor:
                        formData.paymentMethod === "DepositOnline"
                          ? COLORS.primaryLight
                          : "transparent",
                    }}
                  >
                    <FormControlLabel
                      value="DepositOnline"
                      control={
                        <Radio
                          sx={{
                            color: COLORS.primary,
                            "&.Mui-checked": { color: COLORS.primary },
                          }}
                        />
                      }
                      label={
                        <Typography fontWeight="bold" fontSize="0.95rem">
                          Đặt cọc trực tuyến ({policy.depositPercent}%)
                        </Typography>
                      }
                    />
                    <Typography
                      variant="body2"
                      sx={{ ml: 4, color: "text.secondary", mt: 0.5 }}
                    >
                      Thanh toán qua cổng VNPay/MoMo để giữ phòng chắc chắn
                      100%.
                    </Typography>
                    {formData.paymentMethod === "DepositOnline" &&
                      policy.holdUntilText && (
                        <Box
                          sx={{
                            ml: 4,
                            mt: 1,
                            p: 1.5,
                            bgcolor: "#fff",
                            borderRadius: 1,
                            border: `1px solid ${COLORS.border}`,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            <AccessTimeIcon
                              sx={{
                                fontSize: 16,
                                verticalAlign: "sub",
                                mr: 0.5,
                              }}
                            />
                            {policy.holdUntilText}
                          </Typography>
                        </Box>
                      )}
                  </Box>
                </RadioGroup>
              </Paper>
            </Col>

            {/* --- CỘT PHẢI: TÓM TẮT ĐƠN HÀNG --- */}
            <Col lg={4}>
              <Paper
                sx={{
                  p: 0,
                  borderRadius: COLORS.borderRadius,
                  border: `1px solid ${COLORS.border}`,
                  position: "sticky",
                  top: 20,
                  overflow: "hidden",
                  boxShadow: "none",
                }}
              >
                <Box
                  sx={{
                    bgcolor: COLORS.primary,
                    p: 2,
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  <Typography fontWeight="bold" fontSize="1rem">
                    TÓM TẮT ĐƠN HÀNG
                  </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <HotelIcon sx={{ color: COLORS.primary }} />
                    <Box>
                      <Typography fontWeight="bold" fontSize="1rem">
                        {roomInfo.type_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Thời gian: {policy.totalDays} đêm
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" variant="body2">
                        Giá phòng/đêm:
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {Number(roomInfo.base_price).toLocaleString("vi-VN")}đ
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" variant="body2">
                        Tổng tiền phòng:
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {policy.roomTotal.toLocaleString()}đ
                      </Typography>
                    </Stack>
                    {policy.servicesTotal > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography color="text.secondary" variant="body2">
                          Dịch vụ đi kèm:
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {policy.servicesTotal.toLocaleString()}đ
                        </Typography>
                      </Stack>
                    )}

                    {policy.discountAmount > 0 && (
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{ color: "#d32f2f" }}
                      >
                        <Typography fontWeight="bold" variant="body2">
                          Giảm giá (Coupon):
                        </Typography>
                        <Typography fontWeight="bold" variant="body2">
                          -{policy.discountAmount.toLocaleString()}đ
                        </Typography>
                      </Stack>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6" fontWeight="bold">
                        Tổng cộng
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ color: COLORS.primary }}
                      >
                        {policy.finalTotalAmount.toLocaleString()}đ
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Nút chọn Coupon */}
                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<LocalOfferIcon />}
                      onClick={() => setCouponDialogOpen(true)}
                      sx={{
                        color: COLORS.primary,
                        borderColor: COLORS.primary,
                        borderRadius: "4px",
                        borderStyle: "dashed",
                        borderWidth: 1.5,
                        py: 1,
                        "&:hover": {
                          borderStyle: "dashed",
                          borderWidth: 1.5,
                          borderColor: COLORS.primary,
                          bgcolor: COLORS.primaryLight,
                        },
                      }}
                    >
                      {selectedCoupon
                        ? `Đã áp mã: ${selectedCoupon.code}`
                        : "Chọn mã giảm giá"}
                    </Button>
                    {selectedCoupon && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 1, textAlign: "center" }}
                      >
                        Nhấn vào nút trên để thay đổi hoặc hủy mã
                      </Typography>
                    )}
                  </Box>

                  {/* Tiền cọc */}
                  <Box
                    sx={{
                      bgcolor: COLORS.depositBg,
                      p: 2,
                      borderRadius: "4px",
                      mb: 3,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        color="#b71c1c"
                        fontWeight="bold"
                        fontSize="0.95rem"
                      >
                        Tiền cọc ({policy.depositPercent}%)
                      </Typography>
                      <Typography
                        color="#b71c1c"
                        variant="h6"
                        fontWeight="bold"
                      >
                        {policy.depositAmount.toLocaleString()}đ
                      </Typography>
                    </Stack>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: "4px" }}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      bgcolor: COLORS.primary,
                      color: "white",
                      py: 1.5,
                      fontWeight: "bold",
                      borderRadius: "4px",
                      fontSize: "1rem",
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: "#311b92",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT PHÒNG"}
                  </Button>

                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ mt: 2, color: "#2e7d32" }}
                  >
                    <SecurityIcon sx={{ fontSize: 16 }} />
                    <Typography variant="caption" fontWeight="500">
                      Thanh toán an toàn bảo mật
                    </Typography>
                  </Stack>
                </Box>
              </Paper>
            </Col>
          </Row>
        </Form>
      </Container>

      {/* DIALOG MÃ GIẢM GIÁ (Giữ nguyên logic, chỉ chỉnh style xíu cho đồng bộ) */}
      <Dialog
        open={couponDialogOpen}
        onClose={() => setCouponDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: COLORS.borderRadius } }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: COLORS.primary,
            textAlign: "center",
          }}
        >
          Danh Sách Mã Giảm Giá
        </DialogTitle>
        <DialogContent dividers>
          {availableCoupons.length === 0 ? (
            <Typography
              textAlign="center"
              color="text.secondary"
              sx={{ py: 3 }}
            >
              Hiện tại không có mã giảm giá nào khả dụng.
            </Typography>
          ) : (
            availableCoupons.map((coupon) => (
              <Card
                key={coupon.id}
                elevation={0}
                sx={{
                  mb: 2,
                  cursor: "pointer",
                  border:
                    selectedCoupon?.id === coupon.id
                      ? `2px solid ${COLORS.primary}`
                      : `1px solid ${COLORS.border}`,
                  transition: "0.2s",
                  "&:hover": {
                    borderColor: COLORS.primary,
                    bgcolor: COLORS.primaryLight,
                  },
                }}
                onClick={() => handleSelectCoupon(coupon)}
              >
                <CardContent
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Avatar
                    sx={{ bgcolor: COLORS.primary, width: 48, height: 48 }}
                  >
                    <LocalOfferIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      {coupon.code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {coupon.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        fontWeight: "500",
                        color: "#ed6c02",
                      }}
                    >
                      Điều kiện: Đơn từ{" "}
                      {Number(coupon.min_order_value).toLocaleString()}đ
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ color: "#d32f2f" }}
                    >
                      {coupon.discount_type === "PERCENTAGE" ||
                      coupon.discount_type === "Percentage"
                        ? `-${parseFloat(coupon.discount_value)}%`
                        : `-${Number(coupon.discount_value).toLocaleString()}đ`}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button
            onClick={() => {
              setSelectedCoupon(null);
              setCouponDialogOpen(false);
            }}
            color="error"
            disabled={!selectedCoupon}
          >
            Bỏ mã đã chọn
          </Button>
          <Button
            onClick={() => setCouponDialogOpen(false)}
            variant="contained"
            sx={{ bgcolor: COLORS.primary, "&:hover": { bgcolor: "#311b92" } }}
            disableElevation
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Booking;
