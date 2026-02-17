import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { 
  MessageSquare, Heart, Shield, Users, Sparkles, Activity, Bot, UserCircle, LogOut,
  Instagram, Twitter, Linkedin, Phone, Mail, Globe, Play 
} from "lucide-react";

import Particles from './Particles';
import DotPattern from './DotPattern'; 
import SpotlightCard from "./SpotlightCard";
import ShinyButton from "./ShinyButton";
import Typewriter from "./Typewriter";
import ScrollReveal from "./ScrollReveal"; 
import CountUp from "./CountUp";
import ProfileModal from "./ProfileModal"; 

// ... IntroScreen & FeatureCard ...
const IntroScreen = () => (
  <div className="fixed inset-0 bg-white flex items-center justify-center z-50 animate-fade-out-delayed pointer-events-none">
    <div className="text-center px-6 animate-fade-up">
      <p className="text-slate-500 text-sm uppercase tracking-widest mb-6">Welcome to</p>
      <h1 className="text-4xl md:text-6xl text-slate-900 font-serif leading-relaxed">
        Your mental health <br /> <span className="text-emerald-600">is a priority.</span>
      </h1>
    </div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
  <SpotlightCard className="p-6 h-full flex flex-col items-start gap-4">
    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-6 h-6 text-emerald-600" />
    </div>
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  </SpotlightCard>
);

// --- UPDATED FOOTER ---
const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
        
        {/* Brand Column */}
        <div className="md:col-span-4 space-y-4">
          <Link to="/" className="text-2xl font-serif font-bold text-white flex items-center gap-3">
             <img src="/Logo.png" alt="MindSaathi" className="w-8 h-8 rounded-full object-cover border-2 border-slate-700" />
             MindSaathi
          </Link>
          <p className="text-slate-400 leading-relaxed text-sm">
            A safe, anonymous space tailored for university students. We bridge the gap between academic pressure and mental wellness through AI support and expert counseling.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/home" className="hover:text-emerald-400 transition-colors">Home</Link></li>
            <li><Link to="/match" className="hover:text-emerald-400 transition-colors">Find Counselor</Link></li>
            <li><Link to="/chat" className="hover:text-emerald-400 transition-colors">AI Companion</Link></li>
            <li><Link to="/journal" className="hover:text-emerald-400 transition-colors">Journal</Link></li>
          </ul>
        </div>

        {/* Legal/Resources */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="/guidelines" className="hover:text-emerald-400 transition-colors">Community Guidelines</Link></li>
          </ul>
        </div>

        {/* Crisis Support */}
        <div className="md:col-span-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400" /> Crisis Support
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            If you are in immediate danger or need urgent help, please contact emergency services.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm font-medium text-white">
              <Phone className="w-4 h-4 text-emerald-500" /> 
              <span>Tele-MANAS (24/7): <span className="text-emerald-400">14416</span></span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-white">
              <Globe className="w-4 h-4 text-blue-500" /> 
              <span>Vandrevala Foundation: <span className="text-blue-400">1860-266-2345</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} MindSaathi. Built with heart for students.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in India
        </p>
      </div>
    </div>
  </footer>
);

