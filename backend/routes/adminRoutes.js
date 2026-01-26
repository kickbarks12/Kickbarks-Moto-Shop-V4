const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

router.get("/dashboard", requireAuth, requireAdmin, (req, res) => {
  res.json({
    message: "Welcome Admin",
    email: req.user.email,
    role: req.user.role
  });
});

module.exports = router;
