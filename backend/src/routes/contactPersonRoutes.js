const express = require("express");
const router = express.Router();
const {
  contactPersonLogin,
  contactPersonLogout,
  getMyComplaints,
  updateMyComplaintStatus,
  changeMyPassword,
} = require("../controllers/contactPersonController");
const contactPersonAuth = require("../middleware/contactPersonAuth");

router.post("/login", contactPersonLogin);
router.post("/logout", contactPersonLogout);
router.get("/myComplaints", contactPersonAuth, getMyComplaints);
router.patch("/complaint/:id/status", contactPersonAuth, updateMyComplaintStatus);
router.patch("/changePassword", contactPersonAuth, changeMyPassword);

module.exports = router;