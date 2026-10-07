const Users = require("../models/user");

// ======================
// Render Login Page
// ======================
module.exports.renderLogin = (req, res) => {
  res.render("login.ejs");
};

// ======================
// Login User
// ======================
module.exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;

    const user = await Users.findOne({
      $or: [{ email: login }, { phone: login }],
    });

    if (!user) {
      console.log("No user found");
      return res.redirect("/login");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log("Wrong password");
      return res.redirect("/login");
    }

    req.session.userId = user._id;

    req.session.save(() => {
      res.redirect("/products");
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.redirect("/login");
  }
};

// ======================
// Render Register Page
// ======================
module.exports.renderRegister = (req, res) => {
  res.render("register.ejs");
};

// ======================
// Register User
// ======================
module.exports.register = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      business,
      businessType,
      password,
      confirm,
      defaultAddress,
    } = req.body;

    if (password !== confirm) {
      return res.redirect("/register");
    }

    const userExists = await Users.findOne({
      $or: [{ email }, { phone }],
    });

    if (userExists) {
      return res.redirect("/register");
    }

    const newUser = new Users({
      fullName,
      phone,
      email,
      business,
      businessType,
      password,
      defaultAddress,
    });

    await newUser.save();

    req.session.userId = newUser._id;

    req.session.save(() => {
      res.redirect("/products");
    });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.redirect("/register");
  }
};

// ======================
// Render OTP Login Page
// ======================
module.exports.renderOtpPage = (req, res) => {
  res.render("otp", {
    step: false,
  });
};

// ======================
// Send OTP
// ======================
module.exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await Users.findOne({ phone });

    if (!user) {
      console.log("User not found for OTP login");
      return res.redirect("/otp-login");
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    req.session.otp = otp;
    req.session.otpPhone = phone;

    console.log("=================================");
    console.log("OTP FOR LOGIN:", otp);
    console.log("=================================");

    res.render("otp", {
      step: true,
      phone,
    });

  } catch (err) {
    console.log("OTP ERROR:", err);
    res.redirect("/otp-login");
  }
};

// ======================
// Verify OTP
// ======================
module.exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (parseInt(otp) !== req.session.otp) {
      console.log("OTP INVALID");
      return res.redirect("/otp-login");
    }

    const user = await Users.findOne({
      phone: req.session.otpPhone,
    });

    if (!user) {
      return res.redirect("/otp-login");
    }

    req.session.userId = user._id;

    req.session.otp = null;
    req.session.otpPhone = null;

    req.session.save(() => {
      res.redirect("/products");
    });

  } catch (err) {
    console.log("VERIFY OTP ERROR:", err);
    res.redirect("/otp-login");
  }
};

// ======================
// Forgot Password Page
// ======================
module.exports.forgotPassword = (req, res) => {
  res.render("forgot-password.ejs");
};

// ======================
// Logout
// ======================
module.exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};