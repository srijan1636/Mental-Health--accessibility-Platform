import React, { useState, useEffect } from "react";
import { 
  X, Calendar, Clock, User, Mail, Phone, 
  ChevronRight, ChevronLeft, Loader2, Shield
} from "lucide-react";

const BookingModal = ({ counselor, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  
  // --- 1. INITIALIZE STATE (Clean Slate - No Local Storage) ---
  const [formData, setFormData] = useState({
    studentNickname: "", // Starts empty now
    studentEmail: "",
    studentPhone: "",
    studentAge: "",
    studentGender: "Prefer not to say",
    date: new Date().toISOString().split('T')[0],
    timeSlot: ""
  });

  // --- 2. FETCH REAL USER PROFILE FROM DB ---
  // This triggers ONLY when you type in the nickname field
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Don't fetch if empty
      if (!formData.studentNickname.trim()) return;

      try {
        const res = await fetch(`http://localhost:5000/api/users/${encodeURIComponent(formData.studentNickname)}`);
        if (res.ok) {
          const user = await res.json();
          console.log("User found in DB:", user);
          
          // Auto-fill fields from Backend
          setFormData(prev => ({
            ...prev,
            studentEmail: user.email || "",
            studentPhone: user.phone || "",
            studentAge: user.age || "",
            studentGender: user.gender || "Prefer not to say"
          }));
        }
      } catch (error) {
        // Silent fail: User might be new, that's fine.
        console.log("Fetching user profile...");
      }
    };

    // Debounce: Wait 500ms after user stops typing to fetch
    const timeoutId = setTimeout(() => {
      fetchUserProfile();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.studentNickname]);

  // --- SLOT FETCHING ---
  useEffect(() => {
    if (step === 2 && formData.date) {
      fetchSlots();
    }
  }, [step, formData.date]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        counselorId: counselor._id,
        date: formData.date
      });
      const res = await fetch(`http://localhost:5000/api/slots?${query}`);
      const data = await res.json();
      setSlots(data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- VALIDATION ---
  const handleNextStep = () => {
    if (!formData.studentNickname.trim() || !formData.studentAge || !formData.studentEmail.trim()) {
      alert("Please fill in all required fields (Nickname, Age, and Email) to proceed.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // --- 3. SAVE USER PROFILE TO DB FIRST ---
      // We upsert (update/insert) into the DB so the backend is always current
      await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: formData.studentNickname,
          email: formData.studentEmail,
          phone: formData.studentPhone,
          age: formData.studentAge,
          gender: formData.studentGender
        })
      });

      // --- 4. BOOK APPOINTMENT ---
      const res = await fetch('http://localhost:5000/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counselorId: counselor._id,
          counselorName: counselor.name,
          ...formData
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        // NOTE: We removed localStorage.setItem here.
        alert("Booking Request Sent! The counselor will review it shortly.");
        onClose();
      } else {
        alert(data.message || "Booking failed.");
        fetchSlots();
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-start text-white">
          <div>
            <h2 className="text-xl font-serif font-bold">Book a Session</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Anonymous
              </span>
              <p className="text-slate-400 text-sm">with {counselor.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          <div className="flex gap-2 mb-8">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-100'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-100'}`} />
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* --- STEP 1: USER PROFILE --- */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-up">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                  <h3 className="text-blue-900 font-bold text-sm mb-1">Your Privacy Matters</h3>
                  <p className="text-blue-700 text-xs">
                    Enter your nickname to fetch your details securely from our server.
                  </p>
                </div>
                
                {/* NICKNAME FIELD */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Enter Nickname <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      required 
                      name="studentNickname"
                      value={formData.studentNickname} 
                      onChange={handleChange} 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700" 
                      placeholder="e.g. BlueSky22" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age <span className="text-red-500">*</span></label>
                    <input required type="number" name="studentAge" value={formData.studentAge} onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                    <select name="studentGender" value={formData.studentGender} onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email (Confidential) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input required type="email" name="studentEmail" value={formData.studentEmail} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="student@university.edu" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input type="tel" name="studentPhone" value={formData.studentPhone} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="+91..." />
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 2: DATE & TIME --- */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-up">
                <h3 className="text-lg font-bold text-slate-800">Select a Time Slot</h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input 
                      type="date" 
                      name="date" 
                      min={new Date().toISOString().split('T')[0]} 
                      value={formData.date} 
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Available Slots</label>
                  
                  {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-600 w-8 h-8" /></div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => setFormData({ ...formData, timeSlot: slot.time })}
                          className={`
                            py-3 px-2 rounded-lg text-sm font-medium border transition-all relative
                            ${slot.isBooked 
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60" 
                              : formData.timeSlot === slot.time
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105"
                                : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-600"
                            }
                          `}
                        >
                          {slot.time}
                          {slot.isBooked && (
                            <span className="absolute -top-2 -right-2 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-red-200">
                              BOOKED
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {slots.length === 0 && !loading && (
                    <p className="text-center text-sm text-slate-500 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200 border-dashed">
                      No slots available for this date.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="mt-8 flex gap-3 pt-4 border-t border-slate-100">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              
              <button 
                type={step === 2 ? "submit" : "button"}
                disabled={step === 2 && !formData.timeSlot}
                onClick={() => step === 1 ? handleNextStep() : null}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-emerald-200 
                  ${step === 2 && !formData.timeSlot 
                    ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                    : 'bg-slate-900 hover:bg-emerald-600 hover:shadow-emerald-300'
                  }
                `}
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (step === 1 ? <>Next Step <ChevronRight className="w-4 h-4" /></> : "Confirm Booking")}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;