const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    pass: {
      type: String,
      required: true,
      select: true,
    },
  },
  { collection: "SUPER_ADMIN", timestamps: true }
);

module.exports = mongoose.model("SUPER_ADMIN", superAdminSchema);
