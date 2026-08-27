const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    targetUrl: {
      type: String,
      default: "",
    },
    posterImage: {
      type: String,
      default: "",
    },
    posterType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    posterVideo: {
      type: String,
      default: "",
    },
    receiptImage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "published", "paused", "rejected"],
      default: "pending",
    },
    durationDays: {
      type: Number,
      default: 7,
    },
    publishedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

adSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model("Ad", adSchema);
