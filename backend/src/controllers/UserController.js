const FEEDBACK = require("../models/feedback");
const FEEDBACK_RESPONSE = require("../models/FeedbackResponses");
const HOSPITAL_DETAILS = require("../models/HOSPITAL_DETAILS");
const { verifyFeedbackAccessToken } = require("../helpers/feedbackmailaccesstoken");
const { logFeedbackSubmission, logError } = require("../helpers/logger");
const { analyzeComplaint } = require("../helpers/aiComplaintAnalyzer");
const nodemailer = require('nodemailer'); //TEMP
const { log } = require("console");
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
        const complaintText = formattedResponses.map(r => r.answerText).filter(Boolean).join(" ");
        const aiResult = await analyzeComplaint(complaintText);
        console.log("AI Result:", aiResult);
        const crypto = require("crypto");
        const token = crypto.randomBytes(32).toString("hex");
        const complaintId = `CMP-${Date.now()}`;
        const tokenExpiry = new Date();
        tokenExpiry.setDate(tokenExpiry.getDate() + 7); // valid for 7 days
        await FEEDBACK_RESPONSE.create({feedbackId: feedback._id,
    hospitalId: feedback.hospitalId,
    complaintId: complaintId,

    status: "Pending",
    departmentAssigned: feedback.feedback_name,
    priority: "Medium",

    responses: formattedResponses,

    aiPrediction: aiResult.prediction,
    aiConfidence: aiResult.confidence,
    aiReason: aiResult.reason,

    isValidComplaint:
        aiResult.prediction !== "Spam",

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

async function trackComplaint(req, res) {
    try {
        const { complaintId } = req.params;

        const complaint = await FEEDBACK_RESPONSE.findOne({
            complaintId: complaintId,
            isDeleted: false,
        });

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
                priority: complaint.priority,
                departmentAssigned: complaint.departmentAssigned,
                adminRemarks: complaint.adminRemarks,
                submittedAt: complaint.createdAt,
            },
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
}


module.exports = { getFeedbackByIdforUser, submitFeedbackForUser, getHospitalAllFeedbackByIdforUser, getHospitalProfileForUser, getFeedbackResponseByToken, trackComplaintById, trackComplaint };