const mongoose = require("mongoose");

// FEEDBACK model
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },

  answerType: {
    type: String,
    // Allowed types for questions (image supported via mediaUrl)
    enum: ["text", "rating", "audio", "video", "image", "radio"],
    required: true,
  },

  options: {
    type: [String], // only for radio
    default: [],
  },

  isActive: { type: Boolean, default: true },
});

const responseSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  answerType: {
    type: String,
    // Must match what the frontend can send
    enum: ["text", "rating", "audio", "video", "image", "radio"],
    required: true,
  },

  // 👇 only ONE of these will be filled depending on answerType
  answerText: String,        // text
  ratingValue: Number,       // rating
  mediaUrl: String,          // audio/video/img
  selectedOption: String,    // radio
  questionText: String,      // snapshot of the question at submission
});

const feedbackResponseSchema = new mongoose.Schema(
  {
    feedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FEEDBACK",
      required: true,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HOSPITAL_DETAILS",
      required: true,
    },

    responses: [responseSchema], // 🔥 ALL ANSWERS HERE

    submittedAt: {
      type: Date,
      default: Date.now,
    },
    accessToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    tokenExpiresAt: {
      type: Date,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);




const FEEDBACK = require("./feedback");
const FEEDBACK_PERSON = require("./ContactPerson");
const { sendMail } = require("../helpers/mailutility");


const { generateFeedbackAccessToken } = require("../helpers/feedbackmailaccesstoken");

feedbackResponseSchema.post("save", async function (doc) {
  console.log("SENDING MAIL...........!");

  try {
    const feedback = await FEEDBACK.findById(doc.feedbackId)
      .populate("assignedTo");

    if (!feedback?.assignedTo?.length) return;

    const emails = feedback.assignedTo
      .map(p => p.email)
      .filter(Boolean);

    if (!emails.length) return;

    // 🔐 Generate secure access token
    // const token = generateFeedbackAccessToken({
    //   feedbackId: feedback._id,
    //   emails,

    // });
    const token = doc.accessToken;

    const link = `${process.env.FRONTEND_URL}/mailPerson/getFeedbackResponsesByToken/${token}`;

    const html = `
      <h2>📩 New Feedback Received</h2>
      <p><b>Department:</b> ${feedback.feedback_name}</p>
      <p><b>Submitted:</b> ${doc.createdAt.toLocaleString()}</p>
      <hr/>
      <a href="${link}" 
         style="padding:10px 16px;background:#1c6e73;color:#fff;
                text-decoration:none;border-radius:6px">
        View Feedback Securely
      </a>
      <p style="margin-top:10px;color:#666">
        This link expires in 48 hours and is accessible only to you.
      </p>
    `;

    await sendMail({
      to: emails,
      subject: "📩 New Patient Feedback Received",
      html,
    });

    console.log("✅ Secure feedback email sent");
  } catch (err) {
    console.error("❌ Email hook error:", err);
  }
});

module.exports =
  mongoose.models.FEEDBACK_RESPONSE ||
  mongoose.model("FEEDBACK_RESPONSE", feedbackResponseSchema);

/* ---- schemas unchanged ---- */
