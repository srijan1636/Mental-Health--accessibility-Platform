import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom"; 
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Calendar,
  Filter,
  X,
  Check
} from "lucide-react";
import SpotlightCard from "./SpotlightCard";
import BookingModal from "./BookingModal";

// Helper to map style IDs to readable labels
const STYLE_LABELS = {
  gentle: "Gentle Listener",
  practical: "Direct & Practical",
  clinical: "Clinical Expert"
};

const Navbar = () => (
  <nav className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
    <div className="flex h-16 items-center justify-between px-6 max-w-6xl mx-auto">
      <Link to="/home" className="text-xl font-serif font-bold text-slate-900 flex items-center gap-3">
        <img src="/Logo.png" alt="MindSaathi" className="w-10 h-10 rounded-full object-cover" />
        MindSaathi
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/home" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
          Home
        </Link>
        <Link to="/my-sessions" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
          My Sessions
        </Link>
        <Link to="/match" className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
          Get Matched
        </Link>
      </div>
    </div>
  </nav>
);

const Therapists = () => {
  const location = useLocation(); 
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // --- FILTER STATE ---
  const [activeFilter, setActiveFilter] = useState(location.state?.filterStyle || "");
  const [showFilterMenu, setShowFilterMenu] = useState(false); 
  const filterMenuRef = useRef(null); 

  // --- MODAL STATE ---
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/therapists')
      .then(res => res.json())
      .then(data => {
        setCounselors(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching therapists:", err));
  }, []);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FILTER LOGIC ---
  const filteredCounselors = counselors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.specialty.toLowerCase().includes(search.toLowerCase());
    
    const matchesStyle = activeFilter ? c.supportStyle === activeFilter : true;

    return matchesSearch && matchesStyle;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {selectedCounselor && (
        <BookingModal 
          counselor={selectedCounselor} 
          onClose={() => setSelectedCounselor(null)} 
        />
      )}

      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-up">
          <p className="text-emerald-600 font-medium uppercase tracking-widest text-sm mb-4">Campus Counselors</p>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">
            Meet your support team.
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Experienced professionals who specialize in supporting students like you.
          </p>
        </div>

        {/* --- ACTIVE FILTER BANNER --- */}
        {activeFilter && (
          <div className="max-w-md mx-auto mb-8 animate-fade-in">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium">
                  Showing matches for: <strong>{STYLE_LABELS[activeFilter] || activeFilter}</strong>
                </span>
              </div>
              <button 
                onClick={() => setActiveFilter("")}
                className="p-1 hover:bg-emerald-100 rounded-full text-emerald-600 transition-colors"
                title="Clear Filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search Bar & Filter */}
        <div className="max-w-md mx-auto mb-12 relative z-30"> 
          <div className="absolute inset-0 bg-emerald-200/50 rounded-full blur-md opacity-50" />
          <div className="relative bg-white rounded-full shadow-sm border border-slate-200 flex items-center p-1 pl-4">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by name or specialty..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 outline-none h-10"
            />
            
            {/* --- FILTER BUTTON & DROPDOWN CONTAINER --- */}
            <div className="relative" ref={filterMenuRef}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`p-2 rounded-full transition-colors mr-1 ${showFilterMenu || activeFilter ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {showFilterMenu && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-down origin-top-right">
                  <div className="p-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Filter by Style</p>
                    
                    {Object.entries(STYLE_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => { setActiveFilter(key); setShowFilterMenu(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-colors ${
                          activeFilter === key 
                            ? "bg-emerald-50 text-emerald-700 font-medium" 
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {label}
                        {activeFilter === key && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                  
                  <div className="bg-slate-50 p-2 border-t border-slate-100">
                    <button 
                      onClick={() => { setActiveFilter(""); setShowFilterMenu(false); }}
                      className="w-full px-3 py-2 text-sm text-center text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Counselors Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading counselors...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCounselors.length > 0 ? (
              filteredCounselors.map((counselor) => (
                <SpotlightCard key={counselor._id} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    
                    {/* Image */}
                    <div className="w-full md:w-48 h-48 md:h-full shrink-0 relative overflow-hidden rounded-2xl bg-slate-100">
                      <img 
                        src={counselor.image} 
                        alt={counselor.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                        <div>
                          {/* Name & Status */}
                          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            {counselor.name}
                            <span 
                              className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                                counselor.isOnline ? "bg-emerald-500" : "bg-slate-300"
                              }`} 
                              title={counselor.isOnline ? "Online" : "Offline"} 
                            />
                          </h3>

                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                              {counselor.specialty}
                            </span>
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                              {counselor.vibe}
                            </span>
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                              {STYLE_LABELS[counselor.supportStyle]}
                            </span>
                          </div>
                        </div>
                        
                        {/* Book Button */}
                        <button 
                          onClick={() => setSelectedCounselor(counselor)}
                          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 hover:shadow-emerald-200 hover:-translate-y-1 flex items-center justify-center gap-2 min-w-[160px]"
                        >
                          <Calendar className="w-4 h-4" /> Book Session
                        </button>
                      </div>

                      <p className="text-slate-600 leading-relaxed mb-6">
                        {counselor.bio}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <span>VIT Bhopal Campus</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <div>
                          Speaks: <span className="text-slate-900 font-medium">{counselor.languages.join(", ")}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </SpotlightCard>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                <p className="text-slate-500 mb-4">No counselors found matching your criteria.</p>
                <button 
                  onClick={() => { setActiveFilter(""); setSearch(""); }}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default Therapists;