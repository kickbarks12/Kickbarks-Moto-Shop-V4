const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  rating: Number,
  comment: String,
  date: {
    type: Date,
    default: Date.now
  }
});


const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  description: String,
  reviews: [ReviewSchema]
});

module.exports = mongoose.model("Product", ProductSchema);
