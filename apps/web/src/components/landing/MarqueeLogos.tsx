"use client";

import { motion } from "framer-motion";

const BRANDS = [
  {
    name: "TOYOTA",
    svg: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 fill-current">
        <path d="M50 20 C20 20 10 35 10 50 C10 65 20 80 50 80 C80 80 90 65 90 50 C90 35 80 20 50 20 Z M50 25 C75 25 83 38 83 50 C83 62 75 75 50 75 C25 75 17 62 17 50 C17 38 25 25 50 25 Z" />
        <path d="M50 27 C35 27 25 38 25 50 C25 62 35 73 50 73 C65 73 75 62 75 50 C75 38 65 27 50 27 Z M50 32 C60 32 68 40 68 50 C68 60 60 68 50 68 C40 68 32 60 32 50 C32 40 40 32 50 32 Z" />
        <path d="M45 35 L45 65 L55 65 L55 35 Z" />
      </svg>
    ),
  },
  {
    name: "HONDA",
    svg: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 fill-current">
        <path d="M10 20 L90 20 L80 90 L20 90 Z" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M25 30 L35 30 L35 55 L65 55 L65 30 L75 30 L75 80 L65 80 L65 65 L35 65 L35 80 L25 80 Z" />
      </svg>
    ),
  },
  {
    name: "MITSUBISHI",
    svg: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 fill-current">
        <path d="M50 15 L65 45 L35 45 Z" />
        <path d="M32 48 L47 78 L17 78 Z" />
        <path d="M68 48 L83 78 L53 78 Z" />
      </svg>
    ),
  },
  {
    name: "HYUNDAI",
    svg: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 fill-current">
        <ellipse cx="50" cy="50" rx="45" ry="30" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M30 35 L40 35 L55 55 L50 65 L35 45 L30 65 L20 65 Z" />
        <path d="M70 35 L80 35 L70 65 L60 65 Z" />
        <path d="M35 50 L65 45 L68 55 L38 60 Z" />
      </svg>
    ),
  },
  {
    name: "DAIHATSU",
    svg: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 fill-current">
        <path d="M10 20 L90 20 L90 80 L10 80 Z" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M30 30 L50 30 C70 30 80 40 80 55 C80 70 70 80 50 80 L30 80 Z M40 40 L40 70 L50 70 C60 70 65 65 65 55 C65 45 60 40 50 40 Z" />
      </svg>
    ),
  },
  {
    name: "WULING",
    svg: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 fill-current">
        <path d="M20 50 L35 20 L50 50 L35 80 Z" />
        <path d="M50 50 L65 20 L80 50 L65 80 Z" />
        <path d="M35 50 L50 80 L65 50 L50 20 Z" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    ),
  }
];

export function MarqueeLogos() {
  return (
    <section className="bg-[#050505] border-y border-indigo-500/10 py-24 overflow-hidden relative perspective-[1000px]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#050505] to-[#050505] z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 mb-16 relative z-20">
        <p className="text-center text-xs font-mono font-bold text-indigo-400 uppercase tracking-[0.3em] opacity-80">
          [ TOP_TIER_DEALERS_CONNECTED ]
        </p>
      </div>

      <div 
        className="relative flex overflow-x-hidden group transform-gpu"
        style={{ transform: "rotateX(30deg)" }}
      >
        {/* Left and Right Fade Gradients */}
        <div className="absolute top-0 left-0 w-48 h-full bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 40,
          }}
          className="flex whitespace-nowrap items-center gap-32 px-12 pb-8 border-b border-indigo-500/20 shadow-[0_20px_50px_rgba(79,70,229,0.1)]"
        >
          {/* Repeat array twice for seamless infinite scroll */}
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <div
              key={i}
              className="flex items-center gap-6 text-indigo-950 hover:text-indigo-400 transition-colors duration-500 cursor-default hover:drop-shadow-[0_0_20px_rgba(129,140,248,0.8)]"
            >
              {brand.svg}
              <span className="text-4xl font-black tracking-widest hidden md:block opacity-40">
                {brand.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
