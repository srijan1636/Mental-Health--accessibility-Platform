import React, { useState, useEffect } from "react";
import { X, User, Mail, Phone, Loader2, Save } from "lucide-react";

const ProfileModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Get nickname from storage immediately
  const nickname = localStorage.getItem("studentNickname");

  const [formData, setFormData] = useState({
    studentNickname: nickname || "",
    studentEmail: "",
    studentPhone: "",
    studentAge: "",
    studentGender: "Prefer not to say"
  });

  // Fetch Data on Mount
  useEffect(() => {
    if (!nickname) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/users/${encodeURIComponent(nickname)}`);
        if (res.ok) {
          const user = await res.json();
          setFormData({
            studentNickname: nickname, // Keep original nickname
            studentEmail: user.email || "",
            studentPhone: user.phone || "",
            studentAge: user.age || "",
            studentGender: user.gender || "Prefer not to say"
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [nickname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
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
      
      // Update local storage profile object to match
      localStorage.setItem("studentProfile", JSON.stringify(formData));
      
      alert("Profile updated successfully!");
      onClose();
    } catch (error) {
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!nickname) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-serif font-bold">My Profile</h2>
            <p className="text-slate-400 text-sm">Manage your credentials</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          {loading ? (
            <div className="py-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" /></div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nickname (Locked)</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    disabled
                    value={formData.studentNickname}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                  <input required type="number" name="studentAge" value={formData.studentAge} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
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
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input required type="email" name="studentEmail" value={formData.studentEmail} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input type="tel" name="studentPhone" value={formData.studentPhone} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-200"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;