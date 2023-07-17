// USER MODEL REQUIRES
const { Schema, model } = require("mongoose");

// USER SCHEMA
const userSchema = new Schema(
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
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "pending", "inactive"],
      required: true,
    },
    stripeCustomerID: {
      type: String,
      required: true,
      unique: true,
    },
    credit: {
      type: Number,
      default: 0,
      required: true,
    },
    selectedPlan: {
      type: String,
      enum: ["trial", "basic", "standard", "premium", "none"],
      required: true,
      default: "none",
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// USER MODEL
const User = model("User", userSchema);

// EXPORTS
module.exports = User;