// --- UPDATED NAVBAR ---
const Navbar = ({ onOpenProfile }) => {
  const [profileName, setProfileName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedNick = localStorage.getItem("studentNickname");
    if (storedNick) setProfileName(storedNick);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("studentNickname");
    localStorage.removeItem("studentProfile");
    setProfileName("");
    window.location.reload(); 
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6 max-w-6xl mx-auto">
        <Link to="/home" className="text-xl font-serif font-bold text-slate-900 flex items-center gap-3">
          <img src="/Logo.png" alt="MindSaathi" className="w-10 h-10 rounded-full object-cover" />
          MindSaathi
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/therapists" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Counselors</Link>
          <Link to="/my-sessions" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">My Sessions</Link>
          <Link to="/match" className="hidden sm:block bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">Find Your Counselor</Link>

          {profileName && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button 
                onClick={onOpenProfile}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50"
                title="View Profile"
              >
                <UserCircle className="w-5 h-5" />
                <span>{profileName}</span>
              </button>
              
              <button 
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- VIDEO COMPONENT (Keep as is) ---
const VideoSection = () => {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsPlaying(true);
          observer.disconnect(); 
        }
      },
      { threshold: 0.5 } 
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-24 px-6 bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-50 to-transparent opacity-10"></div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Play className="w-3 h-3 fill-emerald-400" /> Insight
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-6 leading-tight">
            Nervous about your first session?
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Taking the first step is the hardest. Watch this short guide to know exactly what to expect, so you can walk in with confidence.
          </p>
          <Link to="/match" className="inline-flex items-center text-emerald-400 font-medium hover:text-emerald-300 transition-colors group">
            Find your match now <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        <div ref={containerRef} className="flex-1 w-full max-w-xl">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800 group">
            {isPlaying ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/RiGIvbHpluE?autoplay=1&mute=0&rel=0&showinfo=0&modestbranding=1`}
                title="How to Prepare for Your First Therapy Session"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                 <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/50 group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 ml-1 fill-white" />
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem("hasSeenIntro"));
  const [showProfile, setShowProfile] = useState(false); 

  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem("hasSeenIntro", "true");
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  if (showIntro) return <IntroScreen />;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative">
      <Navbar onOpenProfile={() => setShowProfile(true)} />

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden min-h-[700px] flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="absolute inset-0 z-0">
            <Particles quantity={3000} staticity={40} ease={50} color="#10b981" className="w-full h-full opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto w-full animate-fade-up">
            <p className="text-emerald-600 text-sm font-medium uppercase tracking-widest mb-6 bg-white/80 backdrop-blur-sm border border-emerald-100 px-4 py-1 rounded-full inline-block shadow-sm">
              Mental Wellness Platform
            </p>

            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 mb-6 leading-tight min-h-[160px] md:min-h-[180px]">
              <Typewriter text="Healing isn't linear," speed={0.08} delay={0.2} cursor={false} />
              <br />
              <span className="text-slate-400">
                <Typewriter text="but it is possible." speed={0.08} delay={1.5} cursor={false} className="text-slate-400" />
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              A safe, anonymous space for College students. Connect with our local AI
              or find a counselor who truly understands your journey.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <ShinyButton to="/match">Find a Counselor</ShinyButton>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 px-6 bg-slate-50 overflow-hidden border-t border-slate-100">
          <div className="absolute inset-0 z-0">
            <DotPattern width={32} height={32} cx={2} cy={2} cr={2} className="text-slate-200" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-50 pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4">Support that understands you.</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Everything you need to feel better, right here.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard icon={Sparkles} title="Local AI Companion" description="Instant, privacy-first AI support running locally on your network." />
              <FeatureCard icon={Users} title="Expert Counselors" description="Connect with VIT certified professionals who specialize in student stress." />
              <FeatureCard icon={Shield} title="100% Anonymous" description="Your privacy is sacred. No data leaves your device without permission." />
              <FeatureCard icon={Heart} title="Personalized Care" description="Smart matching based on your unique academic and social needs." />
            </div>
          </div>
        </section>

        {/* --- VIDEO SECTION --- */}
        <VideoSection />

        {/* Stats Section */}
        <section className="relative py-32 px-6 bg-emerald-50 overflow-hidden border-t border-slate-200">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <DotPattern width={32} height={32} cx={2} cy={2} cr={2} className="text-emerald-200" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-100 text-emerald-800 text-sm font-medium mb-8 shadow-sm">
                <Activity className="w-4 h-4 text-emerald-500" /> The Reality in India
              </div>
              <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mb-16">Why we built MindSaathi.</h2>
            </ScrollReveal>

            <div className="space-y-20">
              <div className="flex flex-col items-center">
                <ScrollReveal delay={0.1}>
                  <div className="text-6xl md:text-8xl font-serif text-slate-300 mb-4 flex justify-center items-center gap-4">
                    <span>&lt;</span> <CountUp to={1} className="text-emerald-600 font-bold" />
                  </div>
                  <p className="text-lg md:text-2xl text-slate-700 font-medium max-w-lg mx-auto leading-relaxed">
                    psychiatrist for every <span className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 font-bold">100,000</span> people.
                  </p>
                </ScrollReveal>
              </div>

              <div className="flex flex-col items-center">
                <ScrollReveal delay={0.2}>
                  <div className="text-6xl md:text-8xl font-serif text-slate-300 mb-4 flex justify-center items-center gap-4">
                      <span>1 in</span> <CountUp to={7} className="text-emerald-600 font-bold" />
                  </div>
                  <p className="text-lg md:text-2xl text-slate-700 font-medium max-w-lg mx-auto leading-relaxed">
                    adolescents are currently living with a <span className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 font-bold">mental health</span> concern.
                  </p>
                </ScrollReveal>
              </div>

              <div className="flex flex-col items-center">
                <ScrollReveal delay={0.3}>
                  <div className="text-6xl md:text-8xl font-serif text-slate-300 mb-4 flex justify-center items-center gap-4">
                    <CountUp to={150} className="text-emerald-600 font-bold" /> <span className="text-4xl md:text-6xl">M+</span>
                  </div>
                  <p className="text-lg md:text-2xl text-slate-700 font-medium max-w-lg mx-auto leading-relaxed">
                    people in India require <span className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 font-bold">mental health</span> interventions.
                  </p>
                </ScrollReveal>
              </div>

              <div className="flex flex-col items-center">
                <ScrollReveal delay={0.4}>
                  <div className="text-6xl md:text-8xl font-serif text-slate-300 mb-4 flex justify-center items-center gap-4">
                    <span className="text-4xl md:text-6xl">Only</span> <CountUp to={10} className="text-emerald-600 font-bold" /> <span className="text-4xl md:text-6xl">%</span>
                  </div>
                  <p className="text-lg md:text-2xl text-slate-700 font-medium max-w-lg mx-auto leading-relaxed">
                    of those in need actually <span className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 font-bold">approach a professional</span>.
                  </p>
                </ScrollReveal>
              </div>
            </div>

            <ScrollReveal delay={0.6}>
              <div className="mt-24">
                <p className="text-slate-500 mb-6">Let's change these numbers together.</p>
                <Link to="/match" className="inline-block bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-lg shadow-slate-200">
                  Find Your Counselor &rarr;
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />

      <Link to="/chat" className="fixed bottom-8 right-8 z-50 group" aria-label="Chat with AI">
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-lg">Chat with AI</span>
        <div className="w-16 h-16 bg-slate-900 hover:bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3 relative">
          <Bot className="w-8 h-8" />
          <Sparkles className="w-4 h-4 absolute top-3 right-3 text-emerald-400 group-hover:text-white transition-colors animate-pulse" />
        </div>
      </Link>
    </div>
  );
}