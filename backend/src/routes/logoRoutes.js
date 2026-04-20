const express = require("express");
const { getHospitalLogo } = require("../controllers/logoController");

const router = express.Router();

// GET /api/logo/:hospitalId - returns binary image for hospital logo
router.get("/:hospitalId", getHospitalLogo);

module.exports = router;

