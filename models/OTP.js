// OTP MODEL REQUIRES
const { Schema, model } = require("mongoose");

// OTP SCHEMA
const otpSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    collection: "otp",
  }
);

// OTP MODEL
const OTP = model("OTP", otpSchema);

// EXPORTS
module.exports = OTP;
