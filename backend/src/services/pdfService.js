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

// Hàm hỗ trợ format tiền tệ
const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString("vi-VN") + " VND";
};

exports.generateInvoicePDF = (dataCallback, endCallback, invoiceData) => {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    doc.on("data", dataCallback);
    doc.on("end", endCallback);

    // --- CẤU HÌNH MÀU SẮC (LUXURY THEME) ---
    const primaryColor = "#1B2D4F";
    const secondaryColor = "#9B8B7E";
    const accentColor = "#D4AF37"; 
    const blackColor = "#1A1A1A"; 

    doc
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("HUE HOTEL", { align: "center", characterSpacing: 2 });

    doc
      .fillColor(secondaryColor)
      .font("Helvetica")
      .fontSize(10)
      .text("NOI DI SAN HOI TU CUNG DANG CAP", {
        align: "center",
        characterSpacing: 1,
      })
      .moveDown(0.5);

    doc
      .fillColor(blackColor)
      .fontSize(9)
      .text(
        "77 Nguyen Hue, TP. Hue | Tel: 0234.3823.888 | Email: contact@huehotel.vn",
        { align: "center" },
      );

    doc.moveDown(1);


    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .lineWidth(1)
      .strokeColor(accentColor)
      .stroke();


    doc.moveDown(2);
    doc
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("HOA DON THANH TOAN / INVOICE", {
        align: "center",
        characterSpacing: 1,
      });
    doc.moveDown(2);

  
    const customerInfoTop = doc.y;


    doc.fillColor(blackColor).font("Helvetica-Bold").fontSize(10);
    doc.text("THONG TIN KHACH HANG (Guest Info)", 50, customerInfoTop);

    doc.font("Helvetica").fontSize(10);
    doc.text(
      `Khach hang / Guest: ${removeVietnameseTones(invoiceData.full_name)}`,
      50,
      customerInfoTop + 15,
    );
    doc.text(
      `Ma hoa don / Invoice No: #INV-${invoiceData.booking_id}`,
      50,
      customerInfoTop + 30,
    );
    doc.text(
      `Ngay in / Print Date: ${new Date().toLocaleDateString("vi-VN")}`,
      50,
      customerInfoTop + 45,
    );


    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("THONG TIN LUU TRU (Stay Info)", 300, customerInfoTop);

    doc.font("Helvetica").fontSize(10);
    doc.text(
      `Phong / Room: ${removeVietnameseTones(invoiceData.room_number)}`,
      300,
      customerInfoTop + 15,
    );
    doc.text(
      `Nhan phong / Check-in: ${new Date(invoiceData.check_in).toLocaleDateString("vi-VN")}`,
      300,
      customerInfoTop + 30,
    );
    doc.text(
      `Tra phong / Check-out: ${new Date(invoiceData.check_out).toLocaleDateString("vi-VN")}`,
      300,
      customerInfoTop + 45,
    );
    doc.text(
      `So dem / Nights: ${invoiceData.total_days} dem`,
      300,
      customerInfoTop + 60,
    );

    doc.moveDown(3);

    const tableTop = doc.y + 10;

    doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(10);
    doc.text("DIEN GIAI / Description", 50, tableTop);
    doc.text("SL / Qty", 250, tableTop, { width: 50, align: "center" });
    doc.text("DON GIA / Price", 310, tableTop, { width: 100, align: "right" });
    doc.text("THANH TIEN / Total", 430, tableTop, {
      width: 115,
      align: "right",
    });

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(545, tableTop + 15)
      .lineWidth(1)
      .strokeColor(primaryColor)
      .stroke();

    let currentY = tableTop + 25;
    doc.fillColor(blackColor).font("Helvetica").fontSize(10);

    doc.text(`Tien phong (Room Charge)`, 50, currentY);
    doc.text(`${invoiceData.total_days}`, 250, currentY, {
      width: 50,
      align: "center",
    });
    doc.text(`${formatCurrency(invoiceData.base_price)}`, 310, currentY, {
      width: 100,
      align: "right",
    });
    const roomTotal = Number(invoiceData.base_price) * invoiceData.total_days;
    doc.text(`${formatCurrency(roomTotal)}`, 430, currentY, {
      width: 115,
      align: "right",
    });

    if (invoiceData.services && invoiceData.services.length > 0) {
      invoiceData.services.forEach((svc) => {
        currentY += 20;
        doc.text(`${removeVietnameseTones(svc.service_name)}`, 50, currentY);
        doc.text(`${svc.quantity}`, 250, currentY, {
          width: 50,
          align: "center",
        });
        doc.text(`${formatCurrency(svc.price)}`, 310, currentY, {
          width: 100,
          align: "right",
        });
        doc.text(`${formatCurrency(svc.total)}`, 430, currentY, {
          width: 115,
          align: "right",
        });
      });
    }

    if (invoiceData.surcharge > 0) {
      currentY += 20;
      doc.text("Phu thu (Surcharge / Penalty)", 50, currentY);
      doc.text("-", 250, currentY, { width: 50, align: "center" });
      doc.text("-", 310, currentY, { width: 100, align: "right" });
      doc.text(`${formatCurrency(invoiceData.surcharge)}`, 430, currentY, {
        width: 115,
        align: "right",
      });
    }

    if (invoiceData.discount > 0) {
      currentY += 20;
      doc.fillColor("red"); // Chuyển màu đỏ cho khoản trừ tiền
      doc.text("Giam gia (Discount / Voucher)", 50, currentY);
      doc.text("-", 250, currentY, { width: 50, align: "center" });
      doc.text("-", 310, currentY, { width: 100, align: "right" });
      doc.text(`-${formatCurrency(invoiceData.discount)}`, 430, currentY, {
        width: 115,
        align: "right",
      });
      doc.fillColor(blackColor); 
    }

    currentY += 20;
    doc
      .moveTo(50, currentY)
      .lineTo(545, currentY)
      .lineWidth(0.5)
      .strokeColor(secondaryColor)
      .stroke();

    currentY += 15;

    // Tiền đã cọc
    if (invoiceData.deposit_amount && invoiceData.deposit_amount > 0) {
      doc.font("Helvetica").fontSize(10);
      doc.text("Da dat coc / Deposit:", 200, currentY, {
        width: 210,
        align: "right",
      });
      doc.text(`${formatCurrency(invoiceData.deposit_amount)}`, 430, currentY, {
        width: 115,
        align: "right",
      });
      currentY += 15;
    }

    doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(12);
    doc.text("TONG THANH TOAN / GRAND TOTAL:", 150, currentY, {
      width: 260,
      align: "right",
    });

    doc
      .rect(420, currentY - 5, 125, 20)
      .fillAndStroke(`${accentColor}20`, accentColor);

    doc.fillColor(blackColor).font("Helvetica-Bold").fontSize(12);
    doc.text(`${formatCurrency(invoiceData.total_amount)}`, 430, currentY, {
      width: 110,
      align: "right",
    });

    currentY += 50;
    doc.fillColor(blackColor).font("Helvetica-Bold").fontSize(10);
    doc.text("Khach hang / Guest", 100, currentY);
    doc.text("Le tan / Receptionist", 400, currentY);

    doc.font("Helvetica-Oblique").fontSize(8).fillColor(secondaryColor);
    doc.text("(Ky, ghi ro ho ten)", 100, currentY + 15);
    doc.text("(Ky, ghi ro ho ten)", 400, currentY + 15);

    doc.fontSize(9).fillColor(primaryColor);
    doc.text(
      "Cam on quy khach da tin tuong va lua chon Hue Hotel. Hen gap lai!",
      50,
      750,
      { align: "center" },
    );

    doc.end();
  } catch (err) {
    console.error("Lỗi xuất PDF:", err);
    endCallback();
  }
};
