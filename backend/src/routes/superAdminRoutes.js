const express = require("express");
const { getLogs, getAllHospitals, toggleHospitalStatus, getHospitalFeedbacks, getFeedbackResponses, getHospitalAllResponses, getFeedbackById } = require("../controllers/superAdminController");
const superAdminAuth = require("../middleware/superAdminAuth");

const router = express.Router();

router.use(superAdminAuth); // Apply authentication to all superadmin routes

router.get("/logs", getLogs);
router.get("/hospitals", getAllHospitals);
router.patch("/hospitals/:id/status", toggleHospitalStatus);
router.get("/hospitals/:id/feedbacks", getHospitalFeedbacks);
router.get("/feedbacks/:id", getFeedbackById);
router.get("/feedbacks/:id/responses", getFeedbackResponses);
router.get("/hospitals/:id/all-responses", getHospitalAllResponses);

module.exports = router;
