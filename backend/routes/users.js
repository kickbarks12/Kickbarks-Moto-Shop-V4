const express = require("express");
const User = require("../model/User");
const router = express.Router();

router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.session.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("ME ERROR:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// ADD ADDRESS
router.post("/addresses", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { label, street, city, province, zip } = req.body;

    if (!street || !city) {
      return res.status(400).json({ error: "Address is incomplete" });
    }

    const user = await User.findById(req.session.userId);

    user.addresses.push({
      label,
      street,
      city,
      province,
      zip
    });

    await user.save();

    res.json(user.addresses);
  } catch (err) {
    console.error("ADD ADDRESS ERROR:", err);
    res.status(500).json({ error: "Failed to add address" });
  }
});
// UPDATE ADDRESS
router.put("/addresses/:index", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const index = parseInt(req.params.index);
    const user = await User.findById(req.session.userId);

    if (!user.addresses[index]) {
      return res.status(404).json({ error: "Address not found" });
    }

    user.addresses[index] = {
      ...user.addresses[index],
      ...req.body
    };

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    console.error("UPDATE ADDRESS ERROR:", err);
    res.status(500).json({ error: "Failed to update address" });
  }
});
// DELETE ADDRESS
router.delete("/addresses/:index", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const index = parseInt(req.params.index);
    const user = await User.findById(req.session.userId);

    if (!user.addresses[index]) {
      return res.status(404).json({ error: "Address not found" });
    }

    user.addresses.splice(index, 1);
    await user.save();

    res.json(user.addresses);
  } catch (err) {
    console.error("DELETE ADDRESS ERROR:", err);
    res.status(500).json({ error: "Failed to delete address" });
  }
});



// ADD / REMOVE WISHLIST
router.post("/wishlist/:productId", async (req, res) => {
  if (!req.session.userId) {
  return res.status(401).json({
    success: false,
    message: "Unauthorized"
  });
}


  const user = await User.findById(req.session.userId);
  const productId = req.params.productId;

  const index = user.wishlist.indexOf(productId);

  if (index === -1) {
    user.wishlist.push(productId);
  } else {
    user.wishlist.splice(index, 1);
  }

  await user.save();
  res.json(user.wishlist);
});

// GET WISHLIST
router.get("/wishlist", async (req, res) => {
  if (!req.session.userId) {
  return res.status(401).json({
    success: false,
    message: "Unauthorized"
  });
}


  const user = await User.findById(req.session.userId)
    .populate("wishlist");

  res.json(user.wishlist);
});

// GET WISHLIST IDS ONLY
router.get("/wishlist-ids", async (req, res) => {
  if (!req.session.userId) {
  return res.status(401).json({
    success: false,
    message: "Unauthorized"
  });
}


  const user = await User.findById(req.session.userId);
  res.json(user.wishlist.map(id => id.toString()));
});

module.exports = router;
