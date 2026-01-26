// const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema({
//   userId: mongoose.Schema.Types.ObjectId,
//   items: Array,
//   total: Number,
//   status: {
//     type: String,
//     default: "Pending"
//   },
//   date: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model("Order", OrderSchema);
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: Array,
  total: Number,
  status: String,
  date: Date,

  refundStatus: {
  type: String,
  enum: ["None", "Requested", "Refunded"],
  default: "None"
},
refundAmount: {
  type: Number,
  default: 0
},
refundDate: {
  type: Date
},
refundReason: {
  type: String
}

});

module.exports = mongoose.model("Order", OrderSchema);
