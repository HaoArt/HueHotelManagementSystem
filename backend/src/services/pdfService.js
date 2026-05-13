const PDFDocument = require("pdfkit");

// Thuật toán khử dấu tiếng Việt để chống Crash Server Node.js
const removeVietnameseTones = (str) => {
  if (!str) return "";
  let result = str.toString();
  result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  result = result.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  result = result.replace(/đ/g, "d");
  result = result.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  result = result.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  result = result.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  result = result.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  result = result.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  result = result.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  result = result.replace(/Đ/g, "D");
  return result;
};

exports.generateInvoicePDF = (dataCallback, endCallback, invoiceData) => {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    doc.on("data", dataCallback);
    doc.on("end", endCallback);

    // --- 1. Header: Thông tin khách sạn ---
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("HUEHOTEL - CO DO XANH", { align: "center" });
    doc
      .font("Helvetica")
      .fontSize(10)
      .text("Dia chi: 77 Nguyen Hue, TP. Hue", { align: "center" });
    doc.text("Dien thoai: 0234.3823.xxx", { align: "center" });
    doc.moveDown();
    doc.moveTo(50, 110).lineTo(545, 110).stroke();

    // --- 2. Tiêu đề hóa đơn ---
    doc.moveDown(2);
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("HOA DON THANH TOAN (FOLIO)", { align: "center" });
    doc.moveDown(1.5);

    // --- 3. Thông tin khách hàng & Booking ---
    doc.font("Helvetica").fontSize(11);
    doc.text(`Ma hoa don: #INV-${invoiceData.booking_id}`);
    doc.text(`Khach hang: ${removeVietnameseTones(invoiceData.full_name)}`);
    doc.text(`Ngay thanh toan: ${new Date().toLocaleDateString("vi-VN")}`);
    doc.text(
      `Thoi gian luu tru: ${new Date(invoiceData.check_in).toLocaleDateString("vi-VN")} toi ${new Date(invoiceData.check_out).toLocaleDateString("vi-VN")}`,
    );
    doc.moveDown(2);

    // --- 4. Bảng chi tiết dịch vụ ---
    const tableTop = 270;

    // In Header Bảng
    doc.font("Helvetica-Bold").fontSize(11);
    doc.text("Noi dung", 50, tableTop, { width: 200, align: "left" });
    doc.text("Don gia", 250, tableTop, { width: 100, align: "right" });
    doc.text("So luong", 350, tableTop, { width: 80, align: "right" });
    doc.text("Thanh tien", 430, tableTop, { width: 115, align: "right" });

    // Vẽ đường kẻ dưới Header
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(545, tableTop + 15)
      .stroke();

    // In Nội dung: Tiền phòng
    doc.font("Helvetica").fontSize(11);
    let currentY = tableTop + 25;
    doc.text(
      `Tien phong (P.${removeVietnameseTones(invoiceData.room_number)})`,
      50,
      currentY,
      { width: 200, align: "left" },
    );
    doc.text(
      `${Number(invoiceData.base_price).toLocaleString("vi-VN")} d`,
      250,
      currentY,
      { width: 100, align: "right" },
    );
    doc.text(`${invoiceData.total_days} dem`, 350, currentY, {
      width: 80,
      align: "right",
    });
    doc.text(
      `${(Number(invoiceData.base_price) * invoiceData.total_days).toLocaleString("vi-VN")} d`,
      430,
      currentY,
      { width: 115, align: "right" },
    );

    // In Nội dung: Phụ thu (Nếu có)
    if (invoiceData.surcharge > 0) {
      currentY += 20;
      doc.text("Phu thu (Le/Tet hoac Tra tre)", 50, currentY, {
        width: 200,
        align: "left",
      });
      doc.text("-", 250, currentY, { width: 100, align: "right" });
      doc.text("-", 350, currentY, { width: 80, align: "right" });
      doc.text(
        `${Number(invoiceData.surcharge).toLocaleString("vi-VN")} d`,
        430,
        currentY,
        { width: 115, align: "right" },
      );
    }

    // In Nội dung: Giảm giá (Nếu có)
    if (invoiceData.discount > 0) {
      currentY += 20;
      doc.text("Ma giam gia / Hang thanh vien", 50, currentY, {
        width: 200,
        align: "left",
      });
      doc.text("-", 250, currentY, { width: 100, align: "right" });
      doc.text("-", 350, currentY, { width: 80, align: "right" });
      doc.text(
        `-${Number(invoiceData.discount).toLocaleString("vi-VN")} d`,
        430,
        currentY,
        { width: 115, align: "right" },
      );
    }

    // Vẽ đường kẻ dưới Tổng kết
    doc
      .moveTo(50, currentY + 20)
      .lineTo(545, currentY + 20)
      .stroke();

    // --- 5. Tổng kết tiền ---
    currentY += 35;
    doc.font("Helvetica-Bold").fontSize(13);
    doc.text("TONG CONG:", 250, currentY, { width: 100, align: "right" });
    doc.text(
      `${Number(invoiceData.total_amount).toLocaleString("vi-VN")} VND`,
      350,
      currentY,
      { width: 195, align: "right" },
    );

    // --- 6. Chân trang ---
    doc.font("Helvetica-Oblique").fontSize(10);
    doc.text("Cam on quy khach da lua chon HueHotel. Hen gap lai!", 50, 720, {
      align: "center",
    });

    doc.end();
  } catch (err) {
    console.error("Lỗi xuất PDF:", err);
    endCallback();
  }
};
