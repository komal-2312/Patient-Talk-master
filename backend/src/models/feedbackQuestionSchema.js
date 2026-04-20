// const mongoose = require("mongoose");

// const FeedbackQuestionSchema = new mongoose.Schema(
//   {
//     hospitalId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "HOSPITAL_DETAILS",
//       required: true,
//     },
//     feedbackName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     questions: {
//       type: Array,
//       required: true,
//     },
//     concernPersons: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "HOSPITAL_DETAILS",
//       },
//     ],
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true, collection: "FeedbackQuestions" }
// );

// module.exports = mongoose.model("FeedbackQuestion", FeedbackQuestionSchema);


