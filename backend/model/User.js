const mongoose = require("mongoose");

/* Address sub-schema */
const AddressSchema = new mongoose.Schema({
  label: String,        // Home, Office, etc
  street: String,
  city: String,
  province: String,
  zip: String
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  mobile: {
    type: String,
    default: ""
  },

  birthday: {
    type: Date
  },

  addresses: {
  type: [AddressSchema],
  default: []
},
  vouchers: {
    type: Number,
    default: 0
  },

  wishlist: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
  ]

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
