const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  type: { type: String, enum: ['info', 'warn', 'error'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);
