const mongoose = require('mongoose');

const urgentRequestSchema = new mongoose.Schema({
  student: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UrgentRequest', urgentRequestSchema);