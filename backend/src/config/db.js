const mongoose = require("mongoose");

async function connectDB() {
  const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/patienttalkback";

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 15000,
  });
}

module.exports = { connectDB };

