import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Calendar, Users, Settings, LogOut, Bell, 
  Clock, CheckCircle, XCircle, Menu, Video, Inbox, 
  ChevronRight, CalendarCheck, UserCheck, AlertCircle,
  Mail, Phone, Shield, Moon
} from "lucide-react";

// Helper for icons
const iconMap = { Users, Clock };

const NavItem = ({ icon: Icon, label, active = false, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
      active ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-slate-100"
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </div>
    {badge > 0 && (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
        {badge}
      </span>
    )}
  </button>
);

const CounselorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // --- STATUS STATE ---
  const [isOnline, setIsOnline] = useState(false); 
  const [loading, setLoading] = useState(true);

  // --- RETRIEVE COUNSELOR NAME ---
  const [counselorName, setCounselorName] = useState(localStorage.getItem("counselorName") || "Dr. Sarah");

  // Data State
  const [appointments, setAppointments] = useState([]); 
  const [history, setHistory] = useState([]); // <--- STORE COMPLETED SESSIONS HERE
  const [pendingRequests, setPendingRequests] = useState([]); 
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [stats, setStats] = useState([]);

  // --- 1. FETCH INITIAL STATUS FROM DB ---
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/counselor/me?name=${encodeURIComponent(counselorName)}`);
        const data = await res.json();
        if (data && typeof data.isOnline !== 'undefined') {
          setIsOnline(data.isOnline);
        }
      } catch (error) {
        console.error("Error fetching status:", error);
      }
    };
    
    if(counselorName) {
      fetchStatus();
      fetchDashboardData(); 
    }
  }, [counselorName]);

  // --- 2. TOGGLE STATUS (BACKEND INTEGRATION) ---
  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    // Optimistic UI Update
    setIsOnline(newStatus);

    try {
      const res = await fetch('http://localhost:5000/api/counselor/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: counselorName, isOnline: newStatus })
      });
      
      const data = await res.json();

      if (!res.ok) {
        setIsOnline(!newStatus);
        alert(`Failed: ${data.message}`);
      }
    } catch (error) {
      setIsOnline(!newStatus);
      console.error("Error updating status:", error);
    }
  };

  // --- FETCH DASHBOARD DATA ---
  const fetchDashboardData = async () => {
    try {
      const storedId = localStorage.getItem("counselorId");
      let url = `http://localhost:5000/api/dashboard/data?counselorId=${storedId}`;
      
      if (!storedId) {
         url = `http://localhost:5000/api/dashboard/data?counselorName=${encodeURIComponent(counselorName)}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      setAppointments(data.appointments || []);
      setHistory(data.history || []); // <--- SAVE HISTORY TO STATE
      setPendingRequests(data.pendingRequests || []);
      setUrgentRequests(data.urgentRequests || []);
      
      if (data.stats) setStats(data.stats); 
      
      setLoading(false);
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setLoading(false);
    }
  };

  // --- DERIVE PATIENTS FROM ALL INTERACTIONS ---
  // Combine Upcoming (appointments) and Past (history)
  const allInteractions = [...appointments, ...history];

  const uniquePatients = Array.from(new Set(allInteractions.map(a => a.studentNickname)))
    .map(nickname => {
      // We prioritize the 'appointments' (upcoming) entry if it exists, so status shows as Active
      return appointments.find(a => a.studentNickname === nickname) || 
             history.find(a => a.studentNickname === nickname);
    })
    .filter(Boolean); // Safety filter

  // --- HANDLERS ---

  const handleSignOut = async () => {
    try {
      await fetch('http://localhost:5000/api/counselor/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: counselorName, isOnline: false })
      });
    } catch (error) {
      console.error("Error updating status on sign out:", error);
    } 

    localStorage.removeItem("counselorName"); 
    localStorage.removeItem("counselorId"); 
    navigate("/");
  };

  const handleJoinCall = (link) => {
    if (link) window.open(link, "_blank");
  };

  const handleApproveSession = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/counselor/approve/${id}`, { method: 'PUT' });
      if (res.ok) {
        alert("Session Approved! It has been moved to your schedule.");
        fetchDashboardData(); 
      }
    } catch (error) {
      console.error("Approval Error:", error);
    }
  };

  const handleCompleteSession = async (id) => {
    if(!window.confirm("Mark this session as completed?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/counselor/complete/${id}`, { method: 'PUT' });
      if (res.ok) {
        fetchDashboardData(); 
      }
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  const handleAcceptUrgent = async (request) => {
    try {
      const res = await fetch('http://localhost:5000/api/request/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: request._id, student: request.student, message: request.message })
      });
      if (res.ok) {
        fetchDashboardData();
        alert(`Accepted urgent session with ${request.student}`);
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleDeclineRequest = async (id) => {
    if(!window.confirm("Decline this request?")) return;
    try {
      await fetch(`http://localhost:5000/api/request/decline/${id}`, { method: 'DELETE' });
      setUrgentRequests(prev => prev.filter(req => req._id !== id));
    } catch (error) {
      console.error("Error declining:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 z-50 transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 px-2 mb-10">
            <img src="/Logo.png" alt="MindSaathi" className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" />
            <span className="font-serif text-xl font-bold text-slate-800">MindSaathi</span>
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem 
              icon={LayoutDashboard} 
              label="Overview" 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')} 
            />
            <NavItem 
              icon={Calendar} 
              label="Schedule" 
              active={activeTab === 'schedule'} 
              onClick={() => setActiveTab('schedule')} 
              badge={pendingRequests.length}
            />
            <NavItem 
              icon={Users} 
              label="My Patients" 
              active={activeTab === 'patients'} 
              onClick={() => setActiveTab('patients')} 
            />
            <NavItem 
              icon={Settings} 
              label="Settings" 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
            />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Welcome back, {counselorName}</h1>
              <p className="text-sm text-slate-500">{new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            
            {/* --- STATUS TOGGLE --- */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
              <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${isOnline ? "bg-green-500" : "bg-slate-400"}`} />
              <span className="text-sm font-medium text-slate-600 min-w-[3rem]">{isOnline ? "Online" : "Offline"}</span>
              <button 
                onClick={toggleOnlineStatus} 
                className="ml-2 text-xs text-blue-600 hover:underline font-medium"
              >
                Change
              </button>
            </div>
            {/* ------------------- */}

            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              {urgentRequests.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />}
            </button>
            <div className="w-10 h-10 bg-blue-100 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${counselorName}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-8">

          {/* --- VIEW: OVERVIEW --- */}
          {activeTab === 'overview' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className={`p-4 rounded-xl ${stat.bg}`}>
                      {index === 0 ? <Users className={`w-8 h-8 ${stat.color}`} /> : <Clock className={`w-8 h-8 ${stat.color}`} />}
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- NEW SECTION: PENDING APPROVALS ON OVERVIEW --- */}
              {pendingRequests.length > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-rose-600" />
                    <h2 className="text-lg font-bold text-rose-800">Action Required: {pendingRequests.length} Pending Approval(s)</h2>
                  </div>
                  <div className="grid gap-3">
                    {pendingRequests.map(req => (
                      <div key={req._id} className="bg-white p-4 rounded-xl border border-rose-100 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-bold">
                            {(req.studentNickname || "S").charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{req.studentNickname}</p>
                            <p className="text-xs text-slate-500">{req.date} at {req.timeSlot}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleApproveSession(req._id)}
                          className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                        >
                          Approve
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* -------------------------------------------------- */}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Confirmed Sessions */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between w-full">
                    <h2 className="text-lg font-bold text-slate-800">Today's Sessions</h2>
                    <button onClick={() => setActiveTab('schedule')} className="text-blue-600 text-sm font-medium hover:underline">View Full Calendar</button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[200px]">
                    {appointments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                        <Calendar className="w-12 h-12 mb-3 text-slate-300" />
                        <p className="text-sm font-medium">No confirmed sessions for today</p>
                      </div>
                    ) : (
                      appointments.map((apt) => (
                        <div key={apt._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 last:border-0">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                              {(apt.studentName || apt.studentNickname || "A").charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">{apt.studentName || apt.studentNickname}</h4>
                              <p className="text-sm text-slate-500">{apt.topic || "General Session"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 mr-2">{apt.timeSlot}</span>
                            <button onClick={() => handleJoinCall(apt.meetingLink)} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors" title="Join Video Call">
                              <Video className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleCompleteSession(apt._id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200 transition-colors" title="Mark as Completed">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Urgent Requests */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between w-full">
                    <h2 className="text-lg font-bold text-slate-800">Urgent Requests</h2>
                    {urgentRequests.length > 0 && <span className="bg-rose-100 text-rose-600 text-xs px-2 py-1 rounded-full font-bold">{urgentRequests.length} New</span>}
                  </div>
                  <div className="space-y-4">
                    {urgentRequests.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-500">
                        <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">No new urgent requests</p>
                      </div>
                    ) : (
                      urgentRequests.map((req) => (
                        <div key={req._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <h4 className="font-semibold text-slate-800 mb-1">{req.student}</h4>
                          <p className="text-sm text-slate-600 mb-4">{req.message}</p>
                          <div className="flex gap-2">
                            <button onClick={() => handleAcceptUrgent(req)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm">Accept</button>
                            <button onClick={() => handleDeclineRequest(req._id)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-sm">Decline</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* --- VIEW: SCHEDULE (PENDING & CONFIRMED) --- */}
          {activeTab === 'schedule' && (
            <div className="space-y-10 animate-fade-in">
              
              {/* 1. Pending Requests Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Session Requests</h2>
                  {pendingRequests.length > 0 && <span className="px-3 py-1 bg-rose-100 text-rose-600 text-sm font-bold rounded-full">{pendingRequests.length} Pending</span>}
                </div>
                
                {pendingRequests.length === 0 ? (
                  <div className="bg-white p-10 rounded-2xl border border-slate-100 text-center shadow-sm">
                    <CalendarCheck className="w-14 h-14 mx-auto mb-4 text-emerald-200" />
                    <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
                    <p className="text-slate-500 mt-1 text-sm">You have no pending session requests to approve.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pendingRequests.map((req) => (
                      <div key={req._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-rose-500">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                            {(req.studentNickname || "S").charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">{req.studentNickname}</h4>
                            <p className="text-sm text-slate-500">{req.studentAge} yrs • {req.studentGender}</p>
                            <div className="flex gap-4 mt-2 text-sm font-medium text-slate-600">
                              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {req.date}</span>
                              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {req.timeSlot}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 w-full md:w-auto">
                          <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium transition-colors">
                            Decline
                          </button>
                          <button 
                            onClick={() => handleApproveSession(req._id)}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-200 transition-all hover:scale-105"
                          >
                            Approve Session
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 2. Confirmed Schedule Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Upcoming Schedule</h2>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-bold rounded-full">{appointments.length} Confirmed</span>
                </div>

                {appointments.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                      <p className="text-slate-400">No upcoming sessions confirmed yet.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {appointments.map((apt) => (
                      <div key={apt._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                             <UserCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{apt.studentName || apt.studentNickname}</h4>
                            <div className="flex gap-4 text-sm text-slate-500 mt-1">
                               <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {apt.date}</span>
                               <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.timeSlot}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-100">
                             Confirmed
                           </span>
                           <button onClick={() => handleJoinCall(apt.meetingLink)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Join Video Call">
                             <Video className="w-5 h-5" />
                           </button>
                           {/* Complete Button */}
                           <button onClick={() => handleCompleteSession(apt._id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Mark as Completed">
                             <CheckCircle className="w-5 h-5" />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>
          )}

          {/* --- VIEW: MY PATIENTS (NEW) --- */}
          {activeTab === 'patients' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">My Patients</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-full">
                    {uniquePatients.length} Total
                  </span>
                </div>
              </div>

              {uniquePatients.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No patient history found yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uniquePatients.map((patient, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600">
                          {(patient?.studentNickname || "S").charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-800">{patient?.studentNickname || "Unknown"}</h3>
                          <p className="text-xs text-slate-500">Student ID: #ST-{idx + 1024}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-slate-600 mb-4">
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                          <span className="text-slate-400">Gender</span>
                          <span className="font-medium">{patient?.studentGender || "N/A"}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                          <span className="text-slate-400">Age</span>
                          <span className="font-medium">{patient?.studentAge || "N/A"}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-slate-400">Status</span>
                          <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                      </div>

                      <button className="w-full py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                        View History
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- VIEW: SETTINGS (NEW) --- */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Account Settings</h2>

              {/* 1. Profile Section */}
              <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-500" /> Professional Profile
                </h3>
                <div className="flex items-start gap-6">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${counselorName}`} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full border-4 border-blue-50"
                  />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Display Name</label>
                      <input type="text" value={counselorName} disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Role</label>
                      <input type="text" value="Senior Counselor" disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Bio</label>
                      <textarea disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed h-20 resize-none">
                        Certified professional specializing in student mental health and academic stress management.
                      </textarea>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Availability & Notifications */}
              <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-500" /> Preferences
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-700">Online Status</h4>
                      <p className="text-sm text-slate-500">Visible to students for instant booking</p>
                    </div>
                    <button 
                      onClick={toggleOnlineStatus}
                      className={`relative w-14 h-8 rounded-full transition-colors ${isOnline ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                      <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-700">Email Notifications</h4>
                      <p className="text-sm text-slate-500">Receive emails for new session requests</p>
                    </div>
                    <div className="relative w-14 h-8 bg-blue-500 rounded-full cursor-pointer">
                      <span className="absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm translate-x-6" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-700">Do Not Disturb</h4>
                      <p className="text-sm text-slate-500">Pause all incoming requests after 8 PM</p>
                    </div>
                    <div className="relative w-14 h-8 bg-slate-200 rounded-full cursor-pointer">
                      <span className="absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm translate-x-0" />
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-3">
                <button className="px-6 py-2 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-200">Save Changes</button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default CounselorDashboard;