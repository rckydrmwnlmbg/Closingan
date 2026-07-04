"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Bot, Sparkles, ChevronDown } from "lucide-react";

export function HeroLanding() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parallax values driven by scrollY
  const bgScale = 1 + scrollY * 0.0003;
  const bgOpacity = Math.max(0.15, 0.55 - scrollY * 0.0005);
  const textY = scrollY * 0.25;
  const textOpacity = Math.max(0, 1 - scrollY * 0.0015);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#020202]">
      {/* Parallax Background Image */}
      <div
        className="absolute inset-0 z-0 will-change-transform"
        style={{
          backgroundImage: 'url("/hero-bg.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `scale(${bgScale})`,
          opacity: bgOpacity,
          transition: "opacity 0.1s linear",
        }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-[#050505] z-[1]" />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none z-[2]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-600/8 rounded-full blur-[100px] pointer-events-none z-[2]" />

      {/* Main content */}
      <div
        className="relative z-10 h-full flex items-center"
        style={{
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Typography & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 shadow-sm backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant Khusus Sales Mobil
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-7"
            >
              Balas{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Ribuan Leads
              </span>{" "}
              dalam 2 Detik.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              className="text-lg md:text-xl text-slate-400 font-normal max-w-lg mb-10 leading-relaxed"
            >
              Berhenti kehilangan pelanggan karena Anda sedang sibuk meeting
              atau serah terima unit. Biarkan AI kami yang melakukan edukasi dan
              mengunci minat prospek 24/7.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-white font-semibold text-base shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:bg-emerald-400 hover:-translate-y-0.5 transition-all duration-300"
              >
                Coba Gratis 14 Hari{" "}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <span className="text-sm text-slate-500 font-medium px-4">
                Tanpa Kartu Kredit
              </span>
            </motion.div>
          </motion.div>

          {/* Right: WhatsApp Floating Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.4,
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
            className="relative hidden lg:block"
          >
            {/* Glass card background with float */}
            <motion.div
              animate={{
                y: [-8, 8, -8],
                rotate: [-2, -3, -2],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full max-w-md mx-auto"
            >
              {/* Glow behind the card */}
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-[3rem] blur-2xl pointer-events-none" />

              <div className="relative bg-[#0E0E0E]/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
                {/* Chat header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      Closingan AI
                    </h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active • Replying instantly
                    </p>
                  </div>
                </div>

                {/* Chat body */}
                <div className="p-5 space-y-5 min-h-[350px]">
                  {/* User message 1 */}
                  <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.0, type: "spring", damping: 20 }}
                    className="max-w-[85%]"
                  >
                    <div className="text-[10px] text-slate-500 mb-1 ml-2 font-medium">
                      Prospek (0812...)
                    </div>
                    <div className="bg-[#1A1A1A] border border-white/5 p-4 rounded-2xl rounded-tl-sm text-slate-200 text-sm shadow-lg">
                      Halo pak, promo DP ringan untuk Brio Satya bulan ini
                      berapa ya?
                    </div>
                  </motion.div>

                  {/* AI response 1 */}
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.8, type: "spring", damping: 20 }}
                    className="max-w-[85%] ml-auto"
                  >
                    <div className="text-[10px] text-emerald-400 mb-1 mr-2 text-right font-bold">
                      AI Assistant (0.2s)
                    </div>
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-4 rounded-2xl rounded-tr-sm text-sm shadow-lg shadow-emerald-500/20">
                      Halo! Untuk Brio Satya bulan ini ada promo DP ringan pak.
                      Boleh saya kirimkan e-brosur lengkapnya?
                    </div>
                  </motion.div>

                  {/* User message 2 */}
                  <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2.8, type: "spring", damping: 20 }}
                    className="max-w-[85%]"
                  >
                    <div className="text-[10px] text-slate-500 mb-1 ml-2 font-medium">
                      Prospek (0819...)
                    </div>
                    <div className="bg-[#1A1A1A] border border-white/5 p-4 rounded-2xl rounded-tl-sm text-slate-200 text-sm shadow-lg">
                      Pajero Sport Dakar ready stok warna hitam?
                    </div>
                  </motion.div>

                  {/* AI response 2 */}
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 3.4, type: "spring", damping: 20 }}
                    className="max-w-[85%] ml-auto"
                  >
                    <div className="text-[10px] text-emerald-400 mb-1 mr-2 text-right font-bold">
                      AI Assistant (0.1s)
                    </div>
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-4 rounded-2xl rounded-tr-sm text-sm shadow-lg shadow-emerald-500/20">
                      Pajero Sport Dakar Hitam ready 2 unit pak! Kapan bapak ada
                      waktu untuk Test Drive?
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ opacity: Math.max(0, 1 - scrollY * 0.005) }}
      >
        <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-slate-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
