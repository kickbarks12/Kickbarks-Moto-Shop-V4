const PDFDocument = require("pdfkit");

function generateReceiptPDF(order, res) {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4"
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${order._id}.pdf`
  );

  doc.pipe(res);

  /* ======================
     HEADER
  ====================== */
  doc
    .fontSize(22)
    .fillColor("#198754")
    .text("Kickbarks Moto Shop", { align: "center" });

  doc
    .moveDown(0.3)
    .fontSize(12)
    .fillColor("#555")
    .text("Official Order Receipt", { align: "center" });

  doc.moveDown(2);

  /* ======================
     ORDER INFO
  ====================== */
  doc
    .fontSize(11)
    .fillColor("#000")
    .text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.date).toLocaleString()}`);

  doc.moveDown(1.5);

  /* ======================
     ITEMS HEADER
  ====================== */
  doc
    .fontSize(12)
    .fillColor("#000")
    .text("Items", { underline: true });

  doc.moveDown(0.8);

  /* ======================
     ITEMS LIST
  ====================== */
  order.items.forEach(item => {
    doc
      .fontSize(11)
      .fillColor("#000")
      .text(
        `${item.name} × ${item.qty}`,
        { continued: true }
      )
      .text(
        `₱${item.price * item.qty}`,
        { align: "right" }
      );
  });

  doc.moveDown(1.5);

  /* ======================
     TOTAL
  ====================== */
  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .strokeColor("#ddd")
    .stroke();

  doc.moveDown(1);

  doc
    .fontSize(14)
    .fillColor("#198754")
    .text(
      `Total: ₱${order.total}`,
      { align: "right" }
    );

  doc.moveDown(3);

  /* ======================
     FOOTER
  ====================== */
  doc
    .fontSize(10)
    .fillColor("#777")
    .text(
      "Thank you for shopping with Kickbarks Moto Shop.\nRide safe and strong",
      { align: "center" }
    );

  doc.end();
}

module.exports = generateReceiptPDF;
