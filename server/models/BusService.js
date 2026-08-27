const mongoose = require("mongoose");

const busServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  routeNumber: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  via: { type: String, required: true },
  fare: { type: String, required: true },
  busType: { type: String, required: true },
  phone: { type: String, default: "N/A" },
  conductorPhone: { type: String, default: "N/A" },
  hotline: { type: String, default: "1955 (NTC Hotline)" },
  description: { type: String, default: "" },
  image: { type: String, default: "/images/places/default.jpg" },
  position: {
    type: [Number],
    default: [6.82977, 80.98457],
  },
  routeWaypoints: {
    type: [[Number]],
    default: [],
  },
  busTimes: [
    {
      time: { type: String, required: true },
      tag: { type: String, default: "Express" },
      icon: { type: String, default: "⏰" },
    },
  ],
  rating: { type: Number, default: 4.7 },
  reviews: { type: Number, default: 120 },
  isInternal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

busServiceSchema.index({ name: "text", routeNumber: "text", via: "text", busType: "text" });

module.exports = mongoose.model("BusService", busServiceSchema);
