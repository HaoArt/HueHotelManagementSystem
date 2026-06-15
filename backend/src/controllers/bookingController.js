const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");
const RoomType = require("../models/roomTypeModel");
const Coupon = require("../models/couponModel");
const User = require("../models/userModel");
const Review = require("../models/reviewModel");
const Audit = require("../models/auditModel");
const Folio = require("../models/folioModel");
const pdfService = require("../services/pdfService");
const Surcharge = require("../models/surchargeModel");
const db = require("../config/db");
const Service = require("../models/serviceModel");
const SystemConfig = require("../models/configModel");
const emailService = require("../utils/emailService");

exports.createBooking = async (req, res) => {
  let connection;
  try {
    const {
      room_type_id,
      check_in,
      check_out,
      coupon_code,
      payment_method,
      note,
      services,
    } = req.body;
    const user_id = req.user.id || req.user.userId;
    const user = await User.findById(user_id);

    // Chặn hoàn toàn thao tác nếu điểm tín nhiệm < 0 hoặc tài khoản đã bị khóa
    if (user.trust_score < 0 || user.status === "Locked") {
      return res.status(403).json({
        status: "error",
        message: "Tài khoản của bạn đã bị khóa do điểm tín nhiệm dưới 0. Không thể đặt phòng!",
      });
    }

    //Lấy cấu hình đặt cọc
    const configs = await SystemConfig.getAll();
    const depositConfig = configs.find(
      (c) => c.config_key === "deposit_percent",
    );
    const baseDepositRate = depositConfig
      ? parseFloat(depositConfig.config_value) / 100
      : 0.3;

    const leadTimeDays = Math.ceil(
      (new Date(check_in) - new Date()) / (1000 * 60 * 60 * 24),
    );

    // Kiểm tra treo phòng
    const pendingCount = await Booking.countPendingBookingsByUserId(user_id);
    if (pendingCount >= 1) {
      return res.status(429).json({
        status: "error",
        message: "Bạn đang có 1 đơn đặt phòng chưa thanh toán!",
      });
    }

    // Kiểm tra điểm tín nhiệm
    if (user.trust_score < 80 && payment_method === "PayAtDesk") {
      return res.status(400).json({
        status: "error",
        message:
          "Điểm tín nhiệm của bạn dưới 80. Bạn bắt buộc phải thanh toán Online/Đặt cọc để giữ phòng!",
      });
    }

    // Dùng setHours tránh lỗi đặt phòng trong ngày
    if (
      new Date().setHours(0, 0, 0, 0) > new Date(check_in).setHours(0, 0, 0, 0)
    ) {
      return res
        .status(400)
        .json({ message: "Ngày nhận phòng không được nằm trong quá khứ!" });
    }
    if (
      new Date(check_in).setHours(0, 0, 0, 0) >=
      new Date(check_out).setHours(0, 0, 0, 0)
    ) {
      return res.status(400).json({
        message: "Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm!",
      });
    }

    const availableRooms = await Booking.findAvailableRooms(
      room_type_id,
      check_in,
      check_out,
    );
    if (availableRooms.length === 0) {
      return res.status(404).json({
        message:
          "Rất tiếc, loại phòng này đã hết chỗ trong thời gian bạn chọn.",
      });
    }

    const selectedRoom = availableRooms[0];

    // Bắt đầu Database Transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Khóa căn phòng này lại để người khác không đặt trùng
    const isLocked = await Booking.lockRoomOptimistic(
      selectedRoom.id,
      selectedRoom.version,
      connection,
    );
    if (!isLocked) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({
        status: "error",
        message:
          "Rất tiếc! Có người khác vừa nhanh tay đặt căn phòng này trước bạn vài giây. Vui lòng thử lại!",
      });
    }

    const roomType = await RoomType.getById(room_type_id);

    // Tính phụ thu lễ tết
    const surchargeRules = await Surcharge.getAppliedRules(check_in, check_out);
    let isHighSeason = false;
    let baseTotal = 0;
    let surchargeAmount = 0;

    const checkInDate = new Date(check_in);
    checkInDate.setHours(0, 0, 0, 0);
    const checkOutDate = new Date(check_out);
    checkOutDate.setHours(0, 0, 0, 0);

    let currentDate = new Date(checkInDate);
    // Duyệt qua từng đêm lưu trú để tính tiền
    while (currentDate < checkOutDate) {
      baseTotal += parseFloat(roomType.base_price);

      // Tìm các quy tắc lễ tết bao phủ đêm hiện tại
      const appliedRulesForNight = surchargeRules.filter((rule) => {
        const ruleStart = new Date(rule.start_date).setHours(0, 0, 0, 0);
        const ruleEnd = new Date(rule.end_date).setHours(23, 59, 59, 999);
        return (
          currentDate.getTime() >= ruleStart && currentDate.getTime() <= ruleEnd
        );
      });

      if (appliedRulesForNight.length > 0) {
        isHighSeason = true;
        const maxSurchargePercent = Math.max(
          ...appliedRulesForNight.map((r) => parseFloat(r.surcharge_percent)),
        );
        surchargeAmount +=
          (parseFloat(roomType.base_price) * maxSurchargePercent) / 100;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Chặn thanh toán tại quầy trong mùa cao điểm
    if (isHighSeason && payment_method === "PayAtDesk") {
      await connection.rollback();
      connection.release();
      return res.status(403).json({
        status: "error",
        message:
          "Giai đoạn Lễ/Tết không áp dụng thanh toán tại quầy. Vui lòng chuyển khoản để đặt trước phòng.",
      });
    }
    let servicesTotalAmount = 0;
    let validServices = [];
    // Xử lý dịch vụ kèm theo nếu có
    if (services && services.length > 0) {
      for (let s of services) {
        if (s.quantity > 0) {
          const svcData = await Service.getPriceById(s.service_id);
          if (svcData) {
            const price = parseFloat(svcData.price);
            const lineTotal = price * s.quantity;
            servicesTotalAmount += lineTotal;
            validServices.push({
              service_id: s.service_id,
              quantity: s.quantity,
              total_price: lineTotal,
              usage_time: s.usage_time || null,
              note: s.note || "",
            });
          }
        }
      }
    }

    // Tổng hóa đơn để tính toán chiết khấu (Phòng + Lễ + Dịch vụ)
    let totalForDiscount = baseTotal + surchargeAmount + servicesTotalAmount;

    // Lấy mức giảm giá theo rank
    const rankInfo = await User.getRankBySpending(user.total_spent || 0);
    let rankDiscountPercent = rankInfo ? rankInfo.discount_percent : 0;
    let rankName = rankInfo ? rankInfo.rank_name : "Đồng";

    let rankDiscountAmount = (totalForDiscount * rankDiscountPercent) / 100;
    let totalAfterRank = totalForDiscount - rankDiscountAmount;
    let totalDiscountAmount = rankDiscountAmount;

    let couponDiscountAmount = 0;
    let appliedCouponId = null;

    if (coupon_code) {
      const coupon = await Coupon.findByCode(coupon_code);
      if (!coupon || new Date() > new Date(coupon.expiry_date)) {
        await connection.rollback();
        connection.release();
        return res
          .status(400)
          .json({ message: "Mã giảm giá không tồn tại hoặc đã hết hạn!" });
      }
      if (coupon.used_count >= coupon.usage_limit) {
        await connection.rollback();
        connection.release();
        return res
          .status(400)
          .json({ message: "Mã giảm giá đã hết lượt sử dụng!" });
      }
      if (totalAfterRank < coupon.min_order_value) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          message: `Mã này chỉ áp dụng cho đơn hàng từ ${Number(
            coupon.min_order_value,
          ).toLocaleString("vi-VN")} VNĐ`,
        });
      }

      const [usedCheck] = await connection.query(
        "SELECT id FROM bookings WHERE user_id = ? AND coupon_id = ? AND status != 'Cancelled'",
        [user_id, coupon.id],
      );
      if (usedCheck.length > 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          message:
            "Bạn đã sử dụng mã giảm giá này cho một đơn đặt phòng trước đó rồi!",
        });
      }

      if (coupon.discount_type === "Percentage") {
        couponDiscountAmount = (totalAfterRank * coupon.discount_value) / 100;
        if (
          coupon.max_discount_value &&
          couponDiscountAmount > coupon.max_discount_value
        ) {
          couponDiscountAmount = coupon.max_discount_value;
        }
      } else {
        couponDiscountAmount = coupon.discount_value;
      }
      totalDiscountAmount = totalDiscountAmount + couponDiscountAmount;
      appliedCouponId = coupon.id;
    }

    let grandTotalAmount = totalForDiscount - totalDiscountAmount;
    let finalRoomTotalAmountToSave =
      baseTotal + surchargeAmount - totalDiscountAmount;

    let deposit_amount = 0;
    let initial_status = "Pending";
    let hold_until = null;
    //Giá trị mặc định phải đặt cọc
    const HIGH_VALUE_THRESHOLD = 4000000;
    if (
      grandTotalAmount >= HIGH_VALUE_THRESHOLD &&
      payment_method === "PayAtDesk"
    ) {
      await connection.rollback();
      connection.release();
      return res.status(403).json({
        status: "error",
        message:
          "Từ chối giao dịch: Đơn đặt phòng có giá trị từ 4.000.000 VNĐ trở lên bắt buộc phải thanh toán/đặt cọc Online.",
      });
    }

    if (payment_method === "PayAtDesk") {
      if (leadTimeDays > 14) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          status: "error",
          message:
            "Với khoảng cách đặt phòng trên 14 ngày, bạn bắt buộc phải thanh toán Online để giữ phòng.",
        });
      }

      deposit_amount = 0;
      initial_status = "Confirmed";
      let holdTime = new Date(check_in);
      if (leadTimeDays >= 1 && leadTimeDays <= 3) {
        holdTime.setHours(14, 0, 0, 0); // Giữ đến 14:00
      } else if (leadTimeDays > 3 && leadTimeDays <= 14) {
        holdTime.setHours(18, 0, 0, 0); // Giữ đến 18:00
      } else {
        holdTime = new Date();
        holdTime.setHours(holdTime.getHours() + 2);
      }
      hold_until = holdTime;
    } else {
      // Nếu khách thanh toán Online Lễ tết ép cọc 50%
      let depositRate = isHighSeason ? 0.5 : baseDepositRate;
      deposit_amount = grandTotalAmount * depositRate;
      initial_status = "Pending";

      let pendingTime = new Date();
      pendingTime.setMinutes(pendingTime.getMinutes() + 15);
      hold_until = pendingTime; // Giữ 15 phút chờ chuyển khoản
    }

    let metadata = {
      customer_note: note || "",
      holiday_surcharge: surchargeAmount > 0 ? surchargeAmount : 0,
      logs: []
    };
    if (surchargeAmount > 0) {
      metadata.logs.push(`Phụ thu lễ/tết: ${surchargeAmount.toLocaleString("vi-VN")}đ`);
    }

    const bookingId = await Booking.create(
      {
        user_id,
        room_type_id: room_type_id,
        room_id: selectedRoom.id,
        check_in,
        check_out,
        total_amount: finalRoomTotalAmountToSave,
        deposit_amount: deposit_amount,
        coupon_id: appliedCouponId,
        discount_amount: totalDiscountAmount,
        status: initial_status,
        hold_until: hold_until,
        note: JSON.stringify(metadata),
        payment_method: payment_method,
        payment_status: "Unpaid",
      },
      connection,
    );

    if (validServices.length > 0) {
      for (let s of validServices) {
        await Folio.addServiceToBooking(
          bookingId,
          s.service_id,
          s.quantity,
          s.total_price,
          s.usage_time,
          s.note,
          connection,
        );
      }
    }

    if (appliedCouponId) {
      const isCouponValid = await Coupon.incrementUsageSafe(
        appliedCouponId,
        connection,
      );

      if (!isCouponValid) {
        await connection.rollback();
        connection.release();
        return res.status(409).json({
          status: "error",
          message:
            "Rất tiếc! Mã giảm giá vừa được người khác nhanh tay sử dụng hết lượt cuối cùng.",
        });
      }
    }
    await connection.commit();
    connection.release();

    const formattedHoldTime = hold_until.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

    return res.status(201).json({
      status: "OK",
      message:
        payment_method === "PayAtDesk"
          ? `Đặt phòng thành công! ${rankDiscountPercent > 0 ? `Bạn được giảm ${rankDiscountPercent}% nhờ hạng thành viên ${rankName}.` : ""} Khách sạn sẽ giữ phòng đến ${formattedHoldTime}.`
          : "Vui lòng thanh toán tiền cọc trong vòng 15 phút!",
      booking_id: bookingId,
      original_price: grandTotalAmount + totalDiscountAmount, // Tiền trước khi giảm
      discount: totalDiscountAmount,
      total_amount: grandTotalAmount, // Tiền cuối cùng khách phải chịu
      deposit_required: deposit_amount, // Số tiền cọc cần chuyển ngay
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("Lỗi Controller Booking:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.createWalkInBooking = async (req, res) => {
  try {
    const {
      full_name,
      phone,
      room_id,
      check_in,
      check_out,
      deposit_amount,
      note,
    } = req.body;
    const room = await Room.getById(room_id);
    if (!room) {
      return res
        .status(404)
        .json({ message: "Phòng không tồn tại trên hệ thống!" });
    }

    if (room.status !== "Available") {
      return res.status(400).json({
        message: `Phòng ${room.room_number} hiện đang ở trạng thái ${room.status}. Vui lòng chọn phòng khác!`,
      });
    }

    let user_id;
    const existingUser = await User.findByPhone(phone);

    if (existingUser) {
      user_id = existingUser.id;
    } else {
      const dummyEmail = `walkin_${phone}_${Date.now()}@huehotel.local`;
      user_id = await User.createGuestUser(full_name, phone, dummyEmail);
    }

    const roomType = await RoomType.getById(room.room_type_id);
    const diffDays = Math.ceil(
      Math.abs(new Date(check_out) - new Date(check_in)) /
        (1000 * 60 * 60 * 24),
    );
    const actualDays = diffDays === 0 ? 1 : diffDays;

    // Tính phụ thu lễ tết cho Walk-in
    const surchargeRules = await Surcharge.getAppliedRules(check_in, check_out);
    let baseTotal = 0;
    let surchargeAmount = 0;

    const checkInDateWalkIn = new Date(check_in);
    checkInDateWalkIn.setHours(0, 0, 0, 0);
    const checkOutDateWalkIn = new Date(check_out);
    checkOutDateWalkIn.setHours(0, 0, 0, 0);
    let currentDateWalkIn = new Date(checkInDateWalkIn);

    while (currentDateWalkIn < checkOutDateWalkIn) {
      baseTotal += parseFloat(roomType.base_price);
      const appliedRulesForNight = surchargeRules.filter((rule) => {
        const ruleStart = new Date(rule.start_date).setHours(0, 0, 0, 0);
        const ruleEnd = new Date(rule.end_date).setHours(23, 59, 59, 999);
        return (
          currentDateWalkIn.getTime() >= ruleStart &&
          currentDateWalkIn.getTime() <= ruleEnd
        );
      });
      if (appliedRulesForNight.length > 0) {
        const maxSurchargePercent = Math.max(
          ...appliedRulesForNight.map((r) =>
            parseFloat(r.surcharge_percent || 0),
          ),
        );
        surchargeAmount +=
          (parseFloat(roomType.base_price) * maxSurchargePercent) / 100;
      }
      currentDateWalkIn.setDate(currentDateWalkIn.getDate() + 1);
    }

    if (actualDays === 1 && baseTotal === 0) {
      baseTotal = parseFloat(roomType.base_price);
    }

    const finalTotalAmount = baseTotal + surchargeAmount;
    const paymentStatus =
      parseFloat(deposit_amount || 0) >= finalTotalAmount ? "Paid" : "Unpaid";

    let metadata = {
      customer_note: note || "Khách Walk-in trực tiếp tại quầy lễ tân",
      holiday_surcharge: surchargeAmount > 0 ? surchargeAmount : 0,
      logs: []
    };
    if (surchargeAmount > 0) {
      metadata.logs.push(`Phụ thu lễ/tết: ${surchargeAmount.toLocaleString("vi-VN")}đ`);
    }

    const bookingId = await Booking.createWalkIn({
      user_id: user_id,
      room_type_id: room.room_type_id,
      room_id: room.id,
      check_in: check_in,
      check_out: check_out,
      total_amount: finalTotalAmount,
      deposit_amount: deposit_amount || 0,
      status: "Checked_in",
      payment_method: "PayAtDesk",
      payment_status: paymentStatus,
      note: JSON.stringify(metadata),
    });

    await Room.updateStatus(room.id, "Occupied");

    const adminId = req.user?.id || req.user?.userId || 1;
    const clientIp =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

    await Audit.logAction(
      adminId,
      "WALK_IN_CHECKIN",
      bookingId,
      { status: "Available" },
      { status: "Occupied", room: room.room_number },
      clientIp,
    );

    return res.status(201).json({
      status: "OK",
      message: `Check-in thành công! Đã giao phòng ${room.room_number} cho khách ${full_name}.`,
      booking_id: bookingId,
      total_amount: finalTotalAmount,
    });
  } catch (error) {
    console.error("Lỗi tạo đơn Walk-in:", error);
    return res.status(500).json({
      status: "error",
      message: "Lỗi hệ thống khi xử lý Check-in tại quầy",
    });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { override_room_id } = req.body;

    const booking = await Booking.getById(id);
    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy thông tin đặt phòng!",
      });
    }

    if (booking.status !== "Confirmed" && booking.status !== "Pending") {
      return res.status(400).json({
        status: "error",
        message: "Trạng thái đơn không hợp lệ để Check-in",
      });
    }

    const actualToday = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expectedCheckInDate = new Date(booking.check_in_date);
    expectedCheckInDate.setHours(0, 0, 0, 0);

    const expectedCheckOutDate = new Date(booking.check_out_date);
    expectedCheckOutDate.setHours(0, 0, 0, 0);

    if (today >= expectedCheckOutDate) {
      return res.status(400).json({
        status: "error",
        message:
          "Lỗi: Đơn đặt phòng này đã hết hạn lưu trú từ trước, không thể Check-in nữa!",
      });
    }

    let targetRoomId = override_room_id || booking.room_id;
    const room = await Room.getById(targetRoomId);

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy phòng vật lý trên hệ thống!",
      });
    }

    if (today < expectedCheckInDate) {
      if (room.status !== "Available") {
        return res.status(400).json({
          status: "error",
          message: `Phòng ${room.room_number} đêm nay hiện tại đang bận hoặc chưa dọn dẹp (Trạng thái: ${room.status}). Vui lòng chọn đổi sang một phòng trống khác ngay giao diện này trước khi xác nhận Check-in sớm ngày!`,
        });
      }
      //số đêm đến sớm phát sinh thực tế
      const diffInMs = expectedCheckInDate - today;
      const extraNights = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

      const roomType = await RoomType.getById(booking.room_type_id);

      let extraChargeAmount = 0;
      let earlySurchargeAmount = 0;
      const surchargeRules = await Surcharge.getAppliedRules(
        today,
        expectedCheckInDate,
      );
      let currentEarlyDate = new Date(today);

      while (currentEarlyDate < expectedCheckInDate) {
        extraChargeAmount += parseFloat(roomType.base_price);
        const appliedRulesForNight = surchargeRules.filter((rule) => {
          const ruleStart = new Date(rule.start_date).setHours(0, 0, 0, 0);
          const ruleEnd = new Date(rule.end_date).setHours(23, 59, 59, 999);
          return (
            currentEarlyDate.getTime() >= ruleStart &&
            currentEarlyDate.getTime() <= ruleEnd
          );
        });
        if (appliedRulesForNight.length > 0) {
          const maxSurchargePercent = Math.max(
            ...appliedRulesForNight.map((r) =>
              parseFloat(r.surcharge_percent || 0),
            ),
          );
          earlySurchargeAmount +=
            (parseFloat(roomType.base_price) * maxSurchargePercent) / 100;
        }
        currentEarlyDate.setDate(currentEarlyDate.getDate() + 1);
      }

      const totalExtra = extraChargeAmount + earlySurchargeAmount;
      const newTotalAmount = parseFloat(booking.total_amount) + totalExtra;

      //Thực hiện cập nhật lùi ngày check-in và tăng tổng tiền đơn đặt phòng trong DB
      let metadata = { customer_note: "", logs: [] };
      try {
        const parsed = JSON.parse(booking.note);
        if (parsed && typeof parsed === "object") {
          metadata = parsed;
        } else {
          metadata.customer_note = booking.note || "";
        }
      } catch(e) { metadata.customer_note = booking.note || ""; }
      if (!metadata.logs) metadata.logs = [];

      metadata.early_in_surcharge = (metadata.early_in_surcharge || 0) + extraChargeAmount;
      metadata.logs.push(`Tự động tính thêm ${extraNights} đêm do khách Check-in sớm vào lúc ${actualToday.toLocaleString("vi-VN")} (Phí: ${extraChargeAmount.toLocaleString("vi-VN")}đ)`);

      if (earlySurchargeAmount > 0) {
        metadata.holiday_surcharge = (metadata.holiday_surcharge || 0) + earlySurchargeAmount;
        metadata.logs.push(`Phụ thu lễ/tết cho những đêm đến sớm (${earlySurchargeAmount.toLocaleString("vi-VN")}đ)`);
      }

      await Booking.updateEarlyCheckIn(
        id,
        actualToday,
        newTotalAmount,
        JSON.stringify(metadata)
      );
    }

    if (override_room_id && override_room_id != booking.room_id) {
      if (room.status !== "Available" && today >= expectedCheckInDate) {
        return res.status(400).json({
          status: "error",
          message: "Phòng thay thế hiện tại không sẵn sàng!",
        });
      }

      if (room.room_type_id !== booking.room_type_id) {
        await Booking.upgradeRoomFree(id, override_room_id);
      } else {
        await Booking.updateRoomId(id, override_room_id);
      }
    }

    if (room.status !== "Available" && today >= expectedCheckInDate) {
      return res.status(400).json({
        status: "error",
        message: `Phòng ${room.room_number} hiện chưa sẵn sàng (Đang ${room.status}). Vui lòng chờ khách cũ trả phòng/dọn dẹp xong, hoặc Lễ tân hãy Đổi sang phòng trống khác!`,
      });
    }

    await Booking.updateStatus(id, "Checked_in");

    await Room.updateStatus(targetRoomId, "Occupied");
    await User.updateTrustScore(booking.user_id, 5);

    const adminId = req.user?.id || req.user?.userId || 1;
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    await Audit.logAction(
      adminId,
      "CHECK_IN",
      id,
      { status: booking.status, room: booking.room_number },
      { status: "Checked_in", room: room.room_number },
      clientIp
    ).catch(err => console.error("Lỗi ghi log Audit Check-in:", err));

    return res.status(200).json({
      status: "OK",
      message: `Đã xử lý Check-in thành công khách vào phòng ${room.room_number}.`,
    });
  } catch (error) {
    console.error("Lỗi Check-in tổng hợp:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.getById(id);

    if (!booking) {
      return res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy đơn!" });
    }

    if (booking.status !== "Checked_in") {
      return res.status(400).json({
        status: "error",
        message: "Trạng thái không hợp lệ để Check-out",
      });
    }

    const actualToday = new Date();
    const checkInTime = new Date(booking.check_in_date);
    const roomType = await RoomType.getById(booking.room_type_id);

    const basePrice = parseFloat(roomType.base_price);
    let newTotalAmount = parseFloat(booking.total_amount);
    
    let metadata = { customer_note: "", logs: [] };
    try {
      const parsed = JSON.parse(booking.note);
      if (parsed && typeof parsed === "object") {
        metadata = parsed;
      } else {
        metadata.customer_note = booking.note || "";
      }
    } catch(e) { metadata.customer_note = booking.note || ""; }
    if (!metadata.logs) metadata.logs = [];

    if (checkInTime.toDateString() === actualToday.toDateString()) {
      const diffInMs = Math.abs(actualToday - checkInTime);
      let actualHours = Math.ceil(diffInMs / (1000 * 60 * 60));

      if (actualHours === 0) actualHours = 1;

      let calculatedRoomAmount = 0;
      if (actualHours === 1) {
        calculatedRoomAmount = basePrice * 0.2;
      } else if (actualHours === 2) {
        calculatedRoomAmount = basePrice * 0.3;
      } else {
        calculatedRoomAmount = basePrice * 0.3 + (actualHours - 2) * (basePrice * 0.1);
      }

      if (calculatedRoomAmount > basePrice) {
        calculatedRoomAmount = basePrice;
      }

      newTotalAmount = calculatedRoomAmount - parseFloat(booking.discount_amount || 0);
      metadata.logs.push(`Chuyển đổi sang biểu giá Day-use ở thực tế ${actualHours} giờ (${calculatedRoomAmount.toLocaleString("vi-VN")}đ)`);

      await Booking.updateCheckoutDateAndAmount(
        id,
        actualToday,
        newTotalAmount,
        JSON.stringify(metadata)
      );
    } else {
      // Logic dành cho khách ở qua đêm (Khác ngày)
      const configs = await SystemConfig.getAll();
      const checkOutConfig = configs.find(
        (c) => c.config_key === "check_out_time",
      );
      const checkOutHour = checkOutConfig
        ? parseInt(checkOutConfig.config_value.split(":")[0])
        : 12;

      const expectedCheckOut = new Date(booking.check_out_date);
      const actualTodayZero = new Date(actualToday).setHours(0, 0, 0, 0);
      const expectedCheckOutZero = new Date(expectedCheckOut).setHours(
        0,
        0,
        0,
        0,
      );

      if (actualTodayZero > expectedCheckOutZero) {
        let extraDays = Math.round(
          (actualTodayZero - expectedCheckOutZero) / (1000 * 60 * 60 * 24),
        );

        let extraChargeAmount = 0;
        let overstaySurchargeAmount = 0;
        const surchargeRules = await Surcharge.getAppliedRules(
          expectedCheckOutZero,
          actualTodayZero,
        );
        let currentOverstayDate = new Date(expectedCheckOutZero);

        while (currentOverstayDate < actualTodayZero) {
          extraChargeAmount += basePrice;
          const appliedRulesForNight = surchargeRules.filter((rule) => {
            const ruleStart = new Date(rule.start_date).setHours(0, 0, 0, 0);
            const ruleEnd = new Date(rule.end_date).setHours(23, 59, 59, 999);
            return (
              currentOverstayDate.getTime() >= ruleStart &&
              currentOverstayDate.getTime() <= ruleEnd
            );
          });
          if (appliedRulesForNight.length > 0) {
            const maxSurchargePercent = Math.max(
              ...appliedRulesForNight.map((r) =>
                parseFloat(r.surcharge_percent || 0),
              ),
            );
            overstaySurchargeAmount +=
              (basePrice * maxSurchargePercent) / 100;
          }
          currentOverstayDate.setDate(currentOverstayDate.getDate() + 1);
        }

        const totalExtra = extraChargeAmount + overstaySurchargeAmount;
        newTotalAmount += totalExtra;

        metadata.overstay_surcharge = (metadata.overstay_surcharge || 0) + extraChargeAmount;
        metadata.logs.push(`Phụ thu ở lố ${extraDays} đêm (${extraChargeAmount.toLocaleString("vi-VN")}đ)`);
        if (overstaySurchargeAmount > 0) {
          metadata.holiday_surcharge = (metadata.holiday_surcharge || 0) + overstaySurchargeAmount;
          metadata.logs.push(`Phụ thu lễ/tết cho những đêm ở lố (${overstaySurchargeAmount.toLocaleString("vi-VN")}đ)`);
        }
      } else if (actualTodayZero < expectedCheckOutZero) {
        // TRẢ PHÒNG SỚM HƠN DỰ KIẾN
        let earlyDays = Math.round(
          (expectedCheckOutZero - actualTodayZero) / (1000 * 60 * 60 * 24),
        );
        let refundRoomAmount = 0;
        let refundHolidayAmount = 0;
        
        const surchargeRules = await Surcharge.getAppliedRules(actualTodayZero, expectedCheckOutZero);
        let currentRefundDate = new Date(actualTodayZero);

        while (currentRefundDate < expectedCheckOutZero) {
          refundRoomAmount += basePrice;
          const appliedRulesForNight = surchargeRules.filter((rule) => {
            const ruleStart = new Date(rule.start_date).setHours(0, 0, 0, 0);
            const ruleEnd = new Date(rule.end_date).setHours(23, 59, 59, 999);
            return (
              currentRefundDate.getTime() >= ruleStart &&
              currentRefundDate.getTime() <= ruleEnd
            );
          });
          if (appliedRulesForNight.length > 0) {
            const maxSurchargePercent = Math.max(
              ...appliedRulesForNight.map((r) => parseFloat(r.surcharge_percent || 0))
            );
            refundHolidayAmount += (basePrice * maxSurchargePercent) / 100;
          }
          currentRefundDate.setDate(currentRefundDate.getDate() + 1);
        }

        newTotalAmount -= (refundRoomAmount + refundHolidayAmount);

        metadata.logs.push(`Khách trả phòng sớm ${earlyDays} đêm. Tự động giảm trừ tiền phòng (-${refundRoomAmount.toLocaleString("vi-VN")}đ)`);
        if (refundHolidayAmount > 0) {
            metadata.holiday_surcharge = (metadata.holiday_surcharge || 0) - refundHolidayAmount;
            metadata.logs.push(`Hoàn phụ thu lễ/tết những đêm không ở (-${refundHolidayAmount.toLocaleString("vi-VN")}đ)`);
        }
      }

      const todayForLateCheck = new Date();
      const expectedCheckOutDay = new Date(actualToday);
      expectedCheckOutDay.setHours(checkOutHour, 0, 0, 0);

      if (todayForLateCheck > expectedCheckOutDay) {
        const currentHour =
          todayForLateCheck.getHours() + todayForLateCheck.getMinutes() / 60;
        let surchargePercent = 0;
        if (currentHour <= 15) surchargePercent = 0.3;
        else if (currentHour <= 18) surchargePercent = 0.5;
        else surchargePercent = 1.0;

        if (surchargePercent > 0) {
          const lateSurchargeAmount = basePrice * surchargePercent;
          newTotalAmount += lateSurchargeAmount;
          metadata.late_out_surcharge = (metadata.late_out_surcharge || 0) + lateSurchargeAmount;
          metadata.logs.push(`Phụ thu trả phòng trễ ${surchargePercent * 100}% giá gốc (${lateSurchargeAmount.toLocaleString("vi-VN")}đ)`);
        }
      }

        await Booking.updateCheckoutDateAndAmount(
          id,
          actualToday,
        newTotalAmount,
        JSON.stringify(metadata)
        );
    }

    const finalBill = await Folio.getFolioDetails(id);
    await Booking.updateStatus(id, "Checked_out");
    await Booking.updatePaymentStatus(id, "Paid");
    await Room.updateStatus(booking.room_id, "Dirty");

    const completedBooking = await Booking.getById(id);
    await User.updateSpending(
      completedBooking.user_id,
      completedBooking.total_amount,
    );
    await User.updateTrustScore(completedBooking.user_id, 5);

    try {
      const checkInDate = new Date(completedBooking.check_in_date);
      const checkOutDate = new Date(completedBooking.check_out_date);
      let totalDays = Math.ceil(
        Math.abs(checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
      );

      // [VÁ LỖI QUAN TRỌNG 3]: Fix hiển thị số ngày in ra file PDF
      let displayDays = totalDays;
      if (checkInDate.toDateString() === checkOutDate.toDateString()) {
        displayDays = 0; // Gắn cờ = 0 để in ra chữ "Theo giờ (Day-use)"
      } else if (totalDays === 0) {
        displayDays = 1;
      }

      // [VÁ LỖI QUAN TRỌNG]: Lọc và truyền đúng số tiền phạt của dịch vụ bị hủy vào PDF
      // Thay vì lấy lại từ DB, ta dùng luôn finalBill đã tính toán chuẩn xác ở trên
      const formattedServices = finalBill.services
        .map((svc) => {
          if (svc.status === "Cancelled") {
            return {
              service_name: `[Hủy] ${svc.services_name}`,
              quantity: svc.quantity,
              price: svc.unit_price,
              total: parseFloat(svc.cancellation_fee || 0), // Chỉ lấy tiền phạt
            };
          }
          return {
            service_name: svc.services_name,
            quantity: svc.quantity,
            price: svc.unit_price,
            total: parseFloat(svc.total_price || 0),
          };
        })
        .filter((svc) => svc.total > 0); // Bỏ qua các dịch vụ hủy không mất phí

      const basePrice = parseFloat(completedBooking.base_price || 0);
      const totalAmount = parseFloat(completedBooking.total_amount || 0);
      const discountAmount = parseFloat(completedBooking.discount_amount || 0);
      const depositAmount = parseFloat(completedBooking.deposit_amount || 0);
      
      let customerNote = completedBooking.note || "";
      try {
        const metaObj = JSON.parse(completedBooking.note);
        if (metaObj && typeof metaObj === "object") {
          customerNote = metaObj.customer_note || "";
        }
      } catch (e) {}

      const invoiceData = {
        booking_id: completedBooking.id,
        full_name: completedBooking.full_name || "Khách vãng lai",
        check_in: checkInDate,
        check_out: checkOutDate,
        room_number: completedBooking.room_number || "---",
        base_price: basePrice,
        total_days: displayDays === 0 ? "Theo giờ (Day-use)" : displayDays, // Cập nhật hiển thị
        discount: discountAmount,
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        surcharge: 0, // Đã được bóc tách chi tiết thông qua noteStr bên trong pdfService
        services: formattedServices,
        note: customerNote,
      };

      const pdfBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        pdfService.generateInvoicePDF(
          (chunk) => chunks.push(chunk),
          () => resolve(Buffer.concat(chunks)),
          invoiceData,
        );
      });

      const user = await User.findById(completedBooking.user_id);
      if (user && user.email) {
        await emailService.sendInvoiceEmail(
          user.email,
          user.full_name,
          id,
          pdfBuffer,
        );
      }
    } catch (emailError) {
      console.error(
        "Lỗi khi tự động gửi email hóa đơn (Checkout vẫn thành công):",
        emailError,
      );
    }

    // BẢO VỆ DỮ LIỆU: Bổ sung Audit Log theo dõi nhân viên Check-out
    const adminId = req.user?.id || req.user?.userId || 1;
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    await Audit.logAction(
      adminId,
      "CHECK_OUT",
      id,
      { status: "Checked_in" },
      { status: "Checked_out", payment_status: "Paid", final_total: finalBill.grand_total },
      clientIp
    ).catch(err => console.error("Lỗi ghi log Audit Check-out:", err));

    return res.status(200).json({
      status: "OK",
      message:
        "Check-out thành công! Dữ liệu hóa đơn đã được đồng bộ chuẩn xác.",
      bill_details: finalBill,
    });
  } catch (error) {
    console.error("Lỗi hệ thống khi Check-out:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.changeRoom = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { idNewRoom, isFreeUpgrade = false } = req.body;

    const booking = await Booking.getById(bookingId);
    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy thông tin đặt phòng!",
      });
    }

    if (booking.status !== "Checked_in") {
      return res.status(400).json({
        status: "error",
        message:
          "Khách chưa Check-in nên không thể dùng chức năng Đổi phòng tại quầy!",
      });
    }

    const oldRoom = await Room.getById(booking.room_id);
    const newRoom = await Room.getById(idNewRoom);

    if (!oldRoom) {
      return res
        .status(404)
        .json({ status: "error", message: "Phòng hiện tại không hợp lệ" });
    }
    if (!newRoom) {
      return res
        .status(404)
        .json({ status: "error", message: "Phòng chuyển sang không hợp lệ" });
    }
    if (newRoom.status !== "Available") {
      return res.status(400).json({
        status: "error",
        message: "Trạng thái phòng này không khả dụng để chuyển sang!",
      });
    }

    const oldRoomType = await RoomType.getById(oldRoom.room_type_id);
    const newRoomType = await RoomType.getById(newRoom.room_type_id);

    // BẢO VỆ 1: Chặn đổi phòng nếu khách đã quá hạn Check-out (Tránh lỗi tính sai tiền phạt Overstay)
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);
    const checkOutDateZero = new Date(booking.check_out_date);
    checkOutDateZero.setHours(0, 0, 0, 0);

    if (todayZero > checkOutDateZero) {
      return res.status(400).json({
        status: "error",
        message:
          "Khách đã quá hạn trả phòng. Vui lòng Check-out để thanh toán phụ thu thay vì đổi phòng!",
      });
    }

    let finalTotal = parseFloat(booking.total_amount);
    
    let metadata = { customer_note: "", logs: [] };
    try {
      const parsed = JSON.parse(booking.note);
      if (parsed && typeof parsed === "object") {
        metadata = parsed;
      } else {
        metadata.customer_note = booking.note || "";
      }
    } catch(e) { metadata.customer_note = booking.note || ""; }
    if (!metadata.logs) metadata.logs = [];

    // BẢO VỆ 2 & 3: Minh bạch hóa đơn và Xử lý kiểu dữ liệu an toàn
    if (isFreeUpgrade) {
      metadata.logs.push("Khách được Đổi/Nâng hạng phòng miễn phí");
    } else if (
      parseFloat(oldRoomType.base_price) !== parseFloat(newRoomType.base_price)
    ) {
      const remainingTime = checkOutDateZero.getTime() - todayZero.getTime();
      const remainingDays = Math.round(remainingTime / (1000 * 60 * 60 * 24));

      if (remainingDays > 0) {
        let oldRemainingCost = 0;
        let newRemainingCost = 0;

        // TÍNH ĐÚNG/ĐỦ: Quét quy tắc Lễ Tết cho những ngày còn lại
        const surchargeRules = await Surcharge.getAppliedRules(
          todayZero,
          checkOutDateZero,
        );
        let currentDate = new Date(todayZero);

        while (currentDate < checkOutDateZero) {
          oldRemainingCost += parseFloat(oldRoomType.base_price);
          newRemainingCost += parseFloat(newRoomType.base_price);

          const appliedRulesForNight = surchargeRules.filter((rule) => {
            const ruleStart = new Date(rule.start_date).setHours(0, 0, 0, 0);
            const ruleEnd = new Date(rule.end_date).setHours(23, 59, 59, 999);
            return (
              currentDate.getTime() >= ruleStart &&
              currentDate.getTime() <= ruleEnd
            );
          });

          if (appliedRulesForNight.length > 0) {
            const maxSurchargePercent = Math.max(
              ...appliedRulesForNight.map((r) =>
                parseFloat(r.surcharge_percent || 0),
              ),
            );
            oldRemainingCost +=
              (parseFloat(oldRoomType.base_price) * maxSurchargePercent) / 100;
            newRemainingCost +=
              (parseFloat(newRoomType.base_price) * maxSurchargePercent) / 100;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        const priceDifference = newRemainingCost - oldRemainingCost;
        finalTotal = finalTotal + priceDifference;

        if (priceDifference !== 0) {
          metadata.change_room_fee = (metadata.change_room_fee || 0) + priceDifference;
          metadata.logs.push(`Thu/Hoàn ${priceDifference.toLocaleString("vi-VN")}đ do đổi phòng tính phí cho ${remainingDays} đêm còn lại`);
        }
      }
    }

    await Room.updateStatus(oldRoom.id, "Dirty");
    await Room.updateStatus(newRoom.id, "Occupied");
    await Booking.changeRoom(bookingId, newRoom.id, finalTotal, JSON.stringify(metadata));

    const actionUserId = req.user?.id || req.user?.userId;
    const clientIp =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

    await Audit.logAction(
      actionUserId,
      isFreeUpgrade ? "FREE_UPGRADE_ROOM" : "CHANGE_ROOM",
      bookingId,
      { room: oldRoom.room_number, total_amount: booking.total_amount },
      { room: newRoom.room_number, total_amount: finalTotal, isFreeUpgrade },
      clientIp,
    );

    return res.status(200).json({
      status: "ok",
      message: isFreeUpgrade
        ? "Đã nâng hạng phòng miễn phí cho khách!"
        : "Chuyển phòng thành công!",
      new_total_amount: finalTotal,
    });
  } catch (error) {
    console.error("Lỗi changeRoom:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server!" });
  }
};
exports.reassignRoomBeforeCheckIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_room_id } = req.body;

    const booking = await Booking.getById(id);
    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy thông tin đặt phòng!",
      });
    }

    // Chỉ đổi khi đơn hàng chưa Check-in
    if (booking.status !== "Confirmed" && booking.status !== "Pending") {
      return res.status(400).json({
        status: "error",
        message: "Chỉ được sắp xếp lại phòng khi khách chưa Check-in!",
      });
    }

    const newRoom = await Room.getById(new_room_id);
    if (!newRoom) {
      return res
        .status(404)
        .json({ status: "error", message: "Phòng mới không tồn tại!" });
    }
    if (newRoom.status !== "Available") {
      return res.status(400).json({
        status: "error",
        message: "Phòng này hiện không trống, vui lòng chọn phòng khác!",
      });
    }

    if (newRoom.room_type_id !== booking.room_type_id) {
      // Nâng hạng
      await Booking.upgradeRoomFree(id, new_room_id);
    } else {
      // Cùng hạng
      await Booking.updateRoomId(id, new_room_id);
    }

    return res.status(200).json({
      status: "OK",
      message: `Đã đổi sang phòng ${newRoom.room_number} thành công! Bây giờ Lễ tân có thể bấm Check-in.`,
    });
  } catch (error) {
    console.error("Lỗi reassign room:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server!" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.getById(id);
    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy thông tin đặt phòng!",
      });
    }

    const currentUserId = req.user?.id || req.user?.userId;
    const userRole = req.user?.role || "Customer";

    if (userRole === "Customer" && booking.user_id !== currentUserId) {
      return res.status(403).json({
        status: "error",
        message:
          "Bảo mật: Bạn không có quyền hủy đơn đặt phòng của người khác!",
      });
    }

    if (booking.status !== "Pending" && booking.status !== "Confirmed") {
      return res
        .status(400)
        .json({ message: "Trạng thái đơn không hợp lệ để hủy!" });
    }

    const configs = await SystemConfig.getAll();
    const checkInConfig = configs.find((c) => c.config_key === "check_in_time");
    const checkInHour = checkInConfig
      ? parseInt(checkInConfig.config_value.split(":")[0])
      : 14;

    const now = new Date();
    const checkInDate = new Date(booking.check_in_date);
    checkInDate.setHours(checkInHour, 0, 0, 0);
    const diffTime = checkInDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    let penaltyMessage =
      "Hủy phòng thành công. Trạng thái phòng đã được giải phóng.";
    let penaltyAmount = 0;

    if (diffHours < 24) {
      await User.updateTrustScore(booking.user_id, -20);
      penaltyAmount = parseFloat(booking.deposit_amount || 0);
      penaltyMessage =
        "Hủy phòng sát giờ (dưới 24h). Bạn bị trừ 20 điểm tín nhiệm và không được hoàn cọc.";
    } else if (diffHours >= 24 && diffHours <= 48) {
      await User.updateTrustScore(booking.user_id, -10);
      penaltyAmount = parseFloat(booking.deposit_amount || 0) * 0.5;
      penaltyMessage = "Hủy phòng trước 48h. Bạn bị phạt 50% số tiền đã cọc.";
    } else {
      await User.updateTrustScore(booking.user_id, -5);
      penaltyAmount = 0;
      penaltyMessage =
        "Hủy phòng sớm. Bạn được hoàn 100% tiền cọc, hệ thống trừ 5 điểm tín nhiệm tài khoản để hạn chế spam giữ chỗ.";
    }

    await Booking.updateStatus(id, "Cancelled");
    await Room.updateStatus(booking.room_id, "Available");

    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const actionUserId = req.user?.id || req.user?.userId || booking.user_id;

    await Audit.logAction(
      actionUserId,
      "CANCEL_BOOKING",
      id,
      { status: "Pending/Confirmed" },
      { status: "Cancelled", penalty: penaltyAmount },
      clientIp,
    );
    const user = await User.findById(booking.user_id);
    if (user && user.email) {
      await emailService.sendCancellationEmail(
        user.email,
        user.full_name,
        id,
        penaltyAmount,
      );
    }

    return res.status(200).json({
      status: "OK",
      message: penaltyMessage,
      penalty_amount: penaltyAmount,
      refund_amount: parseFloat(booking.deposit_amount || 0) - penaltyAmount,
    });
  } catch (error) {
    console.error("Lỗi Cancel:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server!" });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.getById(id);

    if (!booking) {
      return res.status(404).json({ message: "Không thấy đơn hàng" });
    }

    const userRole = req.user?.role || "Customer";
    const currentUserId = req.user?.id || req.user?.userId;

    if (userRole === "Customer" && booking.user_id !== currentUserId) {
      return res.status(403).json({
        message: "Bảo mật: Không có quyền tải hóa đơn của người khác",
      });
    }

    const checkInDate = new Date(booking.check_in_date);
    const checkOutDate = new Date(booking.check_out_date);

    // Tính toán số ngày
    let totalDays = Math.ceil(
      Math.abs(checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
    );

    // [VÁ LỖI]: Bóc tách riêng Day-use để in hóa đơn chuẩn xác
    let displayDays = totalDays;
    if (checkInDate.toDateString() === checkOutDate.toDateString()) {
      displayDays = 0; // Đánh dấu là Day-use
    } else if (totalDays === 0) {
      displayDays = 1;
    }

    const services = await Folio.getServicesByBookingId(id);

    const basePrice = parseFloat(booking.base_price || 0);
    const totalAmount = parseFloat(booking.total_amount || 0);
    const discountAmount = parseFloat(booking.discount_amount || 0);
    const depositAmount = parseFloat(booking.deposit_amount || 0);

    // [VÁ LỖI]: Cân bằng lại giá trị dòng tiền nếu là Day-use
    // Nếu là Day-use (0 ngày), tiền phòng tạm tính bằng đúng tổng tiền trừ đi các dịch vụ
    let roomTotal = 0;
    if (displayDays === 0) {
      roomTotal = totalAmount + discountAmount; // Cân bằng Surcharge = 0
    } else {
      roomTotal = basePrice * displayDays;
    }
    
    let customerNote = booking.note || "";
    try {
      const metaObj = JSON.parse(booking.note);
      if (metaObj && typeof metaObj === "object") {
        customerNote = metaObj.customer_note || "";
      }
    } catch (e) {}

    const servicesTotal = services.reduce(
      (sum, svc) => sum + parseFloat(svc.total || 0),
      0,
    );

    const surcharge = totalAmount + discountAmount - roomTotal;

    const invoiceData = {
      booking_id: booking.id,
      full_name: booking.full_name || "Khách vãng lai",
      check_in: checkInDate,
      check_out: checkOutDate,
      room_number: booking.room_number || "---",
      base_price: basePrice,
      total_days: displayDays === 0 ? "Theo giờ (Day-use)" : displayDays, // Ghi rõ trên PDF
      discount: discountAmount,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      surcharge: surcharge > 0 ? surcharge : 0,
      services: services,
      note: customerNote,
    };

    // GHI LOG (AUDIT) ĐỂ BẢO MẬT DỮ LIỆU
    if (userRole === "Admin" || userRole === "Receptionist") {
      const clientIp =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        "127.0.0.1";

      Audit.logAction(
        currentUserId,
        "DOWNLOAD_INVOICE",
        booking.id,
        null,
        {
          message: "Trích xuất bản sao hóa đơn PDF của khách hàng",
        },
        clientIp,
      ).catch((err) => console.error("Lỗi ghi log Audit tải PDF:", err));
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=Invoice-HueHotel-${id}.pdf`,
    );

    try {
      pdfService.generateInvoicePDF(
        (chunk) => res.write(chunk),
        () => res.end(),
        invoiceData,
      );
    } catch (pdfError) {
      console.error("Lỗi sâu bên trong PDFService:", pdfError);
      if (!res.headersSent) {
        return res
          .status(500)
          .json({ status: "error", message: "Lỗi thư viện tạo PDF" });
      }
    }
  } catch (error) {
    console.error("Lỗi Controller downloadInvoice:", error);
    if (!res.headersSent) {
      return res.status(500).json({ status: "error", message: "Lỗi server" });
    }
  }
};
exports.getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.id || req.user.userId;
    const bookings = await Booking.getByUserId(user_id);

    // Đính kèm base_price cho từng đơn hàng để Frontend tách bill minh bạch
    if (bookings && bookings.length > 0) {
      for (let b of bookings) {
        if (b.base_price == null && b.room_type_id) {
          const roomType = await RoomType.getById(b.room_type_id);
          if (roomType) {
            b.base_price = roomType.base_price;
          }
        }
      }
    }

    return res.status(200).json({ status: "OK", data: bookings });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id || req.user.userId;

    const booking = await Booking.getById(id);
    if (!booking)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (booking.user_id !== user_id)
      return res
        .status(403)
        .json({ message: "Bạn không có quyền đánh giá đơn này" });
    if (booking.status !== "Checked_out")
      return res
        .status(400)
        .json({ message: "Chỉ được đánh giá sau khi đã hoàn tất lưu trú!" });

    const existingReview = await Review.findByBookingId(id);
    if (existingReview)
      return res
        .status(400)
        .json({ message: "Bạn đã đánh giá đơn hàng này rồi!" });

    await Review.create({
      user_id,
      booking_id: id,
      room_type_id: booking.room_type_id,
      rating,
      comment,
    });

    await User.updateTrustScore(user_id, 2);

    return res.status(201).json({
      status: "OK",
      message: "Cảm ơn bạn đã đánh giá! Bạn được cộng 2 điểm tín nhiệm.",
    });
  } catch (error) {
    console.error("Lỗi đánh giá:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getCurrentBookingByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const booking = await Booking.getCurrentBookingByRoom(roomId);
    if (!booking) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy khách đang lưu trú tại phòng này" });
    }
    return res.status(200).json({ status: "OK", data: booking });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};
exports.getAllBookingsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "All";
    const search = req.query.search || "";

    const offset = (page - 1) * limit;
    const result = await Booking.getPaginatedForAdmin(
      limit,
      offset,
      status,
      search,
    );
    return res.status(200).json({
      status: "OK",
      data: result.data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.totalRecords / limit),
        totalRecords: result.totalRecords,
        limit: limit,
      },
    });
  } catch (error) {
    console.log("Lỗi tải danh sách đơn:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi tải danh sách đơn" });
  }
};

exports.confirmDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.getById(id);
    if (!booking)
      return res.status(404).json({ message: "Không tìm thấy đơn" });
    if (booking.status !== "Pending")
      return res
        .status(400)
        .json({ message: "Chỉ xác nhận đơn đang chờ thanh toán" });

    const checkInDate = new Date(booking.check_in_date);
    checkInDate.setHours(18, 0, 0, 0); 

    await db.query(
      "UPDATE bookings SET status = 'Confirmed', hold_until = ? WHERE id = ?",
      [checkInDate, id],
    );

    const user = await User.findById(booking.user_id);
    if (user && user.email) {
      await emailService.sendDepositConfirmationEmail(
        user.email,
        user.full_name,
        booking,
      );
    }
    return res
      .status(200)
      .json({ status: "OK", message: "Đã xác nhận tiền cọc thành công!" });
  } catch (error) {
    console.error("Lỗi confirmDeposit:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};
