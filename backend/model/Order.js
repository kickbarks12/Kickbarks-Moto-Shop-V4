const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: Array,
  total: Number,
  voucher: String,
  discount: Number,
  status: String,
  refundStatus: String,
  refundReason: String,
  refundAmount: Number,
  date: Date
});

module.exports = mongoose.model("Order", orderSchema);
