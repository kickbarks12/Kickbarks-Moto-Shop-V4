const express = require("express");
const Voucher = require("../model/Voucher");
const router = express.Router();

/**
 * GET available vouchers (for display)
 */
router.get("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const vouchers = await Voucher.find({ active: true });

    res.json(vouchers);
  } catch (err) {
    console.error("FETCH VOUCHERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch vouchers" });
  }
});

/**
 * APPLY voucher (preview only)
 * This does NOT delete the voucher
 * Deletion happens AFTER order success
 */
router.post("/apply", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        valid: false,
        message: "Please login to use a voucher"
      });
    }

    const { code, subtotal } = req.body;

    if (!code || !subtotal) {
      return res.status(400).json({
        valid: false,
        message: "Voucher code and subtotal are required"
      });
    }

    const voucher = await Voucher.findOne({
      code: code.toUpperCase(),
      active: true
    });

    if (!voucher) {
      return res.json({
        valid: false,
        message: "Invalid or expired voucher"
      });
    }

    if (voucher.minSpend && Number(subtotal) < Number(voucher.minSpend)) {
      return res.json({
        valid: false,
        message: `Minimum spend ₱${voucher.minSpend}`
      });
    }

    const discount = Math.min(voucher.amount, Number(subtotal));
    const finalTotal = Number(subtotal) - discount;

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
