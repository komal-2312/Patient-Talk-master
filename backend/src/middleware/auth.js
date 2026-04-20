const jwt = require("jsonwebtoken");
const HOSPITAL_DETAILS = require("../models/HOSPITAL_DETAILS");
const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(412).json({ message: "Unauthorized" });
    }

    // Extract token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);



    
    if (!decoded.id) {
      return res.status(412).json({ message: "Unauthorized" });
    }

    HOSPITAL_DETAILS.findById(decoded.id).then((hospital) => {
      if (!hospital) {
        return res.status(412).json({ message: "Unauthorized" });
      }
      
    req.hospitalId = decoded.id;
    console.log("Hospital ID set:", req.hospitalId);
    next();
     // 👈 IMPORTANT
    })

  

  } catch (error) {
    return res.status(412).json({
      success: false,
      message: `"Invalid or expired token"${error}`,
    });
  }
};

module.exports = authMiddleware;
