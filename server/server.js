const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const placeRoutes = require("./routes/placeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const adRoutes = require("./routes/adRoutes");
const userLogRoutes = require("./routes/userLogRoutes");
const busRoutes = require("./routes/busRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// MongoDB connection handler (cached for serverless deployment)
let isConnected = false;
async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      isConnected = true;
      console.log("MongoDB connected successfully");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use("/api/places", placeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/user-logs", userLogRoutes);
app.use("/api/buses", busRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Uva Explorer API is running",
    status: "online",
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Uva Explorer server running on port ${PORT}`);
  });
}

module.exports = app;