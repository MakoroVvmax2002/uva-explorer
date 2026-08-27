const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, default: "" },
  phone: { type: String, default: "N/A" },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 12 },
  image: { type: String, default: "" },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  openingDays: { type: String, default: "Monday - Sunday" },
  openingHours: { type: String, default: "08:00 AM - 08:00 PM" },
  googleMapsUrl: { type: String, default: "" },
  googlePlaceId: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

// Optimization: Indexes for fast text search and location queries
facilitySchema.index({ name: "text", type: "text", location: "text" });
facilitySchema.index({ type: 1, location: 1 });

module.exports = mongoose.model("Facility", facilitySchema);
