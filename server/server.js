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

// MongoDB connection handler (cached for ultra-fast serverless execution)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise && process.env.MONGO_URI) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    };
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection error:", error.message);
  }
  return cached.conn;
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