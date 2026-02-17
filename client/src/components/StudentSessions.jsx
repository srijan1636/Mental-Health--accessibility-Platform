import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, Clock, Video, Loader2, User, RefreshCw, 
  AlertCircle, Lock, Mail, ArrowLeft // Added ArrowLeft
} from "lucide-react";

const StudentSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true); // Initial load state
  
  // Login Form State
  const [loginData, setLoginData] = useState({ nickname: "", email: "" });
  const [loginError, setLoginError] = useState("");

  // Authenticated User State
  const [user, setUser] = useState(null);

  // --- 1. CHECK LOGIN STATUS ON MOUNT ---
  useEffect(() => {
    const checkLogin = async () => {
      const storedNick = localStorage.getItem("studentNickname");
      
      if (storedNick) {
        try {
           // Verify if this user actually exists in DB
           const res = await fetch(`http://localhost:5000/api/users/${encodeURIComponent(storedNick)}`);
           if (res.ok) {
             const userData = await res.json();
             setUser(userData);
             fetchSessions(userData.nickname);
           } else {
             // If nickname in storage is invalid/deleted, clear it
             localStorage.removeItem("studentNickname");
           }
        } catch (error) {
          console.error("Auth check failed:", error);
        }
      }
      setVerifying(false);
    };
    
    checkLogin();
  }, []);

  // --- 2. FETCH SESSIONS ---
  const fetchSessions = async (nickname) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/student/appointments?nickname=${nickname}`);
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. HANDLE LOGIN FORM SUBMIT ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Success: Save to local storage & State
        localStorage.setItem("studentNickname", data.user.nickname);
        localStorage.setItem("studentProfile", JSON.stringify(data.user)); 
        
        setUser(data.user);
        fetchSessions(data.user.nickname);
      } else {
        setLoginError(data.message || "Login failed");
      }
    } catch (error) {
      setLoginError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentNickname");
    localStorage.removeItem("studentProfile");
    setUser(null);
    setSessions([]);
    setLoginData({ nickname: "", email: "" });
  };

  // --- TIME CHECK LOGIC ---
  const isSessionActive = (sessionDate, sessionTime) => {
    const now = new Date();
    const [year, month, day] = sessionDate.split('-').map(Number);
    const [timePart, modifier] = sessionTime.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const sessionStart = new Date(year, month - 1, day, hours, minutes);
    const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000); 

    return now >= sessionStart && now < sessionEnd;
  };

  if (verifying) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12 relative">
      
      {/* --- ADDED BACK BUTTON HERE --- */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          to="/home" 
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-all font-medium bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white shadow-sm border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> 
          <span className="hidden sm:inline">Back to Home</span>
          <span className="inline sm:hidden">Back</span>
        </Link>
      </div>
      {/* ----------------------------- */}

      <div className="max-w-4xl mx-auto mt-12 md:mt-0">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">My Sessions</h1>
            <p className="text-slate-500">Track your appointments and join video calls.</p>
          </div>
          <Link to="/therapists" className="text-sm font-medium text-emerald-600 hover:underline hidden sm:block">
            ← Book New Session
          </Link>
        </header>

        {!user ? (
          // --- VIEW: LOGIN FORM ---
          <div className="max-w-md mx-auto mt-20 animate-fade-up">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Secure Access</h2>
                <p className="text-slate-500 text-sm mt-2">Enter your credentials to view your sessions.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nickname</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={loginData.nickname}
                      onChange={(e) => setLoginData({...loginData, nickname: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="e.g. BlueSky22"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="registered@email.com"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {loginError}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "View My Sessions"}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-400">First time here? <Link to="/therapists" className="text-emerald-600 font-bold hover:underline">Book a session</Link> to create your profile.</p>
              </div>
            </div>
          </div>
        ) : (
          // --- VIEW: SESSIONS LIST ---
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg">
                    {user.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold">{user.nickname}</p>
                    <p className="text-slate-500 text-xs">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => fetchSessions(user.nickname)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Refresh">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                    Sign Out
                  </button>
                </div>
             </div>

             {loading ? (
               <div className="text-center py-12"><Loader2 className="animate-spin w-8 h-8 text-slate-400 mx-auto" /></div>
             ) : sessions.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                 <p className="text-slate-400 mb-6">No sessions found for this profile.</p>
                 <Link to="/therapists" className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                   Book a Session
                 </Link>
               </div>
             ) : (
               sessions.map((session) => {
                 const isConfirmed = session.status === 'Confirmed';
                 const canJoin = isConfirmed && isSessionActive(session.date, session.timeSlot);

                 return (
                   <div key={session._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                     <div className="flex items-center gap-6 w-full md:w-auto">
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 ${isConfirmed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}>
                         {isConfirmed ? <Video className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                       </div>
                       <div>
                         <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-lg font-bold text-slate-900">Session with {session.counselorName}</h3>
                           <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${isConfirmed ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                             {session.status}
                           </span>
                         </div>
                         <div className="flex gap-4 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {session.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {session.timeSlot}</span>
                         </div>
                       </div>
                     </div>

                     <div className="w-full md:w-auto flex flex-col items-end">
                       {session.status === 'Pending' ? (
                         <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 px-6 py-3 rounded-xl text-sm font-bold border border-amber-100 w-full md:w-auto cursor-default">
                           <Loader2 className="w-4 h-4 animate-spin" /> Awaiting Approval
                         </div>
                       ) : isConfirmed ? (
                         <>
                           <button
                             disabled={!canJoin}
                             onClick={() => window.open(session.meetingLink, "_blank")}
                             className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canJoin ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:scale-105 hover:bg-emerald-700 cursor-pointer" : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-70"}`}
                           >
                             <Video className="w-5 h-5" /> {canJoin ? "Join Call" : "Not Started"}
                           </button>
                           {!canJoin && (
                             <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                               <AlertCircle className="w-3 h-3" /> Link activates at scheduled time
                             </div>
                           )}
                         </>
                       ) : (
                         <span className="text-slate-400 font-medium">Cancelled</span>
                       )}
                     </div>
                   </div>
                 );
               })
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSessions;