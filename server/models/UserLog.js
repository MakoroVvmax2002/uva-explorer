const mongoose = require("mongoose");

const userLogSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "Uva Province, Sri Lanka",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserLog", userLogSchema);
