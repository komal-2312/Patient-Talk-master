const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or SMTP
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMail({ to, subject, html }) {
  if (!to || to.length === 0) return;

  await transporter.sendMail({
    from: `"PatientTalkBack." <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendMail };