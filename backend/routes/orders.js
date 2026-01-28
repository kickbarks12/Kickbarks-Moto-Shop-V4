const express = require("express");
const Order = require("../model/Order");
const User = require("../model/User");
const router = express.Router();
const sendReceiptEmail = require("../utils/sendReceiptEmail");
const generateReceiptPDF = require("../utils/generateReceiptPDF");
const sendRefundEmail = require("../utils/sendRefundEmail");
const Voucher = require("../model/Voucher");





router.post("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const { items, voucher } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items" });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 1️⃣ Subtotal
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      return sum + price * qty;
    }, 0);

    // 2️⃣ Voucher logic (CORRECT LOCATION)
    // 2️⃣ Voucher logic (ONE-TIME USE)
let discount = 0;
let appliedVoucher = null;

if (voucher) {
  const foundVoucher = await Voucher.findOne({
    code: voucher.toUpperCase(),
    active: true
  });

  if (!foundVoucher) {
    return res.status(400).json({ error: "Invalid or expired voucher" });
  }

  if (subtotal < foundVoucher.minSpend) {
    return res.status(400).json({
      error: `Minimum spend ₱${foundVoucher.minSpend}`
    });
  }

  discount = foundVoucher.amount;
  appliedVoucher = foundVoucher;
}


    // 3️⃣ Final total (backend truth)
    const finalTotal = Math.max(subtotal - discount, 0);

    // 4️⃣ Create order
    const order = await Order.create({
      userId: user._id,
      items,
      total: finalTotal,
      voucher: appliedVoucher ? appliedVoucher.code : null,
      discount,
      status: "Pending",
      date: new Date()
    });
// 🧹 Remove voucher after successful use
if (appliedVoucher) {
  await Voucher.findByIdAndDelete(appliedVoucher._id);
}

    sendReceiptEmail(order, user.email);

    res.json({
      success: true,
      orderId: order._id,
      finalTotal
    });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: "Order processing failed" });
  }
});


// GET USER ORDERS
// GET USER ORDERS (with pagination + search)
router.get("/", async (req, res) => {
  try {
    // 1️⃣ Auth check
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    // 2️⃣ Read query params
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // orders per page
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // 3️⃣ Build query
    const query = {
      userId: req.session.userId
    };

    // 4️⃣ Optional search (status or order ID)
    if (search) {
      query.$or = [
        { status: { $regex: search, $options: "i" } },
        ...(search.match(/^[0-9a-fA-F]{24}$/)
          ? [{ _id: search }]
          : [])
      ];
    }

    // 5️⃣ Count total orders
    const totalOrders = await Order.countDocuments(query);

    // 6️⃣ Fetch paginated orders
    const orders = await Order.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // 7️⃣ Respond
    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit)
    });

  } catch (err) {
    console.error("FETCH ORDERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});


// GET SINGLE ORDER
router.get("/:id", async (req, res) => {
  if (!req.session.userId) return res.status(401).end();

  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.session.userId
  });

  if (!order) return res.status(404).end();

  res.json(order);
});
router.get("/:id/receipt", async (req, res) => {
  try {
    // 1️⃣ Auth check
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const { id } = req.params;

    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    // 2️⃣ Ownership check
    const order = await Order.findOne({
      _id: id,
      userId: req.session.userId
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 3️⃣ Generate receipt
    generateReceiptPDF(order, res);

  } catch (err) {
    console.error("RECEIPT ERROR:", err);
    res.status(500).json({ error: "Failed to generate receipt" });
  }
});


// CANCEL ORDER (Pending only)
router.patch("/:id/cancel", async (req, res) => {
  try {
    // 1️⃣ Auth check
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const { id } = req.params;

    // 2️⃣ Find order
    const order = await Order.findOne({
      _id: id,
      userId: req.session.userId
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 3️⃣ Check status
    if (order.status !== "Pending") {
      return res.status(400).json({
        error: "Only pending orders can be cancelled"
      });
    }

    // 4️⃣ Update status
    order.status = "Cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (err) {
    console.error("CANCEL ORDER ERROR:", err);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});
// REQUEST REFUND
router.patch("/:id/refund", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Refund reason required" });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.session.userId
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

   if (order.refundStatus === "Refunded" || order.refundStatus === "Requested") {
  return res.status(400).json({
    error: "Refund already requested"
  });
}


    if (order.status === "Pending") {
      return res.status(400).json({
        error: "Cancel order before requesting refund"
      });
    }

    order.refundStatus = "Requested";
    order.refundReason = reason;
    order.refundAmount = order.total;

    await order.save();

    // 📧 SEND EMAIL
    const user = await User.findById(order.userId);
    sendRefundEmail(user.email, order);

    res.json({ success: true });

  } catch (err) {
    console.error("REFUND ERROR:", err);
    res.status(500).json({ error: "Refund failed" });
  }
});


module.exports = router;






