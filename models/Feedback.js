// FEEDBACK MODEL REQUIRES
const { Schema, model } = require("mongoose");

// FEEDBACK SCHEMA
const feedbackSchema = new Schema(
  {
    feedback: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "feedbacks",
  }
);

// FEEDBACK MODEL
const Feedback = model("Feedback", feedbackSchema);

// EXPORTS
module.exports = Feedback;
