const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");


require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:4000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);





app.use(
  session({
    name: "kickbarks.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
  httpOnly: true,
  sameSite: "lax",
  secure: false, // ✅ IMPORTANT FOR localhost
  maxAge: 1000 * 60 * 60 * 24
}

  })
);



// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/users", require("./routes/users"));
app.use("/api/vouchers", require("./routes/vouchers"));




// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Root = homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});


// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

  // GLOBAL ERROR HANDLER (must be after all routes)
app.use((err, req, res, next) => {
  console.error("🔥 UNHANDLED ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: "Something went wrong. Please try again."
  });
});


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Kickbarks ecommerce running on http://localhost:${PORT}`);
});


