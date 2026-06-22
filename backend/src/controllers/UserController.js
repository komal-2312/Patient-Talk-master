const FEEDBACK = require("../models/feedback");
const FEEDBACK_RESPONSE = require("../models/FeedbackResponses");
const HOSPITAL_DETAILS = require("../models/HOSPITAL_DETAILS");
const { verifyFeedbackAccessToken } = require("../helpers/feedbackmailaccesstoken");
const { logFeedbackSubmission, logError } = require("../helpers/logger");

const nodemailer = require('nodemailer'); //TEMP
const { log } = require("console");

// ── Lightweight keyword dictionary, fallback before real ML ──
const DEPARTMENT_KEYWORDS = {
  cleanliness: ["dirty", "clean", "smell", "trash", "garbage", "washroom", "toilet", "bathroom", "hygiene", "stink", "mess", "floor", "unclean"],
  "emergency department": ["emergency", "urgent", "accident", "bleeding", "pain", "ambulance", "critical", "er", "casualty"],
  pharmacy: ["medicine", "medication", "pharmacy", "drug", "prescription", "tablet", "pills", "dose"],
  billing: ["bill", "billing", "payment", "charge", "invoice", "refund", "money", "overcharged", "insurance", "cost"],
  "outpatient department": ["opd", "outpatient", "appointment", "consultation", "doctor", "checkup", "waiting"],
  others: [],
};

function extractKeywordsFromQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  const stopWords = new Set(["the", "a", "an", "is", "of", "for", "and", "to", "your", "you", "in", "on", "with", "was", "were", "did", "how"]);
  const words = new Set();
  questions.forEach(q => {
    if (!q.text) return;
    q.text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
      .forEach(w => words.add(w));
  });
  return Array.from(words);
}

function scoreDepartment(complaintText, feedbackName, questions) {
  const text = complaintText.toLowerCase();
  const key = feedbackName.toLowerCase().trim();

  const hardcoded = DEPARTMENT_KEYWORDS[key] || [];
  const derived = extractKeywordsFromQuestions(questions);
  const allKeywords = new Set([...hardcoded, ...derived]);

  let score = 0;
  allKeywords.forEach(kw => {
    if (text.includes(kw)) score += 1;
  });
  return score;
}

async function getFeedbackByIdforUser(req, res) {
    const feedback = await FEEDBACK.findOne({
        _id: req.params.id,
        isDeleted: false,
    }).select("+feedback_name +questions +logo_png +hospitalId +adminColor +userColor +isActive");

    if (!feedback) {
        return res.status(404).json({
            success: false,
            message: "Feedback form not found",
        });
    }

    if (!feedback.isActive) {
        return res.status(404).json({
            success: false,
            message: "Feedback form closed",
            hospitalId: feedback.hospitalId
        });
    }

    res.status(200).json({
        success: true,
        data: feedback,
    });
}

async function submitFeedbackForUser(req, res) {
    try {

        const feedbackId = req.params.id;
        const responses = JSON.parse(req.body.responses); // multipart

        const feedback = await FEEDBACK.findOne({
            _id: feedbackId,
            isActive: true,
            isDeleted: false,
        });

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback closed or not found",
            });
        }

        // Map uploaded files by fieldname
        const fileMap = {};
        (req.files || []).forEach((file) => {
            fileMap[file.fieldname] = `/uploads/${file.destination.split("uploads/")[1]}/${file.filename}`;
        });

        const formattedResponses = responses.map((r) => {
            const qMatch = feedback.questions.find((quest) => String(quest._id) === String(r.questionId));
            return {
                questionId: r.questionId,
                questionText: qMatch ? qMatch.text : "Unknown Question",
                answerType: r.answerType,
                answerText: r.answerText || null,
                ratingValue: r.ratingValue || null,
                mediaUrl: fileMap[r.fileKey] || null,
            };
        });
        const crypto = require("crypto");

        const token = crypto.randomBytes(32).toString("hex");

        const complaintId = `CMP-${Date.now()}`;

        const tokenExpiry = new Date();
        tokenExpiry.setDate(tokenExpiry.getDate() + 7); // valid for 7 days


        await FEEDBACK_RESPONSE.create({
            feedbackId: feedback._id,
            hospitalId: feedback.hospitalId,
            complaintId: complaintId,
            status: "Pending",
            departmentAssigned: feedback.feedback_name,
            priority: "Medium",
            responses: formattedResponses,
            accessToken: token,
            tokenExpiresAt: tokenExpiry,
            
        });

        logFeedbackSubmission({ feedbackId: feedback._id, hospitalId: feedback.hospitalId });

        return res.status(200).json({
            success: true,
            message: "Thank you for your feedback",
            complaintId,
            status: "Pending",
        });
    } catch (err) {
        console.error(err);
        logError({ message: err.message, stack: err.stack, context: "submitFeedbackForUser" });
        return res.status(500).json({ success: false });
    }
}

