// helpers/feedbackAccessToken.js
const jwt = require("jsonwebtoken");

function generateFeedbackAccessToken({ feedbackId, emails }) {
  return jwt.sign(
    {
      feedbackId,
      emails,
      type: "FEEDBACK_VIEW",
    },
    process.env.FEEDBACK_ACCESS_SECRET,
    { expiresIn: "48h" } // ⏱️ configurable
  );
}

function verifyFeedbackAccessToken(token) {
  return jwt.verify(token, process.env.FEEDBACK_ACCESS_SECRET);
}

module.exports = {
  generateFeedbackAccessToken,
  verifyFeedbackAccessToken,
};