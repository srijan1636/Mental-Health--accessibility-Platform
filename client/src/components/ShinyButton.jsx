import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ShinyButton = ({ to, children, className = "" }) => {
  return (
    <Link
      to={to}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-emerald-600 px-8 py-4 font-medium text-white shadow-lg shadow-emerald-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-300 ${className}`}
    >
      {/* The Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-10" />
      
      {/* Button Content */}
      <span className="relative z-20 flex items-center gap-2">
        {children}
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
};

export default ShinyButton;