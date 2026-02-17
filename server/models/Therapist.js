const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  languages: {
    type: [String],
    required: true,
  },
  vibe: {
    type: String,
    required: true,
    enum: ['Gentle', 'Direct', 'Empathetic', 'Calm', 'Practical'],
  },
  // --- NEW FIELD FOR MATCHING ---
  supportStyle: {
    type: String,
    required: true,
    // These values MUST match the 'id' values in Match.jsx
    enum: ['gentle', 'practical', 'clinical'], 
    default: 'gentle' 
  },
  // ------------------------------
  image: {
    type: String,
    required: true,
  },
  isOnline: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model('Therapist', therapistSchema);