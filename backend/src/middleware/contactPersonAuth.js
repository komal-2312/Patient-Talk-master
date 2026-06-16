const jwt = require("jsonwebtoken");
const FEEDBACK_PERSON = require("../models/ContactPerson");

const contactPersonAuth = async (req, res, next) => {
  try {
    const token = req.cookies.contactToken;
    if (!token) {
      return res.status(412).json({ message: "Unauthorized: No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id || decoded.type !== "CONTACT_PERSON") {
      return res.status(412).json({ message: "Unauthorized: Invalid token" });
    }

    const person = await FEEDBACK_PERSON.findById(decoded.id);
    if (!person) {
      return res.status(412).json({ message: "Unauthorized: Person not found" });
    }

    req.contactPersonId = decoded.id;
    req.contactPersonHospitalId = person.hospitalId;
    next();
  } catch (err) {
    return res.status(412).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = contactPersonAuth;