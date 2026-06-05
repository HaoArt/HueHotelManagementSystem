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

    let holiday = 0,
      earlyIn = 0,
      lateOut = 0,
      overstay = 0,
      changeRoom = 0;
    const noteStr = invoiceData.note || "";

    const hMatch = noteStr.match(/\[HolidaySurcharge:(\d+(?:\.\d+)?)\]/);
    if (hMatch) holiday = parseFloat(hMatch[1]);

    const eMatch = noteStr.match(/\[EarlyInSurcharge:(\d+(?:\.\d+)?)\]/);
    if (eMatch) earlyIn = parseFloat(eMatch[1]);

    const lMatches = [
      ...noteStr.matchAll(/\[LateOutSurcharge:(\d+(?:\.\d+)?)\]/g),
    ];
    lMatches.forEach((m) => (lateOut += parseFloat(m[1])));

    const oMatch = noteStr.match(/\[OverstaySurcharge:(\d+(?:\.\d+)?)\]/);
    if (oMatch) overstay = parseFloat(oMatch[1]);

    const cMatch = noteStr.match(/\[ChangeRoomFee:(-?\d+(?:\.\d+)?)\]/);
    if (cMatch) changeRoom = parseFloat(cMatch[1]);

    let knownTotal = holiday + earlyIn + lateOut + overstay + changeRoom;
    let roomTotal = Number(invoiceData.base_price) * invoiceData.total_days;
    let roomGoc = roomTotal;
    let fallback =
      Number(invoiceData.total_amount) +
      Number(invoiceData.discount) -
      roomTotal -
      knownTotal;

    if (fallback < 0) {
      roomGoc =
        Number(invoiceData.total_amount) +
        Number(invoiceData.discount) -
        knownTotal;
      fallback = 0;
    }

    let fallbackReason = "";
    const sysNotes = noteStr.match(/\[Hệ thống:(.*?)\]/g);
    if (sysNotes && sysNotes.length > 0) {
      fallbackReason = sysNotes
        .map((n) => n.replace("[Hệ thống:", "").replace("]", "").trim())
        .join("; ");
    }

    if (fallback > 0 && !fallbackReason) {
      roomGoc += fallback;
      fallback = 0;
    }

    doc.text(`Tien phong luu tru (Room Charge)`, 50, currentY);
    doc.text(`${invoiceData.total_days}`, 250, currentY, {
      width: 50,
      align: "center",
    });
    doc.text(`${formatCurrency(invoiceData.base_price)}`, 310, currentY, {
      width: 100,
      align: "right",
    });
    doc.text(`${formatCurrency(roomGoc)}`, 430, currentY, {
      width: 115,
      align: "right",
    });

    let servicesTotal = 0;
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
        servicesTotal += Number(svc.total || 0);
      });
    }

    if (holiday > 0) {
      currentY += 20;
      doc.text("Phu thu Le/Tet (Holiday)", 50, currentY);
      doc.text("-", 250, currentY, { width: 50, align: "center" });
      doc.text("-", 310, currentY, { width: 100, align: "right" });
      doc.text(`${formatCurrency(holiday)}`, 430, currentY, {
        width: 115,
        align: "right",
      });
    }
    if (earlyIn > 0) {
      currentY += 20;
      doc.text("Phu thu Check-in som (Early In)", 50, currentY);
      doc.text("-", 250, currentY, { width: 50, align: "center" });
      doc.text("-", 310, currentY, { width: 100, align: "right" });
      doc.text(`${formatCurrency(earlyIn)}`, 430, currentY, {
        width: 115,
        align: "right",
      });
    }
    if (lateOut > 0) {
      currentY += 20;
      doc.text("Phu thu Check-out tre (Late Out)", 50, currentY);
      doc.text("-", 250, currentY, { width: 50, align: "center" });
      doc.text("-", 310, currentY, { width: 100, align: "right" });
      doc.text(`${formatCurrency(lateOut)}`, 430, currentY, {
        width: 115,
        align: "right",
      });
    }
    if (overstay > 0) {
      currentY += 20;
      doc.text("Phu thu o lo ngay (Overstay)", 50, currentY);
      doc.text("-", 250, currentY, { width: 50, align: "center" });
      doc.text("-", 310, currentY, { width: 100, align: "right" });
      doc.text(`${formatCurrency(overstay)}`, 430, currentY, {
        width: 115,
        align: "right",
      });
    }
    if (changeRoom !== 0) {
      currentY += 20;
      doc.text("Phi doi phong (Room Change)", 50, currentY);
      doc.text("-", 250, currentY, { width: 50, align: "center" });
      doc.text("-", 310, currentY, { width: 100, align: "right" });
      doc.text(`${formatCurrency(changeRoom)}`, 430, currentY, {
        width: 115,
        align: "right",
      });
      if (changeRoom < 0) doc.fillColor("green");
      else doc.fillColor(blackColor);
    }
    if (fallback > 0) {
      currentY += 20;
      doc.text("Phu thu khac (Surcharge)", 50, currentY);
      doc.text("-", 250, currentY, { width: 50, align: "center" });
      doc.text("-", 310, currentY, { width: 100, align: "right" });
      doc.text(`${formatCurrency(fallback)}`, 430, currentY, {
        width: 115,
        align: "right",
      });
    }

    if (invoiceData.discount > 0) {
      currentY += 20;
      doc.fillColor("red");
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

    // TỔNG CỘNG TOÀN BỘ HÓA ĐƠN
    const grandTotal =
      roomGoc +
      knownTotal +
      fallback +
      servicesTotal -
      Number(invoiceData.discount || 0);

    doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(10);
    doc.text("TONG HOA DON / GRAND TOTAL:", 150, currentY, {
      width: 260,
      align: "right",
    });
    doc.text(`${formatCurrency(grandTotal)}`, 430, currentY, {
      width: 115,
      align: "right",
    });

    currentY += 15;

    // ĐÃ ĐẶT CỌC (Phải có dấu trừ)
    if (invoiceData.deposit_amount && invoiceData.deposit_amount > 0) {
      doc.fillColor(blackColor).font("Helvetica").fontSize(10);
      doc.text("Da dat coc / Deposit:", 200, currentY, {
        width: 210,
        align: "right",
      });
      doc.text(
        `-${formatCurrency(invoiceData.deposit_amount)}`,
        430,
        currentY,
        {
          width: 115,
          align: "right",
        },
      );
      currentY += 15;
    }

    // CẦN THU THÊM HOẶC HOÀN TRẢ
    const remainingAmount =
      grandTotal - Number(invoiceData.deposit_amount || 0);

    // Đổi màu nền (Vàng nếu thu thêm, Xanh lá nếu hoàn tiền)
    doc
      .rect(420, currentY - 5, 125, 20)
      .fillAndStroke(
        remainingAmount > 0 ? "#F5EEDB" : "#e8f5e9",
        remainingAmount > 0 ? accentColor : "#4caf50",
      );

    doc.fillColor(blackColor).font("Helvetica-Bold").fontSize(12);
    doc.text(
      remainingAmount > 0
        ? "CAN THU THEM / AMOUNT DUE:"
        : "HOAN TRA / REFUND DUE:",
      150,
      currentY,
      {
        width: 260,
        align: "right",
      },
    );
    doc.text(`${formatCurrency(Math.abs(remainingAmount))}`, 430, currentY, {
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
