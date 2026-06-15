/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-useless-assignment */
import { useState, useEffect, useContext } from "react";
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
  CircularProgress,
  Snackbar,
  Fade,
  Slide,
  Container,
} from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";

import BookingService from "../../services/bookingService";
import ServiceService from "../../services/serviceService";
import CouponService from "../../services/couponService";
import ConfigService from "../../services/configService";
import SurchargeService from "../../services/surchargeService"; // ✨ ĐÃ IMPORT
import { AuthContext } from "../../context/AuthContext";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SecurityIcon from "@mui/icons-material/Security";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

const LUXURY = {
  white: "#FAFAF9",
  offwhite: "#F8F8F6",
  charcoal: "#1A1A1A",
  navy: "#1B2D4F",
  gold: "#D4AF37",
  goldLight: "#E8D4B8",
  warmGray: "#9B8B7E",
  softGray: "#D4D0C8",
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    bgcolor: LUXURY.offwhite,
    transition: "all 0.3s ease",
    "& fieldset": { borderColor: "transparent" },
    "&:hover fieldset": { borderColor: `${LUXURY.gold}80` },
    "&.Mui-focused fieldset": { borderColor: LUXURY.gold, borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": {
    color: LUXURY.warmGray,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: LUXURY.gold,
    fontWeight: "bold",
  },
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
    paymentMethod: "DepositOnline",
    note: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);

  // ✨ STATE MỚI: Chứa dữ liệu ngày Lễ lấy từ DB
  const [holidayRules, setHolidayRules] = useState([]);

  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const [sysConfigs, setSysConfigs] = useState({});

  const HIGH_VALUE_THRESHOLD = sysConfigs.high_value_threshold
    ? parseFloat(sysConfigs.high_value_threshold)
    : 4000000;

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
    depositPercent: 30,
    totalDays: 0,
    roomTotal: 0,
    servicesTotal: 0,
    discountAmount: 0,
    finalTotalAmount: 0,
    depositAmount: 0,
    isHighValue: false,
    isLowTrust: false,
    userTrustScore: 100,
    isHoliday: false, // ✨ Cờ nhận diện Lễ
    surchargeAmount: 0, // ✨ Tiền phụ thu Lễ
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleServiceChange = (serviceId, delta) => {
    setSelectedServices((prev) => {
      const currentItem = prev[serviceId] || {
        quantity: 0,
        usage_time: "",
        note: "",
      };
      const newQty = currentItem.quantity + delta;

      if (newQty < 0) return prev;

      if (newQty === 0) {
        const newState = { ...prev };
        delete newState[serviceId];
        return newState;
      }

      return { ...prev, [serviceId]: { ...currentItem, quantity: newQty } };
    });
  };

  const handleUpdateServiceField = (serviceId, field, value) => {
    setSelectedServices((prev) => {
      const currentItem = prev[serviceId];
      if (!currentItem) return prev;
      return { ...prev, [serviceId]: { ...currentItem, [field]: value } };
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const couponPromise = user
          ? CouponService.getActiveCouponsForUser()
          : Promise.resolve({ data: [] });

        const [svcRes, couponRes, configRes, surchargeRes] = await Promise.all([
          ServiceService.getAllServices(),
          couponPromise, // Đã an toàn
          ConfigService.getConfigs(),
          SurchargeService.getAll(), // Gắn thêm API lấy lịch nghỉ lễ
        ]);

        setAvailableServices(svcRes.data || []);

        const coupons = couponRes.data?.data || couponRes.data || [];
        setAvailableCoupons(
          coupons.filter((c) => c.status === "ACTIVE" || c.status === "Active"),
        );

        const configsArray = configRes.data || [];
        const configMap = {};
        configsArray.forEach((c) => {
          configMap[c.config_key] = c.config_value;
        });
        setSysConfigs(configMap);

        // Lấy ngày lễ. Ở Backend surchargeController.getAllRules, mảng được bọc trong { data: [...] }
        setHolidayRules(surchargeRes.data?.data || surchargeRes.data || []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu ban đầu:", err);
      }
    };
    fetchData();
  }, []); // Remove user dependency here to prevent infinite loop. User triggers another useEffect.

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
      let percent = sysConfigs.deposit_percent
        ? parseFloat(sysConfigs.deposit_percent)
        : 50;

      if (leadTimeDays >= 1 && leadTimeDays <= 3) {
        holdText = "Hệ thống sẽ giữ phòng đến 14:00 ngày nhận phòng.";
      } else if (leadTimeDays > 3 && leadTimeDays <= 14) {
        holdText = "Hệ thống sẽ giữ phòng đến 18:00 ngày nhận phòng.";
      } else {
        holdText =
          "Hệ thống sẽ giữ phòng trong vòng 2 giờ kể từ khi đặt thành công.";
      }

      // ✨ 1. LOGIC NHẬN DIỆN LỄ VÀ TÍNH PHỤ THU
      let isHoliday = false;
      let baseRoomTotal = 0;
      let computedSurchargeAmount = 0;

      const checkInDate = new Date(checkIn);
      checkInDate.setHours(0, 0, 0, 0);
      const checkOutDate = new Date(checkOut);
      checkOutDate.setHours(0, 0, 0, 0);

      let currentDate = new Date(checkInDate);

      // Duyệt qua từng "đêm" lưu trú để tính giá gốc và tiền lễ chính xác
      while (currentDate < checkOutDate) {
        baseRoomTotal += parseFloat(roomInfo.base_price);

        const appliedRulesForNight = holidayRules.filter((rule) => {
          const ruleStart = new Date(rule.start_date).setHours(0, 0, 0, 0);
          const ruleEnd = new Date(rule.end_date).setHours(23, 59, 59, 999);
          return (
            currentDate.getTime() >= ruleStart &&
            currentDate.getTime() <= ruleEnd
          );
        });

        if (appliedRulesForNight.length > 0) {
          isHoliday = true;
          const maxSurchargePercent = Math.max(
            ...appliedRulesForNight.map((r) =>
              parseFloat(r.surcharge_percent || 0),
            ),
          );
          computedSurchargeAmount +=
            (parseFloat(roomInfo.base_price) * maxSurchargePercent) / 100;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const roomTotal = baseRoomTotal + computedSurchargeAmount;

      let svcsTotal = 0;
      availableServices.forEach((svc) => {
        svcsTotal += (selectedServices[svc.id]?.quantity || 0) * svc.price;
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

      const isHigh = finalTotal >= HIGH_VALUE_THRESHOLD;
      const userTrustScore = user?.trust_score ?? 100;
      const isLowTrust = userTrustScore < 80;

      // ✨ 2. ĐIỀU KIỆN KHÓA NÚT CHẶT CHẼ HƠN
      const mustDeposit = isHigh || isLowTrust || isHoliday;

      if (mustDeposit) {
        if (formData.paymentMethod === "PayAtDesk") {
          setFormData((prev) => ({ ...prev, paymentMethod: "DepositOnline" }));
        }
      }

      let activePercent =
        formData.paymentMethod === "PayAtDesk" && !mustDeposit ? 0 : percent;

      setPolicy({
        holdUntilText: holdText,
        depositPercent: activePercent,
        totalDays: diffDays > 0 ? diffDays : 0,
        roomTotal: baseRoomTotal, // Tách riêng giá gốc không gộp chung với tiền lễ
        servicesTotal: svcsTotal,
        discountAmount: discount,
        finalTotalAmount: finalTotal,
        depositAmount: (finalTotal * activePercent) / 100,
        isHighValue: isHigh,
        isLowTrust: isLowTrust,
        userTrustScore: userTrustScore,
        isHoliday: isHoliday,
        surchargeAmount: computedSurchargeAmount,
      });
    }
  }, [
    formData.checkIn,
    formData.checkOut,
    formData.paymentMethod,
    roomInfo.base_price,
    selectedServices,
    availableServices,
    selectedCoupon,
    sysConfigs,
    HIGH_VALUE_THRESHOLD,
    user,
    holidayRules,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      return setError("Ngày trả phòng phải sau ngày nhận phòng!");
    }

    setLoading(true);
    setError("");

    try {
      const servicesArray = Object.keys(selectedServices).map((id) => ({
        service_id: parseInt(id),
        quantity: selectedServices[id].quantity,
        usage_time: selectedServices[id].usage_time || null,
        note: selectedServices[id].note || "",
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

      if (formData.paymentMethod === "DepositOnline") {
        setCreatedBooking(res);
        setQrDialogOpen(true);
      } else {
        setSnackbar({
          open: true,
          message: "Đặt phòng thành công!",
          severity: "success",
        });
        setTimeout(() => navigate("/profile"), 1500);
      }
    } catch (err) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err?.response?.data?.message || "Có lỗi xảy ra khi đặt phòng.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoupon = (coupon) => {
    // Bù lại tiền lễ vào subTotal để validate điều kiện mã giảm giá khớp với Backend
    const subTotal =
      policy.roomTotal + policy.surchargeAmount + policy.servicesTotal;
    if (subTotal < coupon.min_order_value) {
      setSnackbar({
        open: true,
        message: `Đơn hàng tối thiểu để áp dụng mã này là ${Number(coupon.min_order_value).toLocaleString()}đ`,
        severity: "warning",
      });
      return;
    }
    setSelectedCoupon(coupon);
    setCouponDialogOpen(false);
  };

  const paperSectionStyle = {
    p: { xs: 3, md: 5 },
    borderRadius: "24px",
    mb: 4,
    border: `1px solid ${LUXURY.softGray}`,
    boxShadow: "0 20px 40px rgba(26,26,26,0.04)",
    bgcolor: LUXURY.white,
  };

  const sectionIconStyle = {
    bgcolor: `${LUXURY.gold}15`,
    color: LUXURY.gold,
    width: 48,
    height: 48,
    borderRadius: "16px",
  };

  const bankId = sysConfigs.bank_id || "MB";
  const bankAccount = sysConfigs.bank_account || "0866861876";
  const accountName = sysConfigs.bank_account_name
    ? encodeURIComponent(sysConfigs.bank_account_name)
    : "HUE%20HOTEL";

  return (
    <Box
      sx={{
        bgcolor: LUXURY.white,
        minHeight: "100vh",
        pb: { xs: 8, md: 12 },
        pt: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <Fade in={true} timeout={600}>
          <Box>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{
                mb: 4,
                "& .MuiBreadcrumbs-separator": { color: LUXURY.gold },
              }}
            >
              <MuiLink
                component={Link}
                to="/"
                underline="hover"
                color={LUXURY.warmGray}
                fontSize="0.85rem"
                fontWeight="600"
                textTransform="uppercase"
              >
                Trang chủ
              </MuiLink>
              <MuiLink
                component={Link}
                to="/rooms"
                underline="hover"
                color={LUXURY.warmGray}
                fontSize="0.85rem"
                fontWeight="600"
                textTransform="uppercase"
              >
                Phòng & Suite
              </MuiLink>
              <Typography
                color={LUXURY.charcoal}
                fontSize="0.85rem"
                fontWeight="700"
                textTransform="uppercase"
              >
                Thanh Toán
              </Typography>
            </Breadcrumbs>

            <Typography
              variant="h2"
              fontWeight="900"
              color={LUXURY.charcoal}
              sx={{
                fontFamily: '"Playfair Display", serif',
                mb: 5,
                fontSize: { xs: "2.2rem", md: "3rem" },
                letterSpacing: "-0.02em",
              }}
            >
              Chi Tiết Đặt Phòng
            </Typography>
          </Box>
        </Fade>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: { xs: 4, lg: 6 },
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 0%" } }}>
            <Slide direction="right" in={true} timeout={800}>
              <Box>
                <Paper elevation={0} sx={paperSectionStyle}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 4 }}
                  >
                    <Avatar variant="rounded" sx={sectionIconStyle}>
                      <AssignmentIndIcon />
                    </Avatar>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: '"Playfair Display", serif',
                        color: LUXURY.charcoal,
                        fontWeight: 800,
                      }}
                    >
                      1. Khách Hàng
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 3,
                    }}
                  >
                    <Box
                      sx={{
                        flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color={LUXURY.charcoal}
                        fontWeight="600"
                        mb={1}
                      >
                        Họ và tên
                      </Typography>
                      <TextField
                        fullWidth
                        value={formData.fullName}
                        InputProps={{ readOnly: true }}
                        sx={{
                          ...inputStyle,
                          "& .MuiOutlinedInput-root": {
                            bgcolor: LUXURY.softGray,
                            "& fieldset": {
                              borderColor: LUXURY.softGray,
                              borderWidth: "1px",
                            },
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color={LUXURY.charcoal}
                        fontWeight="600"
                        mb={1}
                      >
                        Số điện thoại liên hệ{" "}
                        <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        name="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                        sx={{
                          ...inputStyle,
                          "& .MuiOutlinedInput-root fieldset": {
                            borderColor: LUXURY.softGray,
                            borderWidth: "1px",
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color={LUXURY.charcoal}
                        fontWeight="600"
                        mb={1}
                      >
                        Ngày nhận phòng <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        type="date"
                        name="checkIn"
                        InputLabelProps={{ shrink: true }}
                        value={formData.checkIn}
                        onChange={(e) =>
                          setFormData({ ...formData, checkIn: e.target.value })
                        }
                        required
                        sx={{
                          ...inputStyle,
                          "& .MuiOutlinedInput-root fieldset": {
                            borderColor: LUXURY.softGray,
                            borderWidth: "1px",
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color={LUXURY.charcoal}
                        fontWeight="600"
                        mb={1}
                      >
                        Ngày trả phòng <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        type="date"
                        name="checkOut"
                        InputLabelProps={{ shrink: true }}
                        value={formData.checkOut}
                        onChange={(e) =>
                          setFormData({ ...formData, checkOut: e.target.value })
                        }
                        required
                        sx={{
                          ...inputStyle,
                          "& .MuiOutlinedInput-root fieldset": {
                            borderColor: LUXURY.softGray,
                            borderWidth: "1px",
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ flex: "1 1 100%" }}>
                      <Typography
                        variant="body2"
                        color={LUXURY.charcoal}
                        fontWeight="600"
                        mb={1}
                      >
                        Yêu cầu đặc biệt (Ghi chú)
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Ví dụ: Cần phòng tầng cao, giường phụ..."
                        name="note"
                        value={formData.note}
                        onChange={(e) =>
                          setFormData({ ...formData, note: e.target.value })
                        }
                        sx={{
                          ...inputStyle,
                          "& .MuiOutlinedInput-root fieldset": {
                            borderColor: LUXURY.softGray,
                            borderWidth: "1px",
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Paper>

                {/*Dịch vụ */}
                <Paper elevation={0} sx={paperSectionStyle}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 4 }}
                  >
                    <Avatar variant="rounded" sx={sectionIconStyle}>
                      <RoomServiceIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: '"Playfair Display", serif',
                          color: LUXURY.charcoal,
                          fontWeight: 800,
                        }}
                      >
                        2. Nâng Cấp Trải Nghiệm
                      </Typography>
                      <Typography variant="body2" color={LUXURY.warmGray}>
                        Thêm các dịch vụ để chuyến đi thêm hoàn hảo
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={2}>
                    {availableServices.map((svc) => {
                      const selectedItem = selectedServices[svc.id];
                      const isSelected = !!selectedItem;
                      const currentQty = selectedItem?.quantity || 0;

                      return (
                        <Box
                          key={svc.id}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            p: 2.5,
                            border: `2px solid ${isSelected ? LUXURY.gold : LUXURY.softGray}`,
                            borderRadius: "16px",
                            bgcolor: isSelected
                              ? `${LUXURY.gold}08`
                              : LUXURY.white,
                            transition: "all 0.3s ease",
                            "&:hover": { borderColor: LUXURY.gold },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Box>
                              <Typography
                                fontWeight="800"
                                color={LUXURY.charcoal}
                                fontSize="1.05rem"
                              >
                                {svc.name}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: LUXURY.warmGray,
                                  fontWeight: "600",
                                  mt: 0.5,
                                }}
                              >
                                {parseFloat(svc.price).toLocaleString()}đ{" "}
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    fontWeight: "normal",
                                  }}
                                >
                                  / lượt
                                </span>
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                bgcolor: LUXURY.offwhite,
                                borderRadius: "12px",
                                p: 0.5,
                              }}
                            >
                              <IconButton
                                sx={{
                                  color: isSelected
                                    ? LUXURY.charcoal
                                    : LUXURY.softGray,
                                }}
                                onClick={() => handleServiceChange(svc.id, -1)}
                                disabled={!isSelected}
                              >
                                <RemoveCircleIcon />
                              </IconButton>
                              <Typography
                                fontWeight="800"
                                sx={{
                                  width: 20,
                                  textAlign: "center",
                                  color: LUXURY.charcoal,
                                }}
                              >
                                {currentQty}
                              </Typography>
                              <IconButton
                                sx={{ color: LUXURY.gold }}
                                onClick={() => handleServiceChange(svc.id, 1)}
                              >
                                <AddCircleIcon />
                              </IconButton>
                            </Box>
                          </Box>

                          {isSelected && (
                            <Stack
                              spacing={2}
                              sx={{
                                mt: 2,
                                pt: 2,
                                borderTop: `1px dashed ${LUXURY.gold}50`,
                                width: "100%",
                              }}
                            >
                              {svc.service_type === "PreOrder" && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      mb: 0.5,
                                      fontWeight: 700,
                                      color: LUXURY.charcoal,
                                      display: "block",
                                    }}
                                  >
                                    Thời gian hẹn phục vụ (*)
                                  </Typography>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="datetime-local"
                                    value={selectedItem.usage_time || ""}
                                    onChange={(e) =>
                                      handleUpdateServiceField(
                                        svc.id,
                                        "usage_time",
                                        e.target.value,
                                      )
                                    }
                                    sx={inputStyle}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      mt: 0.5,
                                      color: LUXURY.warmGray,
                                      display: "block",
                                      fontStyle: "italic"
                                    }}
                                  >
                                    * Lưu ý: Hủy dịch vụ này sát giờ (dưới 2 tiếng) sẽ bị phạt 50% phí. Quá hạn phạt 100%.
                                  </Typography>
                                </Box>
                              )}

                              <TextField
                                fullWidth
                                size="small"
                                label="Yêu cầu đặc biệt cho dịch vụ này"
                                placeholder="VD: Phở không hành, xe tay ga màu đỏ, mang lên tận phòng..."
                                value={selectedItem.note || ""}
                                onChange={(e) =>
                                  handleUpdateServiceField(
                                    svc.id,
                                    "note",
                                    e.target.value,
                                  )
                                }
                                sx={inputStyle}
                              />
                            </Stack>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>

                {/* Thanh toán */}
                <Paper elevation={0} sx={paperSectionStyle}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 4 }}
                  >
                    <Avatar variant="rounded" sx={sectionIconStyle}>
                      <PaymentIcon />
                    </Avatar>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: '"Playfair Display", serif',
                        color: LUXURY.charcoal,
                        fontWeight: 800,
                      }}
                    >
                      3. Thanh Toán
                    </Typography>
                  </Stack>

                  <RadioGroup
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                  >
                    {/* Trả trước */}
                    <Box
                      sx={{
                        p: 3,
                        border: `2px solid ${formData.paymentMethod === "DepositOnline" ? LUXURY.navy : LUXURY.softGray}`,
                        borderRadius: "16px",
                        bgcolor:
                          formData.paymentMethod === "DepositOnline"
                            ? `${LUXURY.navy}08`
                            : "transparent",
                        mb: 3,
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          paymentMethod: "DepositOnline",
                        })
                      }
                    >
                      <FormControlLabel
                        value="DepositOnline"
                        control={
                          <Radio
                            sx={{
                              color: LUXURY.navy,
                              "&.Mui-checked": { color: LUXURY.navy },
                            }}
                          />
                        }
                        label={
                          <Typography
                            fontWeight="800"
                            color={LUXURY.charcoal}
                            fontSize="1.1rem"
                          >
                            Chuyển khoản trực tuyến (Cọc {policy.depositPercent}
                            %)
                          </Typography>
                        }
                      />
                      <Typography
                        variant="body1"
                        sx={{ ml: 4, color: LUXURY.warmGray, mt: 1 }}
                      >
                        Thanh toán qua cổng VNPay/MoMo/Banking để giữ phòng chắc
                        chắn 100%. Nhanh chóng và tiện lợi.
                      </Typography>
                      {formData.paymentMethod === "DepositOnline" &&
                        policy.holdUntilText && (
                          <Box
                            sx={{
                              ml: 4,
                              mt: 2,
                              p: 2,
                              bgcolor: LUXURY.white,
                              borderRadius: "12px",
                              border: `1px solid ${LUXURY.softGray}`,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color={LUXURY.charcoal}
                              fontWeight="600"
                            >
                              <AccessTimeIcon
                                sx={{
                                  fontSize: 18,
                                  verticalAlign: "middle",
                                  mr: 1,
                                  color: LUXURY.gold,
                                }}
                              />
                              {policy.holdUntilText}
                            </Typography>
                          </Box>
                        )}
                    </Box>

                    {/* Trả tại quầy */}
                    {(() => {
                      const disablePayAtDesk =
                        policy.isHighValue ||
                        policy.isLowTrust ||
                        policy.isHoliday;

                      return (
                        <Box
                          sx={{
                            p: 3,
                            border: `2px solid ${formData.paymentMethod === "PayAtDesk" ? LUXURY.navy : LUXURY.softGray}`,
                            borderRadius: "16px",
                            bgcolor:
                              formData.paymentMethod === "PayAtDesk"
                                ? `${LUXURY.navy}08`
                                : "transparent",
                            opacity: disablePayAtDesk ? 0.6 : 1,
                            transition: "all 0.3s ease",
                            cursor: disablePayAtDesk
                              ? "not-allowed"
                              : "pointer",
                          }}
                          onClick={() => {
                            if (!disablePayAtDesk)
                              setFormData({
                                ...formData,
                                paymentMethod: "PayAtDesk",
                              });
                          }}
                        >
                          <FormControlLabel
                            value="PayAtDesk"
                            control={
                              <Radio
                                sx={{
                                  color: LUXURY.navy,
                                  "&.Mui-checked": { color: LUXURY.navy },
                                }}
                              />
                            }
                            disabled={disablePayAtDesk}
                            label={
                              <Typography
                                fontWeight="800"
                                color={LUXURY.charcoal}
                                fontSize="1.1rem"
                              >
                                Thanh toán tại Lễ Tân
                              </Typography>
                            }
                          />

                          {/* HIỂN THỊ CẢNH BÁO THÔNG MINH */}
                          {disablePayAtDesk && (
                            <Typography
                              variant="body2"
                              color="error"
                              sx={{ ml: 4, mt: 1, fontWeight: "600" }}
                            >
                              {policy.isHoliday
                                ? "Giai đoạn Lễ/Tết bắt buộc phải đặt cọc trực tuyến để giữ phòng."
                                : policy.isLowTrust
                                  ? `Điểm tín nhiệm của bạn (${policy.userTrustScore}) quá thấp. Bắt buộc đặt cọc.`
                                  : `Đơn hàng trên ${HIGH_VALUE_THRESHOLD?.toLocaleString()}đ bắt buộc phải đặt cọc.`}
                            </Typography>
                          )}
                        </Box>
                      );
                    })()}
                  </RadioGroup>
                </Paper>
              </Box>
            </Slide>
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: "380px", lg: "450px" },
              flexShrink: 0,
              position: { md: "sticky" },
              top: 100,
            }}
          >
            <Slide direction="left" in={true} timeout={1000}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: "24px",
                  border: `1px solid ${LUXURY.softGray}`,
                  boxShadow: "0 24px 48px rgba(26,26,26,0.08)",
                  bgcolor: LUXURY.navy,
                  color: LUXURY.white,
                }}
              >
                <Typography
                  variant="caption"
                  color={LUXURY.gold}
                  fontWeight="800"
                  letterSpacing={2}
                >
                  TÓM TẮT ĐẶT PHÒNG
                </Typography>

                <Box sx={{ mt: 3, mb: 4 }}>
                  <Typography
                    variant="h4"
                    fontWeight="800"
                    sx={{ fontFamily: '"Playfair Display", serif', mb: 1 }}
                  >
                    {roomInfo.type_name}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    Lưu trú: {policy.totalDays} đêm
                  </Typography>
                </Box>

                <Divider
                  sx={{ mb: 3, borderColor: "rgba(255,255,255,0.15)" }}
                />

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      Giá phòng / đêm:
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {Number(roomInfo.base_price).toLocaleString("vi-VN")}đ
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      Tổng tiền phòng:
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {policy.roomTotal.toLocaleString()}đ
                    </Typography>
                  </Stack>

                  {/* ✨ HIỂN THỊ TIỀN LỄ RA BẢNG TÓM TẮT */}
                  {policy.surchargeAmount > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" sx={{ color: "#ef4444" }}>
                        Phụ thu Lễ/Tết:
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="600"
                        sx={{ color: "#ef4444" }}
                      >
                        +{policy.surchargeAmount.toLocaleString()}đ
                      </Typography>
                    </Stack>
                  )}

                  {policy.servicesTotal > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography
                        variant="body1"
                        sx={{ color: "rgba(255,255,255,0.8)" }}
                      >
                        Dịch vụ đi kèm:
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {policy.servicesTotal.toLocaleString()}đ
                      </Typography>
                    </Stack>
                  )}
                  {policy.discountAmount > 0 && (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ color: LUXURY.goldLight }}
                    >
                      <Typography variant="body1" fontWeight="600">
                        Mã giảm giá:
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        -{policy.discountAmount.toLocaleString()}đ
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                <Divider
                  sx={{ my: 3, borderColor: "rgba(255,255,255,0.15)" }}
                />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-end"
                  sx={{ mb: 4 }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 400 }}
                  >
                    Tổng thanh toán
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="800"
                    sx={{ color: LUXURY.gold }}
                  >
                    {policy.finalTotalAmount.toLocaleString()}đ
                  </Typography>
                </Stack>

                {/* Vùng Chọn Coupon */}
                <Box sx={{ mb: 4 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<LocalOfferIcon />}
                    onClick={() => setCouponDialogOpen(true)}
                    sx={{
                      color: LUXURY.gold,
                      borderColor: "rgba(212,175,55,0.5)",
                      borderRadius: "12px",
                      borderStyle: "dashed",
                      borderWidth: 1.5,
                      py: 1.5,
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: "700",
                      "&:hover": {
                        borderColor: LUXURY.gold,
                        bgcolor: "rgba(212,175,55,0.1)",
                        borderStyle: "dashed",
                        borderWidth: 1.5,
                      },
                    }}
                  >
                    {selectedCoupon
                      ? `ĐÃ ÁP MÃ: ${selectedCoupon.code}`
                      : "Chọn hoặc nhập mã ưu đãi"}
                  </Button>
                </Box>

                {/* Thông báo tiền cọc động từ Config */}
                <Box
                  sx={{
                    bgcolor: "rgba(255,255,255,0.05)",
                    p: 2.5,
                    borderRadius: "16px",
                    mb: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    color={
                      policy.depositAmount === 0 ? "#4ade80" : LUXURY.goldLight
                    }
                    fontWeight="600"
                  >
                    Cần đặt cọc ({policy.depositPercent}%)
                  </Typography>
                  <Typography
                    color={
                      policy.depositAmount === 0 ? "#4ade80" : LUXURY.white
                    }
                    variant="h6"
                    fontWeight="800"
                  >
                    {policy.depositAmount.toLocaleString()}đ
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
                    {error}
                  </Alert>
                )}

                {/* ✨ NÚT SUBMIT ĐÃ BỎ ONCLICK ĐỂ BẮT LỖI FORM CHUẨN HTML5 */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    background: `linear-gradient(135deg, ${LUXURY.gold} 0%, #B8962A 100%)`,
                    color: LUXURY.white,
                    py: 2,
                    fontWeight: "800",
                    borderRadius: "12px",
                    fontSize: "1.1rem",
                    boxShadow: `0 12px 24px ${LUXURY.gold}40`,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 16px 32px ${LUXURY.gold}60`,
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "XÁC NHẬN ĐẶT PHÒNG"
                  )}
                </Button>

                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={1}
                  sx={{ mt: 3, color: "rgba(255,255,255,0.6)" }}
                >
                  <SecurityIcon sx={{ fontSize: 18 }} />
                  <Typography
                    variant="caption"
                    fontWeight="500"
                    letterSpacing={0.5}
                  >
                    Giao dịch được mã hóa bảo mật 256-bit
                  </Typography>
                </Stack>
              </Paper>
            </Slide>
          </Box>
        </Box>
      </Container>

      {/* QR code */}
      <Dialog
        open={qrDialogOpen}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            bgcolor: LUXURY.white,
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* CONTAINER CHÍNH SỬ DỤNG FLEXBOX */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "stretch",
              minHeight: { md: "480px" },
            }}
          >
            <Box
              sx={{
                flex: { xs: "1 1 auto", md: "0 0 42%" },
                bgcolor: LUXURY.offwhite,
                p: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRight: { md: `2px dashed ${LUXURY.softGray}` },
                borderBottom: {
                  xs: `2px dashed ${LUXURY.softGray}`,
                  md: "none",
                },
              }}
            >
              <CheckCircleIcon
                sx={{ fontSize: 56, color: "#16a34a", mb: 1.5 }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 900,
                  color: LUXURY.charcoal,
                  mb: 0.5,
                }}
              >
                Tuyệt Vời!
              </Typography>
              <Typography
                variant="body2"
                color={LUXURY.warmGray}
                sx={{ mb: 2.5, textAlign: "center", px: 2 }}
              >
                Đơn đặt phòng{" "}
                <b style={{ color: LUXURY.navy }}>
                  #{createdBooking?.booking_id}
                </b>{" "}
                đã được tạo.
              </Typography>

              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  border: `1px solid ${LUXURY.softGray}`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={`https://img.vietqr.io/image/${bankId}-${bankAccount}-compact2.png?amount=${createdBooking?.deposit_required}&addInfo=DatPhong%20${createdBooking?.booking_id}&accountName=${accountName}`}
                  alt="QR Payment"
                  style={{
                    width: "180px",
                    height: "180px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  mt: 1.5,
                  color: LUXURY.warmGray,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                QUÉT MÃ ĐỂ THANH TOÁN CỌC
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: { xs: 3.5, md: 4.5 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Stack spacing={2.5} sx={{ width: "100%" }}>
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight="800"
                    color={LUXURY.warmGray}
                    letterSpacing={1}
                  >
                    SỐ TIỀN CẦN THANH TOÁN
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="900"
                    color={LUXURY.navy}
                    sx={{ mt: 0.5 }}
                  >
                    {parseFloat(
                      createdBooking?.deposit_required || 0,
                    ).toLocaleString()}
                    đ
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    fontWeight="800"
                    color={LUXURY.warmGray}
                    letterSpacing={1}
                  >
                    NỘI DUNG CHUYỂN KHOẢN CHÍNH XÁC
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.8,
                      mt: 0.5,
                      bgcolor: `${LUXURY.gold}10`,
                      border: `1px solid ${LUXURY.gold}60`,
                      borderRadius: "12px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="900"
                      color={LUXURY.charcoal}
                      letterSpacing={0.5}
                    >
                      DatPhong {createdBooking?.booking_id}
                    </Typography>
                  </Paper>
                </Box>

                <Alert
                  severity="warning"
                  icon={
                    <AccessTimeIcon
                      sx={{ color: `${LUXURY.gold} !important` }}
                    />
                  }
                  sx={{
                    borderRadius: "12px",
                    bgcolor: `${LUXURY.gold}12`,
                    color: LUXURY.charcoal,
                    border: `1px solid ${LUXURY.gold}30`,
                    fontSize: "0.85rem",
                    alignItems: "center",
                    py: 0.5,
                  }}
                >
                  Hệ thống tự động hủy đơn sau <b>15 phút</b> nếu chưa nhận được
                  tiền cọc.
                </Alert>
              </Stack>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    background: `linear-gradient(135deg, ${LUXURY.navy} 0%, #2a4374 100%)`,
                    color: LUXURY.white,
                    fontWeight: "800",
                    py: 1.6,
                    borderRadius: "12px",
                    fontSize: "1rem",
                    boxShadow: "0 8px 20px rgba(27,45,79,0.15)",
                    textTransform: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 12px 28px rgba(27,45,79,0.25)",
                    },
                  }}
                  onClick={() => navigate("/profile")}
                >
                  TÔI ĐÃ CHUYỂN KHOẢN
                </Button>

                <Typography
                  variant="body2"
                  textAlign="center"
                  sx={{
                    color: LUXURY.warmGray,
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: 600,
                    mt: 1.5,
                    fontSize: "0.85rem",
                    "&:hover": { color: LUXURY.charcoal },
                  }}
                  onClick={() => setQrDialogOpen(false)}
                >
                  Đóng và kiểm tra lại đơn phòng
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* MÃ giảm giá*/}
      <Dialog
        open={couponDialogOpen}
        onClose={() => setCouponDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "24px", bgcolor: LUXURY.offwhite } }}
      >
        <DialogTitle
          sx={{
            fontWeight: "900",
            fontFamily: '"Playfair Display", serif',
            color: LUXURY.charcoal,
            textAlign: "center",
            pt: 4,
            fontSize: "1.8rem",
          }}
        >
          Đặc Quyền Của Bạn
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
          {availableCoupons.length === 0 ? (
            <Typography
              textAlign="center"
              color={LUXURY.warmGray}
              sx={{ py: 4, fontStyle: "italic" }}
            >
              Hiện tại bạn chưa có mã ưu đãi nào.
            </Typography>
          ) : (
            availableCoupons.map((coupon) => (
              <Paper
                key={coupon.id}
                elevation={0}
                onClick={() => handleSelectCoupon(coupon)}
                sx={{
                  mb: 3,
                  cursor: "pointer",
                  p: 3,
                  borderRadius: "16px",
                  border:
                    selectedCoupon?.id === coupon.id
                      ? `2px solid ${LUXURY.gold}`
                      : `1px solid ${LUXURY.softGray}`,
                  bgcolor:
                    selectedCoupon?.id === coupon.id
                      ? `${LUXURY.gold}08`
                      : LUXURY.white,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: LUXURY.gold,
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px rgba(212,175,55,0.15)",
                  },
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "12px",
                    bgcolor: LUXURY.navy,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: LUXURY.gold,
                    flexShrink: 0,
                  }}
                >
                  <LocalOfferIcon fontSize="large" />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight="900"
                    color={LUXURY.charcoal}
                  >
                    {coupon.code}
                  </Typography>
                  <Typography variant="body2" color={LUXURY.warmGray} mb={1}>
                    {coupon.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "700",
                      color: "#d84315",
                      bgcolor: "#fbe9e7",
                      px: 1,
                      py: 0.5,
                      borderRadius: "6px",
                    }}
                  >
                    Điều kiện: Đơn từ{" "}
                    {Number(coupon.min_order_value).toLocaleString()}đ
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                  <Typography
                    variant="h5"
                    fontWeight="900"
                    sx={{ color: LUXURY.gold }}
                  >
                    {coupon.discount_type === "PERCENTAGE" ||
                    coupon.discount_type === "Percentage"
                      ? `-${parseFloat(coupon.discount_value)}%`
                      : `-${Number(coupon.discount_value).toLocaleString()}đ`}
                  </Typography>
                </Box>
              </Paper>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0, justifyContent: "space-between" }}>
          <Button
            onClick={() => {
              setSelectedCoupon(null);
              setCouponDialogOpen(false);
            }}
            sx={{ color: LUXURY.warmGray, fontWeight: "700" }}
            disabled={!selectedCoupon}
          >
            Bỏ chọn mã
          </Button>
          <Button
            onClick={() => setCouponDialogOpen(false)}
            variant="contained"
            sx={{
              bgcolor: LUXURY.charcoal,
              color: LUXURY.gold,
              fontWeight: "800",
              borderRadius: "10px",
              px: 4,
              "&:hover": { bgcolor: "black" },
            }}
          >
            ĐÓNG
          </Button>
        </DialogActions>
      </Dialog>

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
          sx={{ width: "100%", borderRadius: "12px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Booking;
