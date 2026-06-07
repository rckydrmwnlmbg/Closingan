"use client";

import { motion } from "framer-motion";

export const FloatingBubbles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] mix-blend-screen" />

      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-24 h-12 rounded-full border border-emerald-500/20 bg-black/50 backdrop-blur-md flex items-center px-4"
          initial={{
            opacity: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -100],
            x: (Math.random() - 0.5) * 100,
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        >
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-75" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-150" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
