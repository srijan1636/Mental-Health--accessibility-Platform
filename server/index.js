const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Ollama } = require('ollama'); 

// --- IMPORTS ---
const Therapist = require('./models/Therapist');
const Appointment = require('./models/Appointment');
const UrgentRequest = require('./models/UrgentRequest');
const User = require('./models/User'); 

const app = express();
const PORT = 5000;

// --- MIDDLEWARE ---
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect('mongodb://127.0.0.1:27017/campusminds')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- OLLAMA SETUP ---
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

// Emergency Helper
const isEmergency = (text) => {
  const keywords = ['harm', 'suicide', 'die', 'kill myself', 'end it all', 'help', 'emergency'];
  return keywords.some(keyword => text.toLowerCase().includes(keyword));
};

const EMERGENCY_MSG = "I am concerned about your safety. Please reach out to the VIT Bhopal Crisis Line immediately at +91-XXXXXXXXXX. You are not alone.";

// ==========================================
//              ROUTES
// ==========================================

// --- 0. USER & AUTH ROUTES ---

// GET: Fetch User Profile by Nickname
app.get('/api/users/:nickname', async (req, res) => {
  try {
    const user = await User.findOne({ nickname: req.params.nickname });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// POST: Create or Update User Profile
app.post('/api/users', async (req, res) => {
  const { nickname, email, phone, age, gender } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { nickname }, 
      { email, phone, age, gender },
      { new: true, upsert: true } 
    );
    res.json({ success: true, user });
  } catch (error) {
    console.error("User Save Error:", error);
    res.status(500).json({ message: "Error saving profile" });
  }
});

// POST: Verify Student Login
app.post('/api/student/login', async (req, res) => {
  const { nickname, email } = req.body;
  try {
    const user = await User.findOne({ 
      nickname: { $regex: new RegExp(`^${nickname}$`, "i") },
      email: { $regex: new RegExp(`^${email}$`, "i") }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials. Please check your nickname and email." 
      });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Student Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// --- 1. COUNSELOR AUTH & DASHBOARD ---

// POST: Counselor Login Verification
app.post('/api/counselor/login', async (req, res) => {
  const { id: enteredName, code } = req.body;
  try {
    if (code !== "campus123") {
      return res.status(401).json({ success: false, message: "Invalid access code." });
    }
    const counselor = await Therapist.findOne({ 
      name: { $regex: new RegExp(`^${enteredName}$`, "i") } 
    });

    if (!counselor) {
      return res.status(404).json({ 
        success: false, 
        message: "Access Denied: Counselor name not recognized in our database." 
      });
    }

    res.json({ 
      success: true, 
      counselorName: counselor.name, 
      counselorId: counselor._id 
    });
  } catch (error) {
    console.error("Login route error:", error);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// GET: Fetch Data for Dashboard (UPDATED)
app.get('/api/dashboard/data', async (req, res) => {
  try {
    const { counselorId, counselorName } = req.query;

    let filter = {};
    if (counselorId && counselorId !== 'undefined' && counselorId !== 'null') {
       filter = { counselorId: counselorId };
    } else if (counselorName) {
       filter = { counselorName: counselorName };
    } else {
       return res.json({ appointments: [], history: [], pendingRequests: [], urgentRequests: [], stats: [] });
    }

    // Active & Pending
    const pendingRequests = await Appointment.find({ ...filter, status: 'Pending' }).sort({ date: 1 });
    const confirmedSessions = await Appointment.find({ ...filter, status: 'Confirmed' }).sort({ date: 1 });
    
    // --- ADDED: Completed Sessions (History) ---
    const completedSessions = await Appointment.find({ ...filter, status: 'Completed' }).sort({ date: -1 });
    
    const urgentRequests = await UrgentRequest.find({}).sort({ createdAt: -1 });

    const stats = [
      { 
        title: "Students Helped", 
        // Count confirmed AND completed sessions
        value: confirmedSessions.length + completedSessions.length, 
        icon: "Users", color: "text-blue-600", bg: "bg-blue-50" 
      },
      { 
        title: "Hours Dedicated", 
        value: completedSessions.length, 
        icon: "Clock", color: "text-emerald-600", bg: "bg-emerald-50" 
      },
    ];

    res.json({ 
      appointments: confirmedSessions, 
      history: completedSessions, // Send to frontend
      pendingRequests,                
      urgentRequests, 
      stats 
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Error fetching data" });
  }
});

// GET: Get Specific Counselor Status
app.get('/api/counselor/me', async (req, res) => {
  const { name } = req.query;
  try {
    const therapist = await Therapist.findOne({ name: name });
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });
    res.json(therapist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching counselor details" });
  }
});

// PUT: Update Counselor Online Status
app.put('/api/counselor/status', async (req, res) => {
  const { name, isOnline } = req.body;
  try {
    const therapist = await Therapist.findOneAndUpdate(
      { name: name },
      { isOnline: isOnline },
      { new: true } 
    );
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });
    res.json({ success: true, isOnline: therapist.isOnline });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
});

// --- 2. BOOKING & SCHEDULE ROUTES ---

// GET: Check Available Slots
app.get('/api/slots', async (req, res) => {
  const { counselorId, date } = req.query;
  const allSlots = [
    "10:00 AM", "11:00 AM", "12:00 PM", 
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  try {
    const bookings = await Appointment.find({ 
      counselorId, 
      date,
      status: { $in: ['Pending', 'Confirmed'] } 
    });

    const bookedTimes = bookings.map(b => b.timeSlot);

    const slotStatus = allSlots.map(slot => ({
      time: slot,
      isBooked: bookedTimes.includes(slot)
    }));

    res.json(slotStatus);
  } catch (error) {
    console.error("Slot Error:", error);
    res.status(500).json({ message: "Error fetching slots" });
  }
});

// POST: Create New Booking Request
app.post('/api/book', async (req, res) => {
  try {
    const { 
      counselorId, counselorName, 
      studentNickname, 
      studentEmail, studentPhone, studentAge, studentGender,
      date, timeSlot 
    } = req.body;

    const existing = await Appointment.findOne({ 
      counselorId, date, timeSlot, 
      status: { $in: ['Pending', 'Confirmed'] } 
    });

    if (existing) {
      return res.status(400).json({ message: "Slot just got booked! Please refresh." });
    }

    const newAppointment = new Appointment({
      counselorId, counselorName,
      studentNickname,
      studentEmail, studentPhone, studentAge, studentGender,
      date, timeSlot,
      status: 'Pending'
    });

    await newAppointment.save();
    res.json({ success: true, message: "Request sent to counselor!" });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Error booking session" });
  }
});

// PUT: Approve a Session Request
app.put('/api/counselor/approve/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = 'Confirmed';
    appointment.meetingLink = `https://meet.jit.si/campus-minds-${appointment._id}`;
    
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: "Error approving session" });
  }
});

// PUT: Mark Session as Completed
app.put('/api/counselor/complete/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = 'Completed'; 
    await appointment.save();
    
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: "Error completing session" });
  }
});

