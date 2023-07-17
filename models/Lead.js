// Lead MODEL REQUIRES
const { Schema, model } = require("mongoose");

// Lead SCHEMA
const leadSchema = new Schema(
  {
    FIRSTNAME: {
      type: String,
      required: true,
    },
    LASTNAME: {
      type: String,
      required: true,
    },
    COMPANYNAME: {
      type: String,
      required: true,
    },
    EMAIL: {
      type: String,
      required: true,
    },
    URL: {
      type: String,
      required: true,
    },
    OUTPUT: {
      type: String,
      default: "",
    },
    PAGE: {
      type: String,
      default: "",
    },
    STATUS: {
      type: String,
      required: true,
      default: "todo",
    },
    CAMPAIGN_ID: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "leads",
  }
);

// Lead MODEL
const Lead = model("Lead", leadSchema);

// EXPORTS
module.exports = Lead;
