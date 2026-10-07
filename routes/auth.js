const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.get("/login", authController.renderLogin);

router.post("/login", authController.login);

router.get("/register", authController.renderRegister);

router.post("/register", authController.register);

router.get("/otp-login", authController.renderOtpPage);

router.post("/send-otp", authController.sendOtp);

router.post("/verify-otp", authController.verifyOtp);

router.get("/forgot-password", authController.forgotPassword);

router.get("/logout", authController.logout);

module.exports = router;