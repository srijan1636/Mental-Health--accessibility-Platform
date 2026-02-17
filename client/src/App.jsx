import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your components
import Login from './components/Login'; 
import Home from './components/Home';
import Therapists from './components/Therapists';
import CounselorDashboard from './components/CounselorDashboard';
import Match from './components/Match';
import StudentSessions from './components/StudentSessions';
import Chat from './components/Chat'; // <--- ADD THIS IMPORT

function App() {
  return (
    <Router>
      <Routes>
        {/* LANDING / GATEWAY PAGE */}
        <Route path="/" element={<Login />} />
        
        {/* STUDENT ROUTES */}
        <Route path="/home" element={<Home />} />
        <Route path="/therapists" element={<Therapists />} />
        <Route path="/match" element={<Match />} />
        <Route path="/my-sessions" element={<StudentSessions />} />
        <Route path="/chat" element={<Chat />} /> {/* <--- ADD THIS ROUTE */}
        
        {/* COUNSELOR ROUTES */}
        <Route path="/counselor/dashboard" element={<CounselorDashboard />} />
        
      </Routes>
    </Router>
  );
}

export default App;