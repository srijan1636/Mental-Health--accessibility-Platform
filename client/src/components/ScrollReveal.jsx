import React from "react";
import { motion } from "framer-motion";

const ScrollReveal = ({ children, className = "", delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} // Start lower and invisible
      whileInView={{ opacity: 1, y: 0 }} // Move up and fade in
      viewport={{ once: true, margin: "-100px" }} // Trigger when 100px into view
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;