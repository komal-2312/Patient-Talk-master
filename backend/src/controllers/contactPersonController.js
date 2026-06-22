const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const FEEDBACK_PERSON = require("../models/ContactPerson");
const FEEDBACK_RESPONSE = require("../models/FeedbackResponses");
const FEEDBACK = require("../models/feedback");
const { logError } = require("../helpers/logger");

async function contactPersonLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ success: false, message: "Email and password required" });
    }

    const person = await FEEDBACK_PERSON.findOne({ email }).select("+password");
    if (!person) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!person.password) {
      return res.status(401).json({ success: false, message: "Account not activated. Please contact your hospital admin." });
    }

    const isMatch = await bcrypt.compare(password, person.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: person._id.toString(), type: "CONTACT_PERSON" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("contactToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      data: {
        id: person._id,
        name: person.name,
        email: person.email,
      },
    });
  } catch (err) {
    logError({ message: err.message, stack: err.stack, context: "contactPersonLogin" });
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function contactPersonLogout(req, res) {
  res.clearCookie("contactToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  return res.status(200).json({ success: true, message: "Logged out" });
}

async function getMyComplaints(req, res) {
  try {
    const person = await FEEDBACK_PERSON.findById(req.contactPersonId);
    if (!person) {
      return res.status(404).json({ success: false, message: "Person not found" });
    }

    const feedbackIds = person.assignedFeedbacks.map(f => f.feedbackId);

    if (!feedbackIds.length) {
      return res.status(200).json({ success: true, data: [], person: { name: person.name, email: person.email } });
    }

    const complaints = await FEEDBACK_RESPONSE.find({
      feedbackId: { $in: feedbackIds },
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .select("complaintId status priority departmentAssigned adminRemarks createdAt feedbackId responses");

    return res.status(200).json({
      success: true,
      data: complaints,
      person: { name: person.name, email: person.email },
      assignedFeedbacks: person.assignedFeedbacks,
    });
  } catch (err) {
    logError({ message: err.message, stack: err.stack, context: "getMyComplaints" });
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function updateMyComplaintStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    const ALLOWED_STATUSES = [
      "Pending", "Under Review", "Assigned",
      "In Progress", "Resolved", "Closed", "Rejected",
    ];

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // Verify this complaint belongs to one of their assigned forms
    const person = await FEEDBACK_PERSON.findById(req.contactPersonId);
    const feedbackIds = person.assignedFeedbacks.map(f => f.feedbackId.toString());

    const complaint = await FEEDBACK_RESPONSE.findOne({
      complaintId: id,
      isDeleted: false,
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (!feedbackIds.includes(complaint.feedbackId.toString())) {
      return res.status(403).json({ success: false, message: "Not authorized to update this complaint" });
    }

    complaint.status = status;
    complaint.adminRemarks = adminRemarks || "";
    await complaint.save();

    return res.status(200).json({ success: true, data: complaint });
  } catch (err) {
    logError({ message: err.message, stack: err.stack, context: "updateMyComplaintStatus" });
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function changeMyPassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Current and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "New password must be at least 6 characters" 
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "New password must be different from current password" 
      });
    }

    const person = await FEEDBACK_PERSON.findById(req.contactPersonId)
      .select("+password");
      
    if (!person) {
      return res.status(404).json({ 
        success: false, 
        message: "Person not found" 
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, person.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Current password is incorrect" 
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    person.password = hashed;
    await person.save();

    return res.status(200).json({ 
      success: true, 
      message: "Password changed successfully" 
    });

  } catch (err) {
    logError({ 
      message: err.message, 
      stack: err.stack, 
      context: "changeMyPassword" 
    });
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
}

module.exports = {
  contactPersonLogin,
  contactPersonLogout,
  getMyComplaints,
  updateMyComplaintStatus,
  changeMyPassword
};