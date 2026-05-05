const Contact = require("../models/contactModel");
const emailService = require("../utils/emailService");
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    await Contact.create({ name, email, subject, message });
    return res.status(201).json({
      status: "OK",
      message: "Cảm ơn bạn! Lời nhắn của bạn đã được gửi đến HuếHotel.",
    });
  } catch (error) {
    console.error("Lỗi gửi liên hệ:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.getAll();
    if (!contacts) {
      return res
        .status(400)
        .json({ status: "error", message: "Không thể lấy liên hệ" });
    }
    return res.status(200).json({ status: "OK", data: contacts });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.getById(id);
    if (contact && contact.status === "New") {
      await Contact.updateStatus(id, "Read");
    }
    return res.status(200).json({ status: "OK" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

exports.replyContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    const contact = await Contact.getById(id);
    if (!contact) {
      return res.status(404).json({ message: "Không tìm thấy thư liên hệ." });
    }

    await emailService.sendContactReplyEmail(
      contact.email,
      contact.name,
      contact.subject,
      replyMessage,
    );

    await Contact.updateStatus(id, "Resolved");

    return res.status(200).json({
      status: "OK",
      message: "Đã gửi phản hồi và cập nhật trạng thái thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi trả lời thư:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi server khi gửi email phản hồi." });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.delete(id);
    return res
      .status(200)
      .json({ status: "OK", message: "Đã xóa thư thành công!" });
  } catch (error) {
    console.error("Lỗi xóa liên hệ:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi server khi xóa thư." });
  }
};
