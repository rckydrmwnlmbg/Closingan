"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Lock, CheckCircle2, QrCode } from "lucide-react";

export function SlideCTA() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-12 lg:px-24">
      <div className="w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="relative bg-white/80 dark:bg-[#121212]/80 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[2.5rem] p-8 md:p-16 overflow-hidden shadow-2xl shadow-indigo-500/10"
        >
          {/* Dynamic Animated Background Accents */}
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-200/50 dark:bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 mix-blend-multiply dark:mix-blend-screen" 
          />
          <motion.div 
            animate={{ 
              rotate: -360,
              scale: [1, 1.5, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-emerald-200/50 dark:bg-emerald-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 mix-blend-multiply dark:mix-blend-screen" 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold tracking-wide mb-6 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                <Lock className="w-4 h-4" /> AMAN & TERPERCAYA
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
                Amankan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">Target SPK</span> Anda Bulan Ini.
              </h2>
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-8 leading-relaxed text-base md:text-lg">
                Bergabunglah dengan ratusan Top Sales Otomotif Indonesia yang bisa tidur nyenyak karena tahu AI mengurus prospek mereka 24/7.
              </p>
              <ul className="space-y-4 mb-8">
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-3 text-sm md:text-base text-slate-800 dark:text-slate-200 font-bold"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Cukup scan QR WhatsApp (Hitungan detik)
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-3 text-sm md:text-base text-slate-800 dark:text-slate-200 font-bold"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Nomor Anda tetap milik Anda sepenuhnya
                </motion.li>
              </ul>
            </motion.div>

            {/* Right: Clean Pricing Card with Hover 3D Effect */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
              whileHover={{ scale: 1.02, rotateY: -5 }}
              className="perspective-1000"
            >
              <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] p-8 md:p-10 flex flex-col justify-center relative shadow-2xl shadow-indigo-500/10 transition-transform duration-300 preserve-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent rounded-[2rem]" />
                
                <div className="relative z-10 text-center translate-z-10">
                  <h3 className="text-slate-900 dark:text-white font-extrabold text-xl mb-4 tracking-wide uppercase">Uji Coba Sistem</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-3">
                    <span className="text-xl text-slate-500 font-bold">Rp</span>
                    <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tighter">0</span>
                    <span className="text-base text-slate-500 font-bold">/ 14 hari</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-8 font-semibold">Tanpa kartu kredit. Bebas batalkan kapan saja.</p>
                  
                  <Link
                    href="/register"
                    className="group flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300"
                  >
                    Mulai Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <p className="text-xs text-slate-400 mt-6 font-medium">
                    Butuh bantuan setup? <a href="#" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Hubungi Tim Kami</a>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
