const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  amount: {
    type: Number,
    required: true,
    min: 1
  },

  minSpend: {
    type: Number,
    default: 0
  },

  expiresAt: {
    type: Date,
    default: null
  },

  usedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Voucher", voucherSchema);
