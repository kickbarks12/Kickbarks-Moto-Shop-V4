const transporter = require("../config/mailer");
const fs = require("fs");
const path = require("path");

/**
 * Sends order receipt email
 * - NEVER throws (safe)
 * - Does NOT block checkout
 */
async function sendReceiptEmail(order, userEmail) {
  try {
    if (!userEmail) return;

    // Load HTML template
    const templatePath = path.join(
      __dirname,
      "../emails/order-receipt.html"
    );

    let html = fs.readFileSync(templatePath, "utf8");

    // Build items list
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding:6px 0">${item.name} × ${item.qty}</td>
        <td align="right">₱${item.price * item.qty}</td>
      </tr>
    `).join("");

    // Replace template variables
    html = html
      .replace("{{ORDER_ID}}", order._id)
      .replace("{{ORDER_DATE}}", new Date(order.date).toLocaleString())
      .replace("{{ORDER_ITEMS}}", itemsHtml)
      .replace("{{ORDER_TOTAL}}", order.total);

      console.log("📧 Attempting to send receipt to:", userEmail);
console.log("📧 Receipt email sent:", userEmail);


    // Send email (safe)
    await transporter.sendMail({
      to: userEmail,
      subject: "Your Order Receipt - Kickbarks Moto Shop",
      html
    });

    console.log("📧 Receipt email sent:", userEmail);

  } catch (err) {
    // ❗ DO NOT throw
    console.error("❌ Receipt email failed:", err.message);

  }
}

module.exports = sendReceiptEmail;
