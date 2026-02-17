import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Typewriter = ({ 
  text, 
  speed = 0.05,    // Speed in seconds per character
  delay = 0,       // Initial delay before typing starts
  className = "",
  cursor = true 
}) => {
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const letters = Array.from(text);

  useEffect(() => {
    // Calculate total animation duration in milliseconds
    // Formula: (Start Delay + (Number of letters * Speed per letter)) * 1000
    const animationDuration = (delay + letters.length * speed) * 1000;
    
    // Add a small buffer (e.g., 900ms) so it blinks 1-2 times after finishing, then disappears
    const hideCursorTimeout = setTimeout(() => {
      setIsTypingComplete(true);
    }, animationDuration + 900);

    return () => clearTimeout(hideCursorTimeout);
  }, [delay, letters.length, speed]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed,
        delayChildren: delay,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, display: "none" },
    visible: { opacity: 1, display: "inline" },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {letters.map((char, index) => (
        <motion.span key={index} variants={letterVariants}>
          {char}
        </motion.span>
      ))}
      
      {/* Render cursor only if requested AND typing is NOT complete */}
      {cursor && !isTypingComplete && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block ml-1 w-[2px] h-[1em] bg-emerald-500 align-middle"
        />
      )}
    </motion.span>
  );
};

export default Typewriter;