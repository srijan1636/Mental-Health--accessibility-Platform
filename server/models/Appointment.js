const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Link to the specific counselor
  counselorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Therapist',
    required: true 
  },
  counselorName: { type: String, required: true }, 
  
  // Student Profile (Anonymous)
  studentNickname: { type: String, required: true }, // <--- CHANGED FROM studentName
  studentEmail: { type: String, required: true },
  studentPhone: { type: String, required: false},
  studentAge: { type: Number, required: true },
  studentGender: { type: String, required: true },

  // Booking Logistics
  date: { type: String, required: true }, 
  timeSlot: { type: String, required: true }, 
  
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending' 
  },
  
  meetingLink: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

appointmentSchema.index({ counselorId: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);