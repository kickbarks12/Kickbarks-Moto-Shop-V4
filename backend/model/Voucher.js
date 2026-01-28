const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },

  amount: {
    type: Number,
    required: true
  },

  minSpend: {
    type: Number,
    default: 0
  },

  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Voucher", VoucherSchema);
