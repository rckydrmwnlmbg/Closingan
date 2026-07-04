"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function AppleHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Parallax and Scrubbing effects for the background image
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.3, 0.1]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // Scene 1 (Intro): 0.00 to 0.18
  const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.18, 1], [1, 1, 0, 0]);
  const scale1 = useTransform(scrollYProgress, [0, 0.18, 1], [1, 1.1, 1.1]);
  
  // Scene 2 (Pain): 0.20 to 0.38
  const opacity2 = useTransform(scrollYProgress, [0, 0.19, 0.20, 0.25, 0.35, 0.38, 0.39, 1], [0, 0, 0, 1, 1, 0, 0, 0]);
  const y2 = useTransform(scrollYProgress, [0, 0.19, 0.20, 0.25, 0.38, 1], [50, 50, 50, 0, -50, -50]);

  // Scene 3 (Capability): 0.40 to 0.58
  const opacity3 = useTransform(scrollYProgress, [0, 0.39, 0.40, 0.45, 0.55, 0.58, 0.59, 1], [0, 0, 0, 1, 1, 0, 0, 0]);
  const y3 = useTransform(scrollYProgress, [0, 0.39, 0.40, 0.45, 0.58, 1], [50, 50, 50, 0, -50, -50]);

  // Scene 4 (Safety): 0.60 to 0.78
  const opacity4 = useTransform(scrollYProgress, [0, 0.59, 0.60, 0.65, 0.75, 0.78, 0.79, 1], [0, 0, 0, 1, 1, 0, 0, 0]);
  const scale4 = useTransform(scrollYProgress, [0, 0.59, 0.60, 0.65, 0.78, 1], [0.9, 0.9, 0.9, 1, 1.1, 1.1]);

  // Scene 5 (CTA): 0.80 to 1.00
  const opacity5 = useTransform(scrollYProgress, [0, 0.79, 0.80, 0.85, 1], [0, 0, 0, 1, 1]);
  const y5 = useTransform(scrollYProgress, [0, 0.79, 0.80, 0.85, 1], [50, 50, 50, 0, 0]);

  // Prevent pointer events on the overlay text until the CTA scene
  const pointerEvents5 = useTransform(scrollYProgress, (v) => v >= 0.8 ? "auto" : "none");

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-[#020202]">
      
      {/* Sticky Container holds the scrubbable background and the overlay text */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        
        {/* Scrubbing Background Image (High-res Dark Luxury Car) */}
        <motion.div 
          style={{ 
            scale: bgScale, 
            opacity: bgOpacity,
            y: bgY,
            backgroundImage: 'url("/hero-bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          className="absolute inset-0 w-full h-full origin-center z-0"
        />
        
        {/* Dim overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black z-10" />

        {/* --- TEXT LAYERS --- */}
        
        {/* Scene 1: The Intro */}
        <motion.div 
          style={{ opacity: opacity1, scale: scale1 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-20"
        >
          <p className="text-xl md:text-2xl text-emerald-400 font-bold mb-6 uppercase tracking-[0.3em] drop-shadow-lg">
            Perkenalkan
          </p>
          <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter drop-shadow-2xl mb-6">
            Closingan.
          </h2>
          <p className="text-xl md:text-3xl text-slate-300 font-medium max-w-3xl leading-relaxed drop-shadow-md">
            Sistem otomatisasi WhatsApp khusus Sales Mobil. Bekerja 24/7 tanpa henti.
          </p>
        </motion.div>

        {/* Scene 2: The Pain */}
        <motion.div 
          style={{ opacity: opacity2, y: y2 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-20"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-4 max-w-5xl leading-tight drop-shadow-2xl">
            Berapa banyak prospek yang lari ke dealer sebelah saat Anda sedang tidur?
          </h1>
        </motion.div>

        {/* Scene 3: The Capability */}
        <motion.div 
          style={{ opacity: opacity3, y: y3 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-24 pointer-events-none z-20"
        >
          <div className="w-full max-w-5xl text-left">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
              Balas instan 0.1 detik. <br/>
              <span className="text-slate-500">Mengkualifikasi budget otomatis.</span> <br/>
              <span className="text-slate-600">Menjawab komplain tanpa emosi.</span> <br/>
              <span className="text-emerald-400">Di jam 3 pagi sekalipun.</span>
            </h2>
          </div>
        </motion.div>

        {/* Scene 4: The Safety / Trust */}
        <motion.div 
          style={{ opacity: opacity4, scale: scale4 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-20"
        >
          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl inline-block mb-8">
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tight">
              <span className="text-emerald-500">100%</span> Terkendali.
            </h2>
          </div>
          <p className="text-2xl text-slate-400 font-light max-w-3xl leading-relaxed drop-shadow-md">
            Saat prospek siap untuk <strong className="text-white">Test Drive</strong>, AI langsung menyerahkan chat kepada Anda secara presisi.
          </p>
        </motion.div>

        {/* Scene 5: The CTA */}
        <motion.div 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={{ opacity: opacity5, y: y5, pointerEvents: pointerEvents5 as any }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 bg-black/40 backdrop-blur-lg z-30"
        >
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-12 max-w-5xl drop-shadow-2xl">
            Ubah setiap pesan WhatsApp menjadi penjualan.
          </h2>
          <Link 
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-black font-bold text-xl hover:bg-slate-200 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Mulai Dominasi Sekarang <ChevronRight className="w-6 h-6" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
