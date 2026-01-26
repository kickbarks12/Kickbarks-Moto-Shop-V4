const express = require("express");
const Product = require("../model/Product");
const router = express.Router();

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const products = await Product.find();

  const result = products.map(p => {
    const reviews = p.reviews || [];
    const count = reviews.length;
    const avg =
      count === 0
        ? 0
        : reviews.reduce((s, r) => s + r.rating, 0) / count;

    return {
      ...p.toObject(),
      ratingAvg: avg,
      ratingCount: count
    };
  });

  res.json(result);
});


// GET SINGLE PRODUCT BY ID (THIS FIXES YOUR ERROR)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: "Invalid product ID" });
  }
});


module.exports = router;
