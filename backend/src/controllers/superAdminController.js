const fs = require("fs");
const path = require("path");
const HOSPITAL_DETAILS = require("../models/HOSPITAL_DETAILS");
const FEEDBACK = require("../models/feedback");
const FEEDBACK_RESPONSE = require("../models/FeedbackResponses");
const { logError } = require("../helpers/logger");

const logsDir = path.join(__dirname, "..", "..", "logs");

async function parseLogFile(filename) {
  const filePath = path.join(logsDir, filename);
  if (!fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, "utf-8");
  return raw
    .split("\n")
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null; // Ignore malformed lines safely
      }
    })
    .filter(Boolean);
}

exports.getLogs = async (req, res) => {
  try {
    const systemLogs = await parseLogFile("system.log");
    const loginLogs = await parseLogFile("login.log");
    const registrationLogs = await parseLogFile("registration.log");

    const allLogs = [...systemLogs, ...loginLogs, ...registrationLogs]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json({ success: true, data: allLogs });
  } catch (err) {
    logError({ message: err.message, stack: err.stack, context: "getLogs" });
    return res.status(500).json({ success: false, message: "Server error reading logs" });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await HOSPITAL_DETAILS.find().select("-hospital_password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: hospitals });
  } catch (err) {
    logError({ message: err.message, stack: err.stack, context: "getAllHospitals" });
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.toggleHospitalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const hospital = await HOSPITAL_DETAILS.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select("-hospital_password");

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    return res.status(200).json({ success: true, data: hospital, message: `Hospital ${isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    logError({ message: err.message, stack: err.stack, context: "toggleHospitalStatus" });
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getHospitalFeedbacks = async (req, res) => {
  try {
    const { id } = req.params;
    const feedbacks = await FEEDBACK.find({ hospitalId: id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: feedbacks });
  } catch (err) {
    logError({ message: err.message, stack: err.stack, context: "superadmin.getHospitalFeedbacks" });
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getFeedbackResponses = async (req, res) => {
  try {
    const { id } = req.params;
    const responses = await FEEDBACK_RESPONSE.find({ feedbackId: id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: responses });
  } catch (err) {
    logError({ message: err.message, stack: err.stack, context: "superadmin.getFeedbackResponses" });
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getHospitalAllResponses = async (req, res) => {
  try {
    const { id } = req.params;
    const responses = await FEEDBACK_RESPONSE.find({ hospitalId: id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: responses });
  } catch (err) {
    logError({ message: err.message, stack: err.stack, context: "superadmin.getHospitalAllResponses" });
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await FEEDBACK.findById(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }
    return res.status(200).json({ success: true, data: feedback });
  } catch (err) {
    logError({ message: err.message, stack: err.stack, context: "superadmin.getFeedbackById" });
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
