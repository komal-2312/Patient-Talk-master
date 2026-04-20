const express = require("express");
const { signup, login, superadminLogin, logout, verify } = require("../controllers/authController");

const router = express.Router();

// Signup (new registration)
router.post("/signup", signup);

// Login using email and password
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify", verify);


//super admin login 
router.post("/superadmin/login",superadminLogin);


module.exports = router;

