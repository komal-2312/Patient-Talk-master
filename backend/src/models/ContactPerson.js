// models/FEEDBACK_PERSON.js
const mongoose = require("mongoose");

const feedbackPersonSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HOSPITAL_DETAILS",
      required: true,
    },

    name: { type: String, required: true },
    mobile: { type: String },
    email: { type: String },

    // Assigned feedback forms / departments
    assignedFeedbacks: [
      {
        feedbackId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FEEDBACK",
        },
        departmentName: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.FEEDBACK_PERSON ||
  mongoose.model("FEEDBACK_PERSON", feedbackPersonSchema);