async function getHospitalAllFeedbackByIdforUser(req, res) {
    try {
        const feedbacks = await FEEDBACK.find({
            hospitalId: req.params.id,
            isActive: true,
            isDeleted: false,
        });

        if (!feedbacks || feedbacks.length === 0) {
            return res.status(415).json({
                success: false,
                message: "No active feedback forms found for this hospital",
            });
        }


        return res.status(200).json({
            success: true,
            data: feedbacks,
        });
    } catch (err) {
        console.error("Error fetching hospital feedbacks:", err);
        logError({ message: err.message, stack: err.stack, context: "getHospitalAllFeedbackByIdforUser" });
        return res.status(500).json({ message: "Server error" });
    }
}

async function suggestDepartmentForUser(req, res) {
    try {
        const { id } = req.params;
        const { text } = req.query;

        if (!text || !text.trim() || text.trim().length < 3) {
            return res.status(200).json({ success: true, data: [] });
        }

        const feedbacks = await FEEDBACK.find({
            hospitalId: id,
            isActive: true,
            isDeleted: false,
        }).select("feedback_name questions logo_png");

        const scored = feedbacks.map(f => ({
            feedbackId: f._id,
            feedback_name: f.feedback_name,
            logo_png: f.logo_png,
            score: scoreDepartment(text, f.feedback_name, f.questions),
        }));

        scored.sort((a, b) => b.score - a.score);

        const matches = scored.filter(s => s.score > 0);

        return res.status(200).json({
            success: true,
            data: matches,
            topMatch: matches.length > 0 ? matches[0].feedbackId : null,
        });
    } catch (err) {
        console.error("Error suggesting department:", err);
        logError({ message: err.message, stack: err.stack, context: "suggestDepartmentForUser" });
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

async function getHospitalProfileForUser(req, res) {
    try {
        const hospitalProfile = await HOSPITAL_DETAILS.findById(req.params.id).select("+hospital_logo +hospital_name +adminColor +userColor");
        if (!hospitalProfile) {
            return res.status(404).json({ success: false, message: "Hospital profile not found" });
        }
        if (!hospitalProfile.hospital_name) {
            hospitalProfile.hospital_name = "Your Hospital Name";
        }
        if (!hospitalProfile.hospital_logo) {
            hospitalProfile.hospital_logo = "https://via.placeholder.com/150?text=Hospital+Logo";
        }
        let logoBase64 = null;

        if (hospitalProfile.hospital_logo?.data) {
            const buffer = hospitalProfile.hospital_logo.data;
            const mime = hospitalProfile.hospital_logo.contentType || "image/png";

            logoBase64 = `data:${mime};base64,${buffer.toString("base64")}`;
        }
        return res.json({
            success: true,
            data: { hospital_name: hospitalProfile.hospital_name, hospital_logo: logoBase64, adminColor: hospitalProfile.adminColor, userColor: hospitalProfile.userColor },
        });
    } catch (err) {
        console.error("Error fetching hospital profile:", err);
        logError({ message: err.message, stack: err.stack, context: "getHospitalProfileForUser" });
        return res.status(500).json({ message: "Server error" });

    }
}

async function getFeedbackResponseByToken(req, res) {
    try {
        const { token } = req.params;

        const response = await FEEDBACK_RESPONSE.findOne({
            accessToken: token,
            isDeleted: false,
            tokenExpiresAt: { $gt: new Date() }, // check token validity
        }).populate("hospitalId", "adminColor userColor hospital_name hospital_logo")
          .populate("feedbackId", "feedback_name questions");

        if (!response) {
            return res.status(410).json({
                success: false,
                message: "Link expired or invalid",
            });
        }

        return res.json({
            success: true,
            data: response,
        });
    } catch (err) {
        console.error(err);
        logError({ message: err.message, stack: err.stack, context: "getFeedbackResponseByToken" });
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

async function trackComplaintById(req, res) {
    try {

        const { complaintId } = req.params;

        const complaint = await FEEDBACK_RESPONSE.findOne({
            complaintId,
            isDeleted: false,
        })
        .populate("feedbackId", "feedback_name")
        .populate("hospitalId", "hospital_name");

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        return res.status(200).json({
            success: true,

            data: {
                complaintId: complaint.complaintId,

                status: complaint.status,

                department: complaint.departmentAssigned,

                adminRemarks: complaint.adminRemarks,

                priority: complaint.priority,

                submittedAt: complaint.createdAt,

                hospitalName: complaint.hospitalId?.hospital_name,

                feedbackForm: complaint.feedbackId?.feedback_name,
            },
        });

    } catch (err) {

        console.error(err);

        logError({
            message: err.message,
            stack: err.stack,
            context: "trackComplaintById",
        });

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

module.exports = { getFeedbackByIdforUser, submitFeedbackForUser, getHospitalAllFeedbackByIdforUser, getHospitalProfileForUser, getFeedbackResponseByToken, trackComplaintById, suggestDepartmentForUser };