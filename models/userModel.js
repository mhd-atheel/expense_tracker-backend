const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: { 
      type: String,
      required: true 
    },
    otpExpires: { 
      type: Date, 
      required: true
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

const user = mongoose.model("Users", userSchema);

module.exports = user;
