const mongoose = require("mongoose");

const express = require("express");
const Voucher = require("../model/Voucher");
const router = express.Router();

router.post("/apply", async (req, res) => {
  try {
    // 1️⃣ Auth check
    if (!req.session.userId) {
      return res.status(401).json({
        valid: false,
        message: "Please login to use a voucher"
      });
    }

    const { code, subtotal } = req.body;
console.log("Voucher lookup code:", code.toUpperCase());

    // 2️⃣ Basic validation
    if (!code || !subtotal) {
      return res.status(400).json({
        valid: false,
        message: "Voucher code and subtotal are required"
      });
    }

    // 3️⃣ Find voucher
    const voucher = await Voucher.findOne({
      code: code.toUpperCase(),
      active: true
    });

    if (!voucher) {
      return res.json({
        valid: false,
        message: "Invalid voucher code"
      });
    }

    // 4️⃣ Expiry check
    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      return res.json({
        valid: false,
        message: "Voucher has expired"
      });
    }

    // 5️⃣ Minimum spend check
   console.log("CHECK MIN SPEND:");
console.log("Subtotal:", subtotal, typeof subtotal);
console.log("MinSpend:", voucher.minSpend, typeof voucher.minSpend);

if (Number(subtotal) < Number(voucher.minSpend)) {
  return res.json({
    valid: false,
    message: `Minimum spend ₱${voucher.minSpend}`
  });
}


    // 6️⃣ One-time use check
    if (Array.isArray(voucher.usedBy) &&
    voucher.usedBy.includes(req.session.userId)) {
  return res.json({
    valid: false,
    message: "Voucher already used"
  });
}


    // 7️⃣ Calculate discount
    const discount = Math.min(voucher.amount, subtotal);
    const finalTotal = subtotal - discount;

    // 8️⃣ Success
    res.json({
      valid: true,
      code: voucher.code,
      discount,
      finalTotal
    });

  } catch (err) {
    console.error("VOUCHER APPLY ERROR:", err);
    res.status(500).json({
      valid: false,
      message: "Failed to apply voucher"
    });
  }
});

module.exports = router;
