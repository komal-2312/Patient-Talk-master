const QRCode = require("qrcode");

async function generateFeedbackQR(feedbackId) {
  const baseUrl = process.env.FRONTEND_URL; // 👈 important

  const url = `${baseUrl}/feedback/${feedbackId}`;

  const qrBase64 = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
  });

  return {
    url,
    qrBase64,
  };
}

module.exports = { generateFeedbackQR };
