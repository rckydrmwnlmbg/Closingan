"use client";

import { motion } from "framer-motion";
import { UserCheck, Handshake, BellRing } from "lucide-react";

export function SlideHandoff() {
  return (
    <div className="w-full h-full flex items-center justify-center px-4 md:px-12 lg:px-24">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Clean Smartphone Notification Mockup with 3D Float */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateZ: -5 }}
          animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="relative order-2 lg:order-1 flex justify-center perspective-1000"
        >
          {/* Parallax Background Accent */}
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-tr from-amber-200 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/30 rounded-full blur-3xl" 
          />
          
          <motion.div 
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-72 h-[450px] bg-white/90 dark:bg-[#121212]/90 backdrop-blur-2xl border-8 border-slate-900 dark:border-black rounded-[3rem] shadow-2xl shadow-amber-500/20 flex flex-col overflow-hidden"
          >
            
            {/* Phone Screen Background */}
            <div className="flex-1 bg-slate-50/50 dark:bg-[#1a1a1a]/50 p-4 pt-12 relative overflow-hidden">
              
              {/* Animated Background Mesh */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"
              />

              {/* Notification Banner */}
              <motion.div
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1, type: "spring", bounce: 0.5, stiffness: 200 }}
                className="w-full bg-white/95 dark:bg-[#222]/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-white/10 relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-orange-500" />
                <div className="flex items-start gap-3 relative z-10">
                  <motion.div 
                    animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                    transition={{ delay: 1.5, duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 flex items-center justify-center shrink-0 shadow-inner"
                  >
                    <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Closingan Alert</span>
                      <span className="text-[10px] text-slate-500 font-bold">Baru saja</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                      🔥 Prospek (0819...) siap Test Drive! Ambil alih percakapan sekarang.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Chat background simulation with stagger */}
              <div className="mt-8 space-y-4 opacity-40 blur-[2px]">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="w-3/4 h-12 bg-slate-300 dark:bg-white/20 rounded-2xl rounded-tl-sm shadow-sm" 
                />
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="w-2/3 h-16 bg-slate-300 dark:bg-white/20 rounded-2xl rounded-tl-sm shadow-sm" 
                />
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  className="w-3/4 h-12 bg-emerald-200 dark:bg-emerald-900/50 rounded-2xl rounded-tr-sm ml-auto shadow-sm" 
                />
              </div>
            </div>
            
            {/* Phone Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-300 dark:bg-white/20 rounded-full" />
          </motion.div>
        </motion.div>

        {/* Right: Typography */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="order-1 lg:order-2"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs tracking-wide mb-4 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 rounded-full border border-amber-100 dark:border-amber-500/20"
          >
            <UserCheck className="w-4 h-4" /> HUMAN HANDOFF
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight"
          >
            AI yang Memanaskan. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Anda yang Eksekusi.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 font-medium"
          >
            AI kami tahu batasannya. Ia tidak akan mencoba menutup penjualan sendirian. Saat prospek mengetik &quot;Saya mau Test Drive&quot; atau meminta rekening DP, AI langsung berhenti.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-amber-200/50 dark:border-amber-500/20 rounded-2xl flex items-start gap-4 shadow-xl shadow-amber-500/5"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 flex items-center justify-center shrink-0 shadow-inner border border-amber-200 dark:border-amber-500/30">
              <Handshake className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-base text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
              Sistem akan mengirimkan notifikasi instan ke HP Anda. Anda tinggal masuk, bersalaman, dan mengunci komisi Anda. Tanpa repot edukasi awal.
            </p>
          </motion.div>
        </motion.div>
        
      </div>
    </div>
  );
}
