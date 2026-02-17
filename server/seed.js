const mongoose = require('mongoose');
const Therapist = require('./models/Therapist');

mongoose.connect('mongodb://127.0.0.1:27017/campusminds')
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedTherapists = [
  {
    name: "Dr. Ananya Singh",
    specialty: "Trauma Specialist",
    bio: "Helping students heal from past experiences with a gentle, patient-centered approach. Specialized in PTSD and emotional resilience.",
    languages: ["English", "Hindi"],
    vibe: "Gentle",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop"
  },
  {
    name: "Prof. Rajesh Kumar",
    specialty: "Academic Stress",
    bio: "No-nonsense guidance for high achievers. I help you manage deadlines, exam anxiety, and performance pressure efficiently.",
    languages: ["English", "Hindi", "Tamil"],
    vibe: "Direct",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=2070&auto=format&fit=crop"
  },
  {
    name: "Ms. Sarah Jones",
    specialty: "Social Anxiety",
    bio: "A warm space to navigate friendship, loneliness, and social fears. Let's build your confidence step by step.",
    languages: ["English"],
    vibe: "Empathetic",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
  },
  {
    name: "Dr. Vikas Khanna",
    specialty: "Mood Disorders",
    bio: "Bringing stability and calm to turbulent emotions. Expert in depression and bipolar management strategies.",
    languages: ["English", "Hindi", "Punjabi"],
    vibe: "Calm",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop"
  },
  {
    name: "Ms. Priya Iyer",
    specialty: "General Wellness",
    bio: "Practical tools for everyday balance. Focus on sleep, nutrition, and mindfulness to support your mental health.",
    languages: ["English", "Tamil", "Malayalam"],
    vibe: "Practical",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop"
  }
];

const seedDB = async () => {
  try {
    await Therapist.deleteMany({});
    console.log('Cleared existing therapists');
    
    await Therapist.insertMany(seedTherapists);
    console.log('Seeded 5 mock therapists');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
};

seedDB();
