import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

// Configuration for the survey options
const concerns = [
  "Stress & Anxiety",
  "Academic Pressure",
  "Loneliness",
  "Relationships",
  "Sleep Issues",
  "Self-esteem",
];

const styles = [
  {
    id: "gentle",
    title: "Gentle Listener",
    description: "Empathetic and nurturing approach with focus on emotional validation",
  },
  {
    id: "practical",
    title: "Direct & Practical",
    description: "Solution-focused guidance with actionable strategies",
  },
  {
    id: "clinical",
    title: "Clinical Expert",
    description: "Evidence-based therapeutic techniques and structured support",
  },
];

export default function Match() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mood: 5,
    concern: "",
    style: "",
  });
  const navigate = useNavigate();

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);
  
  // --- UPDATED SUBMIT FUNCTION ---
  const handleSubmit = () => {
    // Navigate to Therapists page, passing the selected style as a filter
    navigate("/therapists", { 
      state: { 
        filterStyle: formData.style 
      } 
    });
  };
  // -------------------------------

  return (
    <div className="min-h-screen bg-emerald-50/30 flex flex-col font-sans">
      {/* --- Navbar --- */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6 max-w-4xl mx-auto w-full">
          <Link to="/home" className="text-slate-600 hover:text-emerald-600 flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="font-serif font-bold text-slate-900">MindSaathi Match</span>
          </div>
          <div className="w-20"></div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border border-slate-100 p-8 md:p-12 rounded-3xl shadow-xl shadow-emerald-100/50">
          
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
              <span>Step {step} of 3</span>
              <span>{Math.round((step / 3) * 100)}% complete</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* --- Step 1: Mood Slider --- */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-up">
              <div className="text-center md:text-left">
                <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-3">
                  Let's start here
                </p>
                <h2 className="text-3xl md:text-4xl font-serif text-slate-900">
                  How are you feeling today?
                </h2>
              </div>

              <div className="py-8 space-y-6">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.mood}
                  onChange={(e) =>
                    setFormData({ ...formData, mood: Number(e.target.value) })
                  }
                  className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-400 uppercase tracking-wide font-medium">
                  <span>Struggling</span>
                  <span>Neutral</span>
                  <span>Great</span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-emerald-50 border border-emerald-100 shadow-inner">
                  <span className="text-5xl font-serif text-emerald-600">
                    {formData.mood}
                  </span>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-4 rounded-xl text-lg font-medium transition-all flex items-center justify-center shadow-lg shadow-emerald-200"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}

          {/* --- Step 2: Concerns Grid --- */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-3">
                  Understanding you
                </p>
                <h2 className="text-3xl md:text-4xl font-serif text-slate-900">
                  What's on your mind?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {concerns.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setFormData({ ...formData, concern: opt })}
                    className={`p-5 rounded-2xl text-sm font-medium transition-all border text-left ${
                      formData.concern === opt
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md"
                        : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-4 text-base border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.concern}
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 py-4 rounded-xl text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg shadow-emerald-200"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* --- Step 3: Style Selection --- */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-3">
                  Almost there
                </p>
                <h2 className="text-3xl md:text-4xl font-serif text-slate-900">
                  Preferred support style?
                </h2>
              </div>

              <div className="space-y-4">
                {styles.map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, style: opt.id })}
                    className={`w-full p-6 rounded-2xl text-left transition-all border flex items-center justify-between gap-4 ${
                      formData.style === opt.id
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : "border-slate-200 bg-white hover:border-emerald-200"
                    }`}
                  >
                    <div>
                      <h3 className={`font-semibold text-lg mb-1 ${
                        formData.style === opt.id ? "text-emerald-800" : "text-slate-900"
                      }`}>
                        {opt.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {opt.description}
                      </p>
                    </div>
                    {formData.style === opt.id && (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-4 text-base border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.style}
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 py-4 rounded-xl text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg shadow-emerald-200"
                >
                  Find Counselors
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}