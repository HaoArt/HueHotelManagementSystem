const PDFDocument = require("pdfkit");

exports.generateInvoicePDF = (dataCallback, endCallback, invoiceData) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // --- 1. Header: Thông tin khách sạn ---
  doc.fontSize(20).text("HUẾHOTEL - CỐ ĐÔ XANH", { align: "center" });
  doc.fontSize(10).text("Địa chỉ: 77 Nguyễn Huệ, TP. Huế", { align: "center" });
  doc.text("Điện thoại: 0234.3823.xxx", { align: "center" });
  doc.moveDown();
  doc.moveTo(50, 110).lineTo(550, 110).stroke();

  // --- 2. Tiêu đề hóa đơn ---
  doc.moveDown(2);
  doc
    .fontSize(18)
    .text("HÓA ĐƠN THANH TOÁN (FOLIO)", { align: "center", underline: true });
  doc.moveDown();

  // --- 3. Thông tin khách hàng & Booking ---
  doc.fontSize(12).text(`Mã hóa đơn: #INV-${invoiceData.booking_id}`);
  doc.text(`Khách hàng: ${invoiceData.full_name}`);
  doc.text(`Ngày thanh toán: ${new Date().toLocaleDateString("vi-VN")}`);
  doc.text(
    `Thời gian lưu trú: ${new Date(invoiceData.check_in).toLocaleDateString("vi-VN")} - ${new Date(invoiceData.check_out).toLocaleDateString("vi-VN")}`,
  );
  doc.moveDown();

  // --- 4. Bảng chi tiết dịch vụ ---
  const tableTop = 250;
  doc.fontSize(12).text("Nội dung", 50, tableTop, { bold: true });
  doc.text("Đơn giá", 300, tableTop, { align: "right" });
  doc.text("Số lượng", 400, tableTop, { align: "right" });
  doc.text("Thành tiền", 500, tableTop, { align: "right" });

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  // Dòng 1: Tiền phòng
  let currentY = tableTop + 30;
  doc.text(`Tiền phòng (${invoiceData.room_number})`, 50, currentY);
  doc.text(
    `${Number(invoiceData.base_price).toLocaleString("vi-VN")}đ`,
    300,
    currentY,
    {
      align: "right",
    },
  );
  doc.text(`${invoiceData.total_days} đêm`, 400, currentY, { align: "right" });
  doc.text(
    `${(Number(invoiceData.base_price) * invoiceData.total_days).toLocaleString(
      "vi-VN",
    )}đ`,
    500,
    currentY,
    { align: "right" },
  );

  // Dòng 2: Phụ thu (Nếu có)
  if (invoiceData.surcharge > 0) {
    currentY += 20;
    doc.text("Phụ thu (Lễ/Tết hoặc Trả trễ)", 50, currentY);
    doc.text(
      `${Number(invoiceData.surcharge).toLocaleString("vi-VN")}đ`,
      500,
      currentY,
      {
        align: "right",
      },
    );
  }

  // Dòng 3: Giảm giá (Nếu có)
  if (invoiceData.discount > 0) {
    currentY += 20;
    doc.fillColor("red").text("Mã giảm giá", 50, currentY);
    doc.text(
      `-${Number(invoiceData.discount).toLocaleString("vi-VN")}đ`,
      500,
      currentY,
      {
        align: "right",
      },
    );
    doc.fillColor("black");
  }

  doc
    .moveTo(50, currentY + 20)
    .lineTo(550, currentY + 20)
    .stroke();

  // --- 5. Tổng kết tiền ---
  currentY += 40;
  doc.fontSize(14).text("TỔNG CỘNG:", 350, currentY, { bold: true });
  doc.text(
    `${Number(invoiceData.total_amount).toLocaleString("vi-VN")} VNĐ`,
    500,
    currentY,
    {
      align: "right",
    },
  );

  // --- 6. Chân trang ---
  doc
    .fontSize(10)
    .italic()
    .text("Cảm ơn quý khách đã lựa chọn HuếHotel. Hẹn gặp lại!", 50, 700, {
      align: "center",
    });

  doc.end();
};
