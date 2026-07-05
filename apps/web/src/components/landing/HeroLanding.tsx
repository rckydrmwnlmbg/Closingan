"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Bot, ChevronDown } from "lucide-react";

export function HeroLanding() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const bgScale = 1 + scrollY * 0.0003;
  const bgOpacity = Math.max(0.15, 0.55 - scrollY * 0.0005);
  const textY = scrollY * 0.25;
  const textOpacity = Math.max(0, 1 - scrollY * 0.0015);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#020202]">
      {/* Parallax Background */}
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

      {/* Subtle ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none z-[2]" />
      <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-teal-600/6 rounded-full blur-[100px] pointer-events-none z-[2]" />

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
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400 bg-emerald-500/10 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Untuk Sales Mobil yang Tidak Mau Kehilangan Prospek
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-white leading-[1.12] mb-7"
            >
              Prospek Chat{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Jam 11 Malam.
              </span>
              <br />
              AI Anda yang Jawab.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              className="text-base md:text-lg text-slate-400 font-normal max-w-lg mb-10 leading-relaxed"
            >
              Anda sedang test drive, serah terima unit, atau meeting dengan leasing.
              Sementara itu, 3 prospek baru nanya stok dan harga di WhatsApp.
              Tanpa Closingan, mereka kabur ke dealer sebelah.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:bg-emerald-400 hover:-translate-y-0.5 transition-all duration-300"
              >
                Coba Gratis 14 Hari{" "}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <span className="text-sm text-slate-500 font-medium">
                Tanpa kartu kredit · Setup 2 menit
              </span>
            </motion.div>
          </motion.div>

          {/* Right: WhatsApp Chat Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
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
            <motion.div
              animate={{
                y: [-6, 6, -6],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full max-w-md mx-auto"
            >
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/15 to-teal-500/8 rounded-[2.5rem] blur-2xl pointer-events-none" />

              <div className="relative bg-[#0E0E0E]/90 backdrop-blur-2xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
                {/* Chat header */}
                <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      AI Sales Assistant
                    </h3>
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online · Balas instan
                    </p>
                  </div>
                </div>

                {/* Chat body */}
                <div className="p-4 space-y-4 min-h-[320px]">
                  {/* Incoming */}
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.0, type: "spring", damping: 20 }}
                    className="max-w-[82%]"
                  >
                    <div className="text-[10px] text-slate-500 mb-1 ml-1 font-medium">
                      Pak Hendra · 23:14
                    </div>
                    <div className="bg-[#1A1A1A] border border-white/5 p-3.5 rounded-2xl rounded-tl-sm text-slate-200 text-[13px] leading-relaxed">
                      Malem pak, Brio Satya E CVT ready stok ga? Mau cash, bisa dapat diskon berapa?
                    </div>
                  </motion.div>

                  {/* AI reply */}
                  <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.8, type: "spring", damping: 20 }}
                    className="max-w-[82%] ml-auto"
                  >
                    <div className="text-[10px] text-emerald-400/70 mb-1 mr-1 text-right font-medium">
                      AI · 23:14
                    </div>
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-3.5 rounded-2xl rounded-tr-sm text-[13px] leading-relaxed shadow-sm">
                      Malam Pak Hendra! Brio Satya E CVT ready stok 3 warna: Putih, Silver, Abu-abu. Untuk pembelian cash ada special price pak. Boleh tau domisilinya di mana? Biar saya bantu hitungkan.
                    </div>
                  </motion.div>

                  {/* Incoming 2 */}
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2.8, type: "spring", damping: 20 }}
                    className="max-w-[82%]"
                  >
                    <div className="text-[10px] text-slate-500 mb-1 ml-1 font-medium">
                      Pak Hendra · 23:15
                    </div>
                    <div className="bg-[#1A1A1A] border border-white/5 p-3.5 rounded-2xl rounded-tl-sm text-slate-200 text-[13px] leading-relaxed">
                      Saya di Bekasi. Yang putih kena berapa OTR?
                    </div>
                  </motion.div>

                  {/* AI reply 2 */}
                  <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 3.5, type: "spring", damping: 20 }}
                    className="max-w-[82%] ml-auto"
                  >
                    <div className="text-[10px] text-emerald-400/70 mb-1 mr-1 text-right font-medium">
                      AI · 23:15
                    </div>
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-3.5 rounded-2xl rounded-tr-sm text-[13px] leading-relaxed shadow-sm">
                      Untuk Bekasi, OTR Brio Satya E CVT Putih di kisaran Rp 174jt pak. Bapak mau saya jadwalkan kunjungan ke showroom untuk lihat unitnya langsung?
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
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-slate-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
