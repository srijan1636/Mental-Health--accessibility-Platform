import React from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, HeartHandshake, Sparkles } from "lucide-react";
import Particles from "./Particles"; 
import SpotlightCard from "./SpotlightCard"; 

const Login = () => {
  const navigate = useNavigate();
  const [isCounselorLoggingIn, setIsCounselorLoggingIn] = React.useState(false);
  const [counselorCreds, setCounselorCreds] = React.useState({ id: "", code: "" });

  const handleStudentLogin = () => {
    // 1. CLEAR the flag. This ensures the Home animation runs fresh.
    sessionStorage.removeItem("hasSeenIntro");
    
    // 2. Redirect to Home
    navigate("/home");
  };

  const handleCounselorLogin = () => {
    setIsCounselorLoggingIn(true);
  };

  const handleBack = () => {
    setIsCounselorLoggingIn(false);
    setCounselorCreds({ id: "", code: "" });
  };

  const handleCounselorSubmit = (e) => {
    e.preventDefault();
    if (counselorCreds.code === "campus123") {
      // --- SAVE NAME TO LOCAL STORAGE ---
      localStorage.setItem("counselorName", counselorCreds.id);
      // ----------------------------------
      navigate("/counselor/dashboard");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-slate-50 font-sans">
      
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Particles 
          quantity={100}
          staticity={50}
          ease={50}
          color="#10b981"
          className="w-full h-full opacity-40"
        />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
      </div>

      {/* Main Card Content */}
      <div className="relative z-10 w-full max-w-4xl px-6 animate-fade-up">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600 text-sm font-medium">MindSaathi Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">
            {isCounselorLoggingIn ? "Counselor Access" : "Who is visiting today?"}
          </h1>
          <p className="text-slate-500 text-lg">
            {isCounselorLoggingIn 
              ? "Please enter your credentials to access the dashboard."
              : "Select your role to access your personalized dashboard."}
          </p>
        </div>

        {/* Dynamic Content Area */}
        <div className="max-w-2xl mx-auto min-h-[400px]">
          {!isCounselorLoggingIn ? (
            /* Selection Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              
              {/* Option 1: Student */}
              <div onClick={handleStudentLogin} className="cursor-pointer group h-full">
                <SpotlightCard className="p-10 h-full flex flex-col items-center justify-center text-center hover:border-emerald-400 transition-colors shadow-sm hover:shadow-md">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Student</h3>
                  <p className="text-slate-500 text-base leading-relaxed">
                    Access AI chat, find counselors, and explore wellness resources anonymously.
                  </p>
                </SpotlightCard>
              </div>

              {/* Option 2: Counselor */}
              <div onClick={handleCounselorLogin} className="cursor-pointer group h-full">
                <SpotlightCard className="p-10 h-full flex flex-col items-center justify-center text-center hover:border-blue-400 transition-colors shadow-sm hover:shadow-md">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <HeartHandshake className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Counselor</h3>
                  <p className="text-slate-500 text-base leading-relaxed">
                    Manage appointments, view patient metrics, and update your availability.
                  </p>
                </SpotlightCard>
              </div>

            </div>
          ) : (
            /* Counselor Login Form */
            <SpotlightCard className="w-full max-w-md mx-auto p-8 shadow-lg border-blue-100">
              <button 
                onClick={handleBack}
                className="mb-6 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium transition-colors"
              >
                ← Back to Roles
              </button>
              
              <form onSubmit={handleCounselorSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Counselor ID / Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    placeholder="e.g. Dr. Sarah"
                    value={counselorCreds.id}
                    onChange={(e) => setCounselorCreds({...counselorCreds, id: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Access Code</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    placeholder="Enter unique code"
                    value={counselorCreds.code}
                    onChange={(e) => setCounselorCreds({...counselorCreds, code: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all transform active:scale-95 shadow-lg shadow-blue-200"
                >
                  Access Dashboard
                </button>
              </form>
            </SpotlightCard>
          )}
        </div>

        <p className="text-center text-slate-400 text-sm mt-12">
          © 2024 MindSaathi. Secure & Private Connection.
        </p>
      </div>
    </div>
  );
};

export default Login;