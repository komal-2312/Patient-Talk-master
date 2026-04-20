const HOSPITAL_DETAILS = require("../models/HOSPITAL_DETAILS");

async function getHospitalLogo(req, res, next) {
  try {
    const { hospitalId } = req.params;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "hospitalId is required in path",
      });
    }

    const hospital = await HOSPITAL_DETAILS.findById(hospitalId).select(
      "hospital_logo"
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const logo = hospital.hospital_logo;

    if (!logo || !logo.data || !logo.contentType) {
      return res.status(404).json({
        success: false,
        message: "Logo not found for this hospital",
      });
    }

    res.set("Content-Type", logo.contentType);
    return res.send(logo.data);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getHospitalLogo,
};

