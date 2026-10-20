const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if custom dns is restricted
}

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
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

// MongoDB connection handler (optimized for serverless and long-running processes)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const FALLBACK_MONGO_URI =
  "mongodb+srv://vishmikarasanjana20020726_db_user:Pi07bVUY8XxNmqTc@cluster1.inbjnqt.mongodb.net/uva_explorer?retryWrites=true&w=majority";

async function connectDB() {
  // If already connected, reuse existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const isVercel = Boolean(process.env.VERCEL || process.env.NODE_ENV === "production");
  let mongoUri = process.env.MONGO_URI;

  // On Vercel or when not provided, fallback to production cluster1
  if (!mongoUri || (isVercel && (mongoUri.includes("127.0.0.1") || mongoUri.includes("localhost")))) {
    mongoUri = FALLBACK_MONGO_URI;
  }

  // If connection dropped or promise was null, initiate connection
  if (!cached.promise || mongoose.connection.readyState === 0) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      dbName: process.env.DB_NAME || "uva_explorer",
    };

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error("MongoDB connection error:", error.message);
    return null;
  }
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("connectDB middleware error:", err.message);
  }
  next();
});

// Routes
app.use("/api/places", placeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/user-logs", userLogRoutes);
app.use("/api/buses", busRoutes);

// Test & Health routes
app.get("/", (req, res) => {
  res.json({
    message: "Uva Explorer API is running",
    status: "online",
  });
});

app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "online",
    database: isConnected ? "connected" : "disconnected",
    dbHost: isConnected ? mongoose.connection.host : null,
    environment: process.env.VERCEL ? "vercel-serverless" : (process.env.NODE_ENV || "development"),
    timestamp: new Date().toISOString(),
  });
});


const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`Uva Explorer server running on port ${PORT}`);
  });
}


module.exports = app;