const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      process.env.MONGO_URI,
      {
        dbName: process.env.DB_NAME || "uva_explorer",
      }
    );

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);

    process.exit(1);
  }
};

module.exports = connectDB;