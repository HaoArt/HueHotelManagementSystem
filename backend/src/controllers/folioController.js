const Folio = require("../models/folioModel");
const db = require("../config/db");
const Service = require("../models/serviceModel");
const Booking = require("../models/bookingModel");
const Audit = require("../models/auditModel");

exports.orderService = async (req, res) => {
  try {
    const { booking_id, service_id, quantity, usage_time, note } = req.body;

    // BẢO VỆ LOGIC: Phải kiểm tra trạng thái đơn đặt phòng trước khi cho phép gọi dịch vụ
    const booking = await Booking.getById(booking_id);
    if (!booking) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin đơn đặt phòng!" });
    }
    if (booking.status !== "Checked_in") {
      return res.status(400).json({
        message:
          "Chỉ được phép gọi dịch vụ khi khách đang lưu trú tại khách sạn!",
      });
    }

    const service = await Service.getById(service_id);
    if (!service) {
      return res.status(404).json({ message: "Dịch vụ không tồn tại!" });
    }
    const unit_price = parseFloat(service.price);
    const total_price = unit_price * quantity;
    await Folio.addServiceToBooking(
      booking_id,
      service_id,
      quantity,
      total_price,
      usage_time,
      note,
    );

    return res.status(201).json({
      status: "OK",
      message: "Thêm dịch vụ thành công!",
      added_cost: total_price,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getCheckoutFolio = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const folioDetails = await Folio.getFolioDetails(booking_id);
    return res.status(200).json({
      status: "OK",
      data: folioDetails,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.deleteFolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Folio.getItemById(id);
    if (!item) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy dịch vụ đã yêu cầu!" });
    }

    const userRole = req.user?.role;
    const isAdminOrReceptionist =
      userRole === "Admin" || userRole === "Receptionist";

    if (item.status !== "Pending" && !isAdminOrReceptionist) {
      return res
        .status(400)
        .json({ message: "Lễ tân đã phục vụ dịch vụ này, không thể hủy!" });
    }

    const actionUserId = req.user?.id || req.user?.userId || "System";
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

    // ĐẶC QUYỀN ADMIN: Hủy ép (Void) dịch vụ ĐÃ PHỤC VỤ (ví dụ: Lễ tân bấm nhầm, hoặc khách trả lại đồ còn nguyên)
    if (item.status === "Delivered" && isAdminOrReceptionist) {
      await Folio.cancelItemWithFee(id, 0);
      
      await Audit.logAction(
        actionUserId,
        "VOID_SERVICE",
        item.booking_id,
        { service_id: item.service_id, original_price: item.total_price, status: "Delivered" },
        { status: "Cancelled", penalty_fee: 0, note: "Admin Hủy ép (Void)" },
        clientIp
      ).catch(e => console.error("Lỗi ghi log Void dịch vụ", e));

      return res.status(200).json({
        status: "OK",
        message: "Lễ tân đã Hủy ép (Void) và hoàn tiền dịch vụ này thành công!",
      });
    }

    const service = await Service.getById(item.service_id);
    if (service.service_type === "PreOrder" && item.usage_time) {
      const now = new Date();
      const usageDate = new Date(item.usage_time);
      const diffInHours = (usageDate - now) / (1000 * 60 * 60);
      if (diffInHours > 0 && diffInHours <= 2) {
        const fee = parseFloat(item.total_price) * 0.5; // Phạt 50%
        await Folio.cancelItemWithFee(id, fee);
        
        await Audit.logAction(
          actionUserId,
          "CANCEL_SERVICE_PENALTY",
          item.booking_id,
          { service_id: item.service_id, original_price: item.total_price },
          { status: "Cancelled", penalty_fee: fee, reason: "< 2h" },
          clientIp
        ).catch(e => console.error("Lỗi ghi log", e));

        return res.status(200).json({
          status: "OK",
          message: `Đã hủy! Tuy nhiên do báo hủy quá sát giờ (dưới 2 tiếng), hệ thống ghi nhận mức phạt ${fee.toLocaleString("vi-VN")}đ vào hóa đơn.`,
        });
      }
      if (diffInHours <= 0) {
        const fullFee = parseFloat(item.total_price);
        await Folio.cancelItemWithFee(id, fullFee);
        
        await Audit.logAction(
          actionUserId,
          "CANCEL_SERVICE_PENALTY",
          item.booking_id,
          { service_id: item.service_id, original_price: item.total_price },
          { status: "Cancelled", penalty_fee: fullFee, reason: "Overdue" },
          clientIp
        ).catch(e => console.error("Lỗi ghi log", e));

        return res.status(200).json({
          status: "OK",
          message: `Dịch vụ đã quá hạn sử dụng nhưng khách không dùng. Hệ thống đã hủy và tính phí phạt 100% (${fullFee.toLocaleString("vi-VN")}đ).`,
        });
      }
    }

    await Folio.cancelItemWithFee(id, 0);
    
    await Audit.logAction(
      actionUserId,
      "CANCEL_SERVICE_FREE",
      item.booking_id,
      { service_id: item.service_id, original_price: item.total_price },
      { status: "Cancelled", penalty_fee: 0 },
      clientIp
    ).catch(e => console.error("Lỗi ghi log", e));

    return res.status(200).json({
      status: "OK",
      message:
        "Hủy dịch vụ thành công (Không mất phí)! Giao dịch đã được ghi lại vào lịch sử hóa đơn.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.markItemDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    await Folio.updateItemStatus(id, "Delivered");
    return res
      .status(200)
      .json({ status: "OK", message: "Đã đánh dấu phục vụ thành công!" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi cập nhật trạng thái dịch vụ" });
  }
};

exports.getAllPendingOrders = async (req, res) => {
  try {
    const data = await Folio.getPendingOrders();
    return res.status(200).json({ status: "OK", data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
