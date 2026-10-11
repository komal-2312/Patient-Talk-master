const express = require("express");
const UserRouter = express.Router();
const { getFeedbackByIdforUser, submitFeedbackForUser, getHospitalProfileForUser, getHospitalAllFeedbackByIdforUser, getFeedbackResponseByToken, trackComplaintById, suggestDepartmentForUser } = require("../controllers/UserController");   
const upload = require("../middleware/upload");

console.log("suggestDepartmentForUser type:", typeof suggestDepartmentForUser);

// ...existing code...
UserRouter.get("/getFeedbackByIdForUser/:id", getFeedbackByIdforUser);
UserRouter.post("/submitFeedbackForUser/:id",upload.any(), submitFeedbackForUser);
UserRouter.get("/getHospitalProfileForUser/:id", getHospitalProfileForUser);
UserRouter.get("/getHospitalFeedbacksFormForUser/:id", getHospitalAllFeedbackByIdforUser);
UserRouter.get("/suggestDepartment/:id", suggestDepartmentForUser);
UserRouter.get("/getFeedbackResponsesByToken/:token", getFeedbackResponseByToken);
UserRouter.get("/trackComplaint/:complaintId", trackComplaintById);


module.exports = UserRouter;
