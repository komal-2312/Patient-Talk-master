const jwt = require("jsonwebtoken");
const SUPER_ADMIN = require("../models/SUPER_ADMIN");

const superAdminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(412).json({ message: "Unauthorized: No token provided" });
    }

    // Extract token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(412).json({ message: "Unauthorized: Invalid token payload" });
    }

    const admin = await SUPER_ADMIN.findById(decoded.id);
    if (!admin) {
      return res.status(412).json({ message: "Unauthorized: Admin access required" });
    }

    req.superAdminId = decoded.id;
    next();
  } catch (error) {
    return res.status(412).json({
      success: false,
      message: `Invalid or expired token`,
    });
  }
};

module.exports = superAdminAuth;
