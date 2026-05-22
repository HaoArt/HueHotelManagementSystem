const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_BREVO_NAME,
    pass: process.env.EMAIL_BREVO_PASS,
  },
});

const FROM_EMAIL = `"HuếHotel Support" <${process.env.EMAIL_BREVO_NAME}>`;


verifySMTP();
exports.sendEmailOtp = async (email, otp) => {
  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: "Mã xác thực OTP cho tài khoản HuếHotel",
    html: `
      <h3>Chào mừng bạn đến với HuếHotel!</h3>
      <p>Mã OTP của bạn là: <b>${otp}</b></p>
      <p>Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

exports.sendReminderEmail = async (userEmail, userName, bookingDetails) => {
  const mailOptions = {
    from: FROM_EMAIL,
    to: userEmail,
    subject: `[Nhắc nhở] Lịch nhận phòng tại HuếHotel vào ngày mai!`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #2c3e50;">Kính chào quý khách ${userName},</h2>

        <p>HuếHotel rất hân hạnh được đón tiếp quý khách vào ngày mai.</p>

        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
          <h3 style="margin-top: 0;">Thông tin đặt phòng:</h3>

          <ul style="list-style-type: none; padding-left: 0;">
            <li>
              <strong>Mã đơn:</strong> #${bookingDetails.id}
            </li>

            <li>
              <strong>Ngày Check-in:</strong>
              ${new Date(bookingDetails.check_in_date).toLocaleDateString("vi-VN")}
            </li>

            <li>
              <strong>Giờ nhận phòng tiêu chuẩn:</strong> 14:00
            </li>

            <li>
              <strong>Thời hạn giữ phòng:</strong>
              ${new Date(bookingDetails.hold_until).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </li>
          </ul>
        </div>

        <p>
          <strong>Lưu ý quan trọng:</strong>
          Nếu quý khách chọn "Thanh toán tại quầy",
          vui lòng đến trước thời hạn giữ phòng.
        </p>

        <p>Chúc quý khách có một kỳ nghỉ tuyệt vời tại Huế!</p>

        <p>
          Trân trọng,<br />
          <strong>Ban Quản lý HuếHotel</strong>
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

exports.sendContactReplyEmail = async (
  userEmail,
  userName,
  subject,
  replyMessage,
) => {
  const mailOptions = {
    from: FROM_EMAIL,
    to: userEmail,
    subject: `Phản hồi từ HuếHotel: RE: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #2c3e50;">Xin chào ${userName},</h2>

        <p>Cảm ơn bạn đã liên hệ với hệ thống HuếHotel.</p>

        <div style="background-color: #f1f8e9; padding: 15px; border-left: 4px solid #8bc34a; margin: 20px 0;">
          <p style="white-space: pre-wrap; margin: 0;">
            ${replyMessage}
          </p>
        </div>

        <p>
          Nếu bạn cần hỗ trợ thêm,
          đừng ngần ngại liên hệ lại với chúng tôi.
        </p>

        <p>
          Trân trọng,<br />
          <strong>Đội ngũ CSKH HuếHotel</strong>
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

exports.sendDepositConfirmationEmail = async (
  userEmail,
  userName,
  bookingId,
  depositAmount,
) => {
  const mailOptions = {
    from: FROM_EMAIL,
    to: userEmail,
    subject: `[Xác nhận] Thanh toán cọc thành công đơn #${bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2e7d32;">Thanh toán thành công!</h2>

        <p>Kính chào ${userName},</p>

        <p>
          HuếHotel đã nhận được số tiền cọc
          <b>${depositAmount.toLocaleString("vi-VN")} VNĐ</b>
          cho đơn đặt phòng #${bookingId}.
        </p>

        <p>
          Đơn hàng của bạn đã chuyển sang trạng thái
          <b>Đã xác nhận (Confirmed)</b>.
        </p>

        <p>Hẹn gặp lại bạn tại HuếHotel!</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

exports.sendCancellationEmail = async (
  userEmail,
  userName,
  bookingId,
  penaltyAmount,
) => {
  const mailOptions = {
    from: FROM_EMAIL,
    to: userEmail,
    subject: `[Thông báo] Hủy đơn đặt phòng #${bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #d32f2f;">Xác nhận Hủy đặt phòng</h2>

        <p>Kính chào ${userName},</p>

        <p>
          Đơn đặt phòng #${bookingId}
          của bạn đã được hủy thành công.
        </p>

        ${
          penaltyAmount > 0
            ? `
          <p style="color: red;">
            Theo chính sách hủy phòng trễ,
            bạn bị giữ lại
            <b>${penaltyAmount.toLocaleString("vi-VN")} VNĐ</b>
            phí phạt hủy phòng.
          </p>
        `
            : `
          <p>
            Bạn được hoàn 100% tiền cọc.
            Tiền sẽ được hoàn trong 3-5 ngày làm việc.
          </p>
        `
        }

        <p>
          Hy vọng sẽ được phục vụ bạn trong những dịp tới.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};
