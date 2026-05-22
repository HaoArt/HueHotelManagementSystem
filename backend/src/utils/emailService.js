const axios = require("axios");
require("dotenv").config();

const BREVO_API_KEY = process.env.EMAIL_BREVO_PASS;

const FROM_EMAIL = process.env.EMAIL_BREVO_NAME;

// ======================
// SEND EMAIL HELPER
// ======================

async function sendEmail(to, subject, htmlContent, emailType) {
  try {
    console.log(`================ ${emailType} ================`);
    console.log("TO:", to);
    console.log("SUBJECT:", subject);

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "HuếHotel Support",
          email: FROM_EMAIL,
        },

        to: [
          {
            email: to,
          },
        ],

        subject: subject,

        htmlContent: htmlContent,
      },

      {
        headers: {
          accept: "application/json",
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
        },
      },
    );

    console.log("EMAIL SENT SUCCESSFULLY");
    console.log("BREVO RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.log(`SEND ${emailType} ERROR:`);

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    throw error;
  }
}

// ======================
// OTP EMAIL
// ======================

exports.sendEmailOtp = async (email, otp) => {
  return await sendEmail(
    email,
    "Mã xác thực OTP cho tài khoản HuếHotel",

    `
      <h3>Chào mừng bạn đến với HuếHotel!</h3>

      <p>
        Mã OTP của bạn là:
        <b>${otp}</b>
      </p>

      <p>
        Mã này sẽ hết hạn sau 5 phút.
      </p>
    `,

    "OTP EMAIL",
  );
};

// ======================
// REMINDER EMAIL
// ======================

exports.sendReminderEmail = async (userEmail, userName, bookingDetails) => {
  return await sendEmail(
    userEmail,

    `[Nhắc nhở] Lịch nhận phòng tại HuếHotel vào ngày mai!`,

    `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #2c3e50;">
          Kính chào quý khách ${userName},
        </h2>

        <p>
          HuếHotel rất hân hạnh được đón tiếp quý khách vào ngày mai.
        </p>

        <div
          style="
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #3498db;
            margin: 20px 0;
          "
        >
          <h3 style="margin-top: 0;">
            Thông tin đặt phòng:
          </h3>

          <ul style="list-style-type: none; padding-left: 0;">
            <li>
              <strong>Mã đơn:</strong>
              #${bookingDetails.id}
            </li>

            <li>
              <strong>Ngày Check-in:</strong>
              ${new Date(bookingDetails.check_in_date).toLocaleDateString(
                "vi-VN",
              )}
            </li>

            <li>
              <strong>Giờ nhận phòng tiêu chuẩn:</strong>
              14:00
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

        <p>
          Chúc quý khách có một kỳ nghỉ tuyệt vời tại Huế!
        </p>

        <p>
          Trân trọng,<br />
          <strong>Ban Quản lý HuếHotel</strong>
        </p>
      </div>
    `,

    "REMINDER EMAIL",
  );
};

// ======================
// CONTACT REPLY EMAIL
// ======================

exports.sendContactReplyEmail = async (
  userEmail,
  userName,
  subject,
  replyMessage,
) => {
  return await sendEmail(
    userEmail,

    `Phản hồi từ HuếHotel: RE: ${subject}`,

    `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #2c3e50;">
          Xin chào ${userName},
        </h2>

        <p>
          Cảm ơn bạn đã liên hệ với hệ thống HuếHotel.
        </p>

        <div
          style="
            background-color: #f1f8e9;
            padding: 15px;
            border-left: 4px solid #8bc34a;
            margin: 20px 0;
          "
        >
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

    "CONTACT REPLY EMAIL",
  );
};

// ======================
// DEPOSIT CONFIRM EMAIL
// ======================

exports.sendDepositConfirmationEmail = async (
  userEmail,
  userName,
  bookingId,
  depositAmount,
) => {
  return await sendEmail(
    userEmail,

    `[Xác nhận] Thanh toán cọc thành công đơn #${bookingId}`,

    `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2e7d32;">
          Thanh toán thành công!
        </h2>

        <p>
          Kính chào ${userName},
        </p>

        <p>
          HuếHotel đã nhận được số tiền cọc
          <b>
            ${depositAmount.toLocaleString("vi-VN")} VNĐ
          </b>
          cho đơn đặt phòng #${bookingId}.
        </p>

        <p>
          Đơn hàng của bạn đã chuyển sang trạng thái
          <b>Đã xác nhận (Confirmed)</b>.
        </p>

        <p>
          Hẹn gặp lại bạn tại HuếHotel!
        </p>
      </div>
    `,

    "DEPOSIT CONFIRM EMAIL",
  );
};

// ======================
// CANCELLATION EMAIL
// ======================

exports.sendCancellationEmail = async (
  userEmail,
  userName,
  bookingId,
  penaltyAmount,
) => {
  return await sendEmail(
    userEmail,

    `[Thông báo] Hủy đơn đặt phòng #${bookingId}`,

    `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #d32f2f;">
          Xác nhận Hủy đặt phòng
        </h2>

        <p>
          Kính chào ${userName},
        </p>

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
            <b>
              ${penaltyAmount.toLocaleString("vi-VN")} VNĐ
            </b>
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

    "CANCELLATION EMAIL",
  );
};
