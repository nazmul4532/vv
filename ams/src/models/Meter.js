const mongoose = require("mongoose");

const meterSchema = new mongoose.Schema({
  meterNo: { type: Number, required: true, unique: true },
  handler: { type: String, default: "ams" },
});

module.exports = mongoose.model("Meter", meterSchema);
