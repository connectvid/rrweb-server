const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  websiteUrl: { type: String, required: true },
  date: { type: Date, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
});

// Record MODEL
const Record = mongoose.model("Record", recordSchema);

// EXPORTS
module.exports = Record;