// --- 3. GENERAL & URGENT ROUTES ---

// POST: Accept Urgent Request
app.post('/api/request/accept', async (req, res) => {
  const { id, student, message } = req.body;
  try {
    const newAppointment = new Appointment({
      counselorId: new mongoose.Types.ObjectId(), 
      counselorName: "Dr. Sarah", 
      studentNickname: student,   
      studentEmail: "urgent@campus.edu",
      studentPhone: "N/A",
      studentAge: 20,
      studentGender: "N/A",
      topic: "Urgent: " + message.substring(0, 30),
      date: new Date().toISOString().split('T')[0],
      timeSlot: "NOW",
      status: "Confirmed",
      meetingLink: `https://meet.jit.si/campus-urgent-${id}`
    });
    await newAppointment.save();
    await UrgentRequest.findByIdAndDelete(id);

    res.json({ success: true, newAppointment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error accepting request" });
  }
});

// DELETE: Decline Urgent Request
app.delete('/api/request/decline/:id', async (req, res) => {
  try {
    await UrgentRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error declining request" });
  }
});

app.get('/api/student/appointments', async (req, res) => {
  const { nickname } = req.query;
  try {
    const appointments = await Appointment.find({ studentNickname: nickname }).sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    console.error("Student Appt Error:", error);
    res.status(500).json({ message: "Error fetching user appointments" });
  }
});

app.get('/api/therapists', async (req, res) => {
  try {
    const therapists = await Therapist.find({});
    res.json(therapists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching therapists' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (isEmergency(message)) return res.json({ reply: EMERGENCY_MSG });
  try {
    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [{ role: 'user', content: message }],
    });
    res.json({ reply: response.message.content });
  } catch (error) {
    res.status(500).json({ reply: "Connection error with AI." });
  }
});

// GET: Seed Data 
app.get('/api/seed', async (req, res) => {
  try {
    // 1. CLEAR EXISTING DATA
    await Appointment.deleteMany({});
    await UrgentRequest.deleteMany({});
    await Therapist.deleteMany({}); 
    
    // 2. CREATE NEW DATA (Using Real Human Stock Photos)
    const therapists = await Therapist.create([
      {
        name: "Dr. Sarah",
        specialty: "Anxiety & Stress",
        vibe: "Gentle",
        bio: "Specializes in CBT and mindfulness for exam anxiety.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
        languages: ["English"],
        isOnline: false,
        supportStyle: "gentle"
      },
      {
        name: "Ms. Sarah Jones",
        specialty: "Social Anxiety",
        vibe: "Empathetic",
        bio: "A warm space to navigate friendship, loneliness, and social fears.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
        languages: ["English"],
        isOnline: false,
        supportStyle: "gentle" 
      },
      {
        name: "Dr. Vikas Khanna",
        specialty: "Mood Disorders",
        vibe: "Calm",
        bio: "Expert in depression and bipolar management.",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800",
        languages: ["English", "Hindi", "Punjabi"],
        isOnline: false,
        supportStyle: "clinical"
      },
      {
        name: "Dr. Ananya Singh",
        specialty: "Trauma Specialist",
        vibe: "Gentle",
        bio: "Helping students heal from past experiences with patient-centered care.",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
        languages: ["English", "Hindi"],
        isOnline: false,
        supportStyle: "practical"
      },
      {
        name: "Prof. Rajesh Kumar",
        specialty: "Academic Career",
        vibe: "Practical",
        bio: "Guiding students through career choices and academic pressure.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800",
        languages: ["English", "Hindi"],
        isOnline: false,
        supportStyle: "practical"
      }
    ]);

    // Create a dummy appointment for Dr. Sarah
    const counselorId = therapists[0]._id;

    await Appointment.create([
      { 
        counselorId, counselorName: "Dr. Sarah",
        studentNickname: "BlueSky22",
        studentEmail: "test@vit.edu", studentPhone: "9999999999", studentAge: 21, studentGender: "Male",
        date: new Date().toISOString().split('T')[0], timeSlot: "10:00 AM", status: "Confirmed" 
      }
    ]);

    res.send("✅ Database seeded! Real human images applied.");
  } catch (error) {
    console.error("Seed Error:", error);
    res.status(500).send("Error seeding data: " + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});