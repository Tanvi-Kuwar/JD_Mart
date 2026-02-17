const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  business: {
    type: String,
    required: true
  },

  businessType: {
    type: String,
    enum: ["Farmer", "Trader", "Wholesaler", "Retailer", "Exporter"],
    required: true
  },

  password: {
    type: String,
    required: true
  },

  // OTP login support
  otp: String,
  otpExpiry: Date,

  // Forgot password support
  resetToken: String,
  resetTokenExpiry: Date,

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  defaultAddress: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
