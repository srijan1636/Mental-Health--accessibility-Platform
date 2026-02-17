import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { SendHorizontal, Bot, User, Sparkles, ArrowLeft } from "lucide-react";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your MindSaathi companion. I'm here to listen and support you. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // 1. Add User Message to UI
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input; // Store for API call
    setInput("");
    setLoading(true);

    try {
      // 2. Call the Real Backend (Ollama)
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: currentInput,
      });

      // 3. Add AI Response to UI
      const aiMsg = { 
        role: "assistant", 
        content: response.data.reply || "I'm listening..." 
      };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (error) {
      console.error("AI Error:", error);
      // Fallback if backend is offline
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "I'm having a little trouble connecting to my thought process right now. Please make sure the server is running." 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-emerald-50/30 flex flex-col font-sans">
      {/* --- Navbar (Inline for simplicity) --- */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6 max-w-4xl mx-auto w-full">
          <Link to="/home" className="text-slate-600 hover:text-emerald-600 flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="font-serif font-bold text-slate-900">MindSaathi AI</span>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </nav>

      {/* --- Chat Messages Area --- */}
      <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 animate-fade-up ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* AI Avatar */}
              {msg.role === "assistant" && (
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-5 h-5 text-emerald-600" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[75%] px-5 py-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-2xl rounded-tr-sm"
                    : "bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* User Avatar */}
              {msg.role === "user" && (
                <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 animate-fade-up">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse-soft" />
              </div>
              <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span className="text-sm text-slate-400 ml-2">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* --- Input Area --- */}
      <div className="p-4 bg-white/50 backdrop-blur-md border-t border-slate-200">
        <form
          onSubmit={sendMessage}
          className="max-w-3xl mx-auto flex gap-3 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what's on your mind..."
            className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-14 h-14 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95"
          >
            <SendHorizontal className="w-6 h-6" />
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-3 max-w-3xl mx-auto">
          This AI is here to support, not replace professional help. If you're
          in crisis, please use the VIT crisis line.
        </p>
      </div>
    </div>
  );
}