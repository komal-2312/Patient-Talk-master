const bcrypt = require("bcryptjs");
const HOSPITAL_DETAILS = require("../models/HOSPITAL_DETAILS");
const SUPER_ADMIN = require("../models/SUPER_ADMIN");
const { signToken } = require("../helpers/jwt");
const { logLogin, logRegistration } = require("../helpers/logger");

function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateName(name) {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 120;
}

function validatePhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  // 7–20 digits, can start with +
  return /^\+?\d{7,20}$/.test(trimmed);
}

function validatePassword(password) {
  if (!password || typeof password !== "string") return false;
  // At least 6 chars, can be strengthened later
  return password.length >= 6;
}

async function signup(req, res, next) {
  try {
    const {
      hospital_name,
      hospital_email,
      hospital_phno,
      hospital_password,
      // hospital_logo should be a base64-encoded string
      hospital_logo,
      // optional: image mime type, e.g. "image/png"
      hospital_logo_mime,
      location,
    } = req.body || {};

    if (
      !hospital_name ||
      !hospital_email ||
      !hospital_phno ||
      !hospital_password ||
      !hospital_logo ||
      !location
    ) {
      return res.status(401).json({
        success: false,
        message:
          "All fields are required: hospital_name, hospital_email, hospital_phno, hospital_password, hospital_logo (base64 string)",
      });
    }

    if (!validateName(hospital_name)) {
      return res.status(401).json({
        success: false,
        message: "Invalid hospital_name: must be 2-120 characters",
      });
    }

    if (!validateEmail(hospital_email)) {
      return res.status(401).json({
        success: false,
        message: "Invalid hospital_email format",
      });
    }

    if (!validatePhone(hospital_phno)) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid hospital_phno: must be 7-20 digits, optionally starting with +",
      });
    }

    if (!validatePassword(hospital_password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid hospital_password: must be at least 6 characters",
      });
    }

    const existing = await HOSPITAL_DETAILS.findOne({ hospital_email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Hospital with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(hospital_password, 10);

    let logoBuffer;
    try {
      logoBuffer = Buffer.from(hospital_logo, "base64");
      if (!logoBuffer || !logoBuffer.length) {
        throw new Error("Invalid logo data");
      }
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: "Invalid hospital_logo: must be a base64-encoded image string",
      });
    }

    const contentType = hospital_logo_mime || "image/png";

    const hospital = await HOSPITAL_DETAILS.create({
      hospital_name,
      hospital_email,
      hospital_phno,
      User_role: false,
      hospital_password: hashedPassword,
      hospital_logo: {
        data: logoBuffer,
        contentType,
      },
      location,
    });

    const token = signToken({
      id: hospital._id.toString(),
      email: hospital.hospital_email,
    });

    logRegistration({
      hospitalId: hospital._id.toString(),
      hospital_email: hospital.hospital_email,
      hospital_name: hospital.hospital_name,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });



    return res.status(201).json({
      success: true,
      message: "Hospital registered successfully",
      token,
      data: {
        id: hospital._id,
        hospital_name: hospital.hospital_name,
        hospital_email: hospital.hospital_email,
        hospital_phno: hospital.hospital_phno,
        has_logo: !!hospital.hospital_logo,
      },
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Hospital email must be unique",
      });
    }
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { hospital_email, hospital_password } = req.body || {};

    if (!hospital_email || !hospital_password) {
      return res.status(401).json({
        success: false,
        message: "hospital_email and hospital_password are required",
      });
    }

    if (!validateEmail(hospital_email)) {
      return res.status(401).json({
        success: false,
        message: "Invalid hospital_email format",
      });
    }

    const hospital = await HOSPITAL_DETAILS.findOne({ hospital_email }).select(
      "+hospital_password +User_role +isActive"
    );

    if (!hospital) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (hospital.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your hospital account has been deactivated by the Super Admin. \n Please contact (superadmin@gmail.com)",
      });
    }


    const isMatch = await bcrypt.compare(
      hospital_password,
      hospital.hospital_password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }



    const token = signToken({
      id: hospital._id.toString(),
      email: hospital.hospital_email,
    });

    logLogin({
      hospitalId: hospital._id.toString(),
      hospital_email: hospital.hospital_email,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: hospital._id,
        hospital_name: hospital.hospital_name,
        hospital_email: hospital.hospital_email,
        hospital_phno: hospital.hospital_phno,
        has_logo: !!hospital.hospital_logo,
      },
    });
  } catch (err) {
    return next(err);
  }
}


async function superadminLogin(req, res, next) {
  try {
    const { hospital_email, hospital_password } = req.body || {};

    if (!hospital_email || !hospital_password) {
      return res.status(401).json({
        success: false,
        message: "SUPER ADMIN email and SUPER ADMIN assword are required",
      });
    }

    if (!validateEmail(hospital_email)) {
      return res.status(401).json({
        success: false,
        message: "Invalid SUPER ADMIN email ",
      });

    }
    //FINDING SUPER ADMIN IN DB
    const ADMIN = await SUPER_ADMIN.findOne({
      email: hospital_email,
    });






    //if nom user is present
    if (!ADMIN) {
      return res.status(401).json({
        success: false,
        message: `Invalid email or password`,

        //CODE IS RETUNING INI THIS IF
      });
    }

    if (ADMIN.pass != hospital_password) {
      return res.status(401).json({
        success: false,
        message: `Invalid email or password`,
      });
    }
    if (ADMIN.pass === hospital_password) {
      const token = signToken({
        id: ADMIN._id.toString(),
        email: ADMIN.hospital_email,
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      return res.status(200).json({
        success: true,
        message: "Super Admin login successful",
        token,
      });
    }
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  // Clear cookie with matching options (path is critical for cross-origin)
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  // Also clear any old cookies that may have been set with different options
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

async function verify(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found",
      });
    }

    const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);

    // Check if it's a super admin
    const superAdmin = await SUPER_ADMIN.findById(decoded.id);
    if (superAdmin) {
      return res.status(200).json({
        success: true,
        isSuperAdmin: true,
        id: decoded.id,
        email: decoded.email,
      });
    }

    // Check if it's a regular hospital
    const hospital = await HOSPITAL_DETAILS.findById(decoded.id);
    if (hospital) {
      return res.status(200).json({
        success: true,
        isSuperAdmin: false,
        id: decoded.id,
        email: decoded.email,
      });
    }

    return res.status(401).json({
      success: false,
      message: "User not found.",
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}



module.exports = {
  signup,
  login,
  superadminLogin,
  logout,
  verify
};

