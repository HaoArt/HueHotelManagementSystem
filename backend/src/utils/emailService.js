const axios = require("axios");
require("dotenv").config();

const BREVO_API_KEY = (process.env.BREVO_API_KEY || "").trim();
const FROM_EMAIL = (process.env.EMAIL_BREVO_NAME || "").trim();

async function sendEmail(
  to,
  subject,
  htmlContent,
  emailType,
  attachments = null,
) {
  try {
    console.log(`================ ${emailType} ================`);
    console.log("TO:", to);
    console.log("SUBJECT:", subject);

    const payload = {
      sender: {
        name: "HuếHotel",
        email: FROM_EMAIL,
      },
      to: [
        {
          email: to,
        },
      ],
      subject: subject,
      htmlContent: htmlContent,
    };

    if (attachments) {
      payload.attachment = attachments;
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
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

const generateHtmlTemplate = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7f6; padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <tr>
              <td style="background-color: #1e3a8a; padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">HuếHotel</h1>
                <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px; font-style: italic;">Nét đẹp Cố đô, Trải nghiệm hoàn hảo</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px; line-height: 1.6; font-size: 15px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="background-color: #f8fafc; padding: 25px 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #0f172a;">Hệ thống quản lý đặt phòng HuếHotel</p>
                <p style="margin: 0 0 5px 0;">Email: support@huehotel.com | Hotline: 0866.861.xxx</p>
                <p style="margin: 15px 0 0 0; font-size: 12px; color: #94a3b8;">Đây là email tự động, quý khách vui lòng không trả lời trực tiếp email này.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

exports.sendEmailOtp = async (email, otp) => {
  const content = `
    <h2 style="color: #1e3a8a; margin-top: 0; text-align: center;">Xác thực tài khoản</h2>
    <p>Kính chào quý khách,</p>
    <p>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của <strong>HuếHotel</strong>. Để hoàn tất quá trình xác thực, vui lòng sử dụng mã OTP dưới đây:</p>
    
    <div style="text-align: center; margin: 35px 0;">
      <span style="display: inline-block; font-size: 36px; font-weight: bold; color: #1e3a8a; letter-spacing: 8px; background-color: #eff6ff; padding: 15px 40px; border-radius: 8px; border: 2px dashed #93c5fd;">
        ${otp}
      </span>
    </div>

    <p style="color: #dc2626; font-size: 14px; text-align: center; background-color: #fef2f2; padding: 10px; border-radius: 4px;">
      <em>* Mã này sẽ hết hạn sau 5 phút. Khuyến cáo không chia sẻ mã này cho bất kỳ ai để bảo mật tài khoản.</em>
    </p>
    <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ Kỹ thuật HuếHotel</strong></p>
  `;

  return await sendEmail(
    email,
    "Mã xác thực OTP cho tài khoản HuếHotel",
    generateHtmlTemplate(content),
    "OTP EMAIL",
  );
};

exports.sendReminderEmail = async (userEmail, userName, bookingDetails) => {
  const content = `
    <h2 style="color: #1e3a8a; margin-top: 0;">Nhắc nhở nhận phòng</h2>
    <p>Kính chào quý khách <strong>${userName}</strong>,</p>
    <p>HuếHotel rất hân hạnh được đón tiếp quý khách vào ngày mai. Dưới đây là thông tin tóm tắt về đơn đặt phòng của quý khách để tiện cho việc theo dõi:</p>
    
    <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
      <p style="margin: 0 0 10px 0;"><strong>Mã đơn đặt phòng:</strong> <span style="color: #1e3a8a; font-weight: bold; font-size: 16px;">#${bookingDetails.id}</span></p>
      <p style="margin: 0 0 10px 0;"><strong>Ngày nhận phòng:</strong> ${new Date(bookingDetails.check_in_date).toLocaleDateString("vi-VN")}</p>
      <p style="margin: 0 0 10px 0;"><strong>Giờ nhận phòng tiêu chuẩn:</strong> 14:00</p>
      <p style="margin: 0;"><strong>Thời hạn giữ phòng:</strong> <span style="color: #ef4444; font-weight: bold;">${new Date(bookingDetails.hold_until).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span></p>
    </div>

    <p style="font-size: 14px; color: #b45309; background: #fffbeb; padding: 15px; border-radius: 6px; border: 1px solid #fde68a;">
      <strong>Lưu ý quan trọng:</strong> Nếu quý khách chọn phương thức "Thanh toán tại quầy", vui lòng đến làm thủ tục trước thời hạn giữ phòng. Quá thời hạn này, hệ thống sẽ tự động hủy đơn để nhường chỗ cho khách hàng khác.
    </p>

    <p style="margin-top: 25px;">Kính chúc quý khách có một kỳ nghỉ thật tuyệt vời và trọn vẹn tại Cố đô!</p>
    <p>Trân trọng,<br><strong>Ban Lễ tân HuếHotel</strong></p>
  `;

  return await sendEmail(
    userEmail,
    `[Nhắc nhở] Lịch nhận phòng tại HuếHotel vào ngày mai!`,
    generateHtmlTemplate(content),
    "REMINDER EMAIL",
  );
};

exports.sendContactReplyEmail = async (
  userEmail,
  userName,
  subject,
  replyMessage,
) => {
  const content = `
    <h2 style="color: #1e3a8a; margin-top: 0;">Phản hồi yêu cầu hỗ trợ</h2>
    <p>Kính chào quý khách <strong>${userName}</strong>,</p>
    <p>HuếHotel xin chân thành cảm ơn quý khách đã quan tâm và liên hệ. Chúng tôi xin phản hồi về yêu cầu hỗ trợ của quý khách như sau:</p>
    
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; margin: 25px 0; border-radius: 8px; color: #166534; white-space: pre-wrap; font-style: italic; line-height: 1.8;">"${replyMessage}"</div>
    
    <p>Nếu cần thêm bất kỳ sự hỗ trợ nào khác, quý khách vui lòng phản hồi lại trực tiếp qua email này hoặc liên hệ qua Hotline của chúng tôi.</p>
    <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ CSKH HuếHotel</strong></p>
  `;

  return await sendEmail(
    userEmail,
    `Phản hồi từ HuếHotel: RE: ${subject}`,
    generateHtmlTemplate(content),
    "CONTACT REPLY EMAIL",
  );
};

exports.sendDepositConfirmationEmail = async (
  userEmail,
  userName,
  bookingId,
  depositAmount,
) => {
  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="display: inline-block; background-color: #dcfce7; color: #16a34a; padding: 15px; border-radius: 50%; width: 35px; height: 35px; line-height: 35px; font-size: 26px; font-weight: bold;">✓</div>
    </div>
    <h2 style="color: #16a34a; margin-top: 0; text-align: center;">Thanh toán thành công!</h2>
    <p>Kính chào quý khách <strong>${userName}</strong>,</p>
    <p>HuếHotel xin thông báo chúng tôi đã nhận được khoản thanh toán cọc cho đơn đặt phòng của quý khách.</p>
    
    <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
      <tr>
        <td width="40%" style="color: #64748b; border-bottom: 1px solid #e2e8f0; font-size: 15px;">Mã đơn đặt phòng:</td>
        <td width="60%" style="font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-size: 16px;">#${bookingId}</td>
      </tr>
      <tr>
        <td style="color: #64748b; font-size: 15px;">Số tiền đã cọc:</td>
        <td style="font-weight: bold; color: #16a34a; font-size: 20px;">${depositAmount.toLocaleString("vi-VN")} VNĐ</td>
      </tr>
    </table>

    <p>Đơn hàng của quý khách hiện đã được chuyển sang trạng thái <strong style="color: #1e3a8a;">Đã xác nhận (Confirmed)</strong>. Phòng của quý khách đã được hệ thống giữ an toàn.</p>
    <p>Rất mong chờ được phục vụ quý khách tại HuếHotel!</p>
    <p style="margin-top: 30px;">Trân trọng,<br><strong>Bộ phận Kế toán HuếHotel</strong></p>
  `;

  return await sendEmail(
    userEmail,
    `[Xác nhận] Thanh toán cọc thành công đơn #${bookingId}`,
    generateHtmlTemplate(content),
    "DEPOSIT CONFIRM EMAIL",
  );
};

exports.sendCancellationEmail = async (
  userEmail,
  userName,
  bookingId,
  penaltyAmount,
) => {
  const penaltyHtml =
    penaltyAmount > 0
      ? `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
         <p style="color: #b91c1c; margin: 0; line-height: 1.6;">
           Theo chính sách hủy phòng trễ của khách sạn, hệ thống xin phép giữ lại khoản phí phạt là: <strong style="font-size: 16px;">${penaltyAmount.toLocaleString("vi-VN")} VNĐ</strong>.<br>
           Số dư tiền cọc còn lại (nếu có) sẽ được hoàn trả vào tài khoản của quý khách.
         </p>
       </div>`
      : `<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
         <p style="color: #047857; margin: 0; line-height: 1.6;">
           Quý khách đã hủy phòng đúng hạn và không phát sinh phí phạt. <strong style="font-size: 16px;">Quý khách sẽ được hoàn lại 100% số tiền đã cọc.</strong><br>
           Thời gian hoàn tiền dự kiến từ 3-5 ngày làm việc tùy thuộc vào quy định của ngân hàng.
         </p>
       </div>`;

  const content = `
    <h2 style="color: #dc2626; margin-top: 0;">Xác nhận hủy đặt phòng</h2>
    <p>Kính chào quý khách <strong>${userName}</strong>,</p>
    <p>Hệ thống HuếHotel xác nhận đơn đặt phòng mã <strong style="color: #1e3a8a;">#${bookingId}</strong> của quý khách đã được hủy thành công theo yêu cầu.</p>
    
    ${penaltyHtml}

    <p style="margin-top: 25px;">Chúng tôi rất tiếc vì không thể đồng hành cùng quý khách trong chuyến đi lần này. Hy vọng HuếHotel sẽ có cơ hội được phục vụ quý khách vào những dịp tới.</p>
    <p>Trân trọng,<br><strong>Ban quản lý HuếHotel</strong></p>
  `;

  return await sendEmail(
    userEmail,
    `[Thông báo] Hủy đơn đặt phòng #${bookingId}`,
    generateHtmlTemplate(content),
    "CANCELLATION EMAIL",
  );
};

exports.sendDepositConfirmationEmail = async (toEmail, userName, booking) => {
  const subject = `[HuếHotel] Xác nhận thanh toán cọc thành công - Mã đặt phòng #${booking.id}`;

  // Tính toán số tiền còn lại phải thanh toán tại quầy
  const remainingAmount = booking.total_amount - booking.deposit_amount;

  // Format ngày tháng chuẩn Việt Nam (DD/MM/YYYY)
  const checkIn = new Date(booking.check_in_date).toLocaleDateString("vi-VN");
  const checkOut = new Date(booking.check_out_date).toLocaleDateString("vi-VN");

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #166534; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0;">Xác Nhận Thanh Toán Cọc</h2>
      </div>
      
      <div style="padding: 20px;">
        <p>Kính chào quý khách <strong>${userName}</strong>,</p>
        <p><strong>HuếHotel</strong> xin chân thành cảm ơn quý khách đã tin tưởng và lựa chọn dịch vụ của chúng tôi.</p>
        <p>Hệ thống xin xác nhận đã nhận được khoản thanh toán cọc cho đơn đặt phòng của quý khách. Dưới đây là thông tin chi tiết:</p>

        <div style="background-color: #f0fdf4; border-left: 4px solid #166534; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #15803d; margin-top: 0; font-size: 16px;">Chi tiết đơn phòng <span style="color: #1e3a8a;">#${booking.id}</span></h3>
          <ul style="list-style: none; padding-left: 0; line-height: 2; margin-bottom: 0;">
            <li><strong>Ngày nhận phòng:</strong> ${checkIn}</li>
            <li><strong>Ngày trả phòng:</strong> ${checkOut}</li>
            <li><strong>Tổng tiền hóa đơn:</strong> ${Number(booking.total_amount).toLocaleString("vi-VN")} VNĐ</li>
            <li><strong>Số tiền ĐÃ CỌC:</strong> <span style="color: #166534; font-size: 16px;"><strong>${Number(booking.deposit_amount).toLocaleString("vi-VN")} VNĐ</strong></span></li>
            <li style="border-top: 1px dashed #ccc; margin-top: 10px; padding-top: 10px;">
              <strong>Số tiền cần thanh toán tại quầy:</strong> <strong style="color: #dc2626; font-size: 16px;">${Number(remainingAmount).toLocaleString("vi-VN")} VNĐ</strong>
            </li>
          </ul>
        </div>

        <p style="margin-top: 20px;">Quý khách vui lòng xuất trình email này hoặc thẻ CCCD/CMND khi làm thủ tục nhận phòng tại quầy Lễ tân.</p>
        <p>Nếu cần hỗ trợ thêm, quý khách vui lòng phản hồi lại email này.</p>
      </div>

      <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 15px; text-align: center; color: #6b7280; font-size: 13px;">
        <p style="margin: 0;">Trân trọng,</p>
        <p style="margin: 5px 0 0 0; font-weight: bold; color: #374151;">Đội ngũ HuếHotel</p>
      </div>
    </div>
  `;

  // Gọi lại hàm sendEmail gốc của em
  return await sendEmail(toEmail, subject, htmlContent, "DEPOSIT_CONFIRMATION");
};

exports.sendInvoiceEmail = async (
  userEmail,
  userName,
  bookingId,
  pdfBuffer,
) => {
  const content = `
    <h2 style="color: #1e3a8a; margin-top: 0;">Hóa đơn thanh toán / Invoice</h2>
    <p>Kính chào quý khách <strong>${userName}</strong>,</p>
    <p>Cảm ơn quý khách đã tin tưởng và lựa chọn <strong>HuếHotel</strong> cho kỳ nghỉ của mình.</p>
    <p>Thủ tục trả phòng của quý khách đã hoàn tất. Chúng tôi xin gửi đính kèm hóa đơn chi tiết cho đơn đặt phòng <strong>#${bookingId}</strong> trong email này.</p>
    <p style="margin-top: 25px;">Kính chúc quý khách sức khỏe và hy vọng được đón tiếp quý khách trong những kỳ nghỉ tiếp theo!</p>
    <p>Trân trọng,<br><strong>Ban Lễ tân HuếHotel</strong></p>
  `;

  // Brevo API yêu cầu file đính kèm dưới dạng mã hóa Base64
  const attachments = [
    {
      content: pdfBuffer.toString("base64"),
      name: `Invoice-HueHotel-${bookingId}.pdf`,
    },
  ];

  return await sendEmail(
    userEmail,
    `[Hóa đơn] Cảm ơn quý khách đã lưu trú tại HuếHotel - Đơn #${bookingId}`,
    generateHtmlTemplate(content),
    "INVOICE EMAIL",
    attachments,
  );
};
