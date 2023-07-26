const mongoose = require("mongoose");

const recordItemSchema = new mongoose.Schema({
  type: { type: mongoose.Schema.Types.Mixed, required: true },
  // type: { type: Number, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: mongoose.Schema.Types.Mixed, required: true },
  // timestamp: { type: Number, required: true },
});

const RecordItem = mongoose.model("RecordItem", recordItemSchema);

module.exports = RecordItem;
