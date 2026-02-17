import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

const CountUp = ({ 
  to, 
  from = 0, 
  direction = "up", 
  delay = 0, 
  className = "" 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Motion value to track the number
  const motionValue = useMotionValue(from);
  
  // Spring physics for smooth "landing" on the final number
  const springValue = useSpring(motionValue, {
    damping: 25,
    stiffness: 100,
  });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        motionValue.set(direction === "down" ? from : to);
      }, delay * 1000);
    }
  }, [isInView, from, to, direction, delay, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        // Format number to remove decimals during animation
        ref.current.textContent = Intl.NumberFormat("en-US").format(
          Math.floor(latest)
        );
      }
    });
  }, [springValue]);

  return <span className={className} ref={ref} />;
};

export default CountUp;