const nodemailer = require("nodemailer");

module.exports = async (email, order) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    to: email,
    subject: "Refund Request Received",
    html: `
      <h3>Refund Request Submitted</h3>
      <p>Order ID: <strong>${order._id}</strong></p>
      <p>Amount: ₱${order.refundAmount}</p>
      <p>Reason:</p>
      <blockquote>${order.refundReason}</blockquote>
      <p>We will review your request shortly.</p>
    `
  });
};
