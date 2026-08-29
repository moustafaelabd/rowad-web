require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const articleRoutes = require("./routes/articleRoutes");
const projectRoutes = require("./routes/projectRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const heroSlideRoutes = require("./routes/heroSlideRoutes");
const settingsRoutes = require("./routes/settingRoutes"); // بدون s (اسم الملف عندك)

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Uploaded images
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public", "uploads"))
);

// =========================
// Pages
// =========================

// Home / index
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Admin panel
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Store page
app.get("/store", (req, res) => {
  res.sendFile(path.join(__dirname, "store.html"));
});

// Cart page
app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "cart.html"));
});

// Static files (public folder: uploads, etc.)
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname))); // يخدم أي ملف في الجذر زي admin.css
// =========================
// API
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/hero-slides", heroSlideRoutes);
app.use("/api/settings", settingsRoutes);

// =========================
// Home
// =========================

app.get("/", (req, res) => {
  res.send("رواد الظل API شغال ✅");
});

// =========================
// Server
// =========================

const PORT = process.env.PORT || 4000;

sequelize
  .sync()
  .then(() => {
    console.log("✅ Database connected");

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`🛠️ Admin panel: http://localhost:${PORT}/admin`);
      console.log(`🛍️ Store: http://localhost:${PORT}/store`);
      console.log(`🛒 Cart: http://localhost:${PORT}/cart`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:");
    console.error(err);
  });
