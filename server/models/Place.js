const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  district: {
    type: String,
    default: "Badulla",
  },

  province: {
    type: String,
    default: "Uva",
  },

  category: {
    type: String,
    required: true,
  },

  distance: {
    type: String,
    default: "",
  },

  rating: {
    type: Number,
    default: 0,
  },

  reviews: {
    type: Number,
    default: 0,
  },

  description: {
    type: String,
    default: "",
  },

  image: {
    type: String,
    default: "",
  },

  images: {
    type: [String],
    default: [],
  },

  openingDays: {
    type: String,
    default: "Monday - Sunday",
  },

  openingHours: {
    type: String,
    default: "06:00 AM - 06:00 PM",
  },

  googleMapsUrl: {
    type: String,
    default: "",
  },

  googlePlaceId: {
    type: String,
    default: "",
  },

  ticketInfo: {
    hasTicket: { type: Boolean, default: false },
    badgeText: { type: String, default: "" },
    foreignAdult: { type: String, default: "" },
    localAdult: { type: String, default: "" },
    vehicleFee: { type: String, default: "" },
    paymentMethods: { type: String, default: "" },
    notes: { type: String, default: "" },
    passes: [
      {
        type: { type: String, default: "" },
        price: { type: String, default: "" },
        desc: { type: String, default: "" },
      },
    ],
  },

  facilities: {
    parking: [
      {
        text: { type: String, default: "" },
        status: { type: String, default: "" },
      },
    ],
    transport: [
      {
        text: { type: String, default: "" },
        status: { type: String, default: "" },
      },
    ],
    foodBeverage: [
      {
        text: { type: String, default: "" },
        status: { type: String, default: "" },
      },
    ],
    utilities: [
      {
        text: { type: String, default: "" },
        status: { type: String, default: "" },
      },
    ],
    other: [
      {
        text: { type: String, default: "" },
        status: { type: String, default: "" },
      },
    ],
  },
});

// Optimization: Indexes for fast text search and category queries
placeSchema.index({ name: "text", location: "text", category: "text" });
placeSchema.index({ category: 1, district: 1 });

module.exports = mongoose.model("Place", placeSchema);