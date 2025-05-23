const mongoose = require('mongoose');

const meterSchema = new mongoose.Schema({
  meterNo: { type: Number, required: true, unique: true }
});

module.exports = mongoose.model('Meter', meterSchema);
