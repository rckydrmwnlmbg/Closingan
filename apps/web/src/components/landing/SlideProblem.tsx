"use client";

import { motion } from "framer-motion";
import { Clock, AlertCircle } from "lucide-react";

export function SlideProblem() {
  return (
    <div className="w-full h-full flex items-center justify-center px-4 md:px-12 lg:px-24">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: WhatsApp Mockup showing Ghosting with 3D Float */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="relative order-2 lg:order-1 flex justify-center perspective-1000"
        >
          {/* Parallax Background Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-tr from-rose-200 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/20 rounded-full blur-3xl" 
          />
          
          <motion.div 
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full max-w-sm bg-white/80 dark:bg-[#121212]/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-rose-500/10"
          >
            {/* Phone Notch/Header */}
            <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-slate-200/50 dark:border-white/10 px-6 py-4 flex items-center justify-center">
              <div className="text-sm font-bold text-slate-800 dark:text-white">Prospek (0812...)</div>
            </div>
            
            {/* Chat Body */}
            <div className="p-5 flex flex-col gap-4 bg-slate-50/50 dark:bg-black/20 min-h-[400px]">
              
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="self-start max-w-[85%] bg-white dark:bg-[#222] border border-slate-100 dark:border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md"
              >
                <p className="text-sm text-slate-700 dark:text-slate-200">Siang pak, promo DP Pajero Dakar 40jt masih ada?</p>
                <span className="text-[10px] text-slate-400 block mt-1">10:14 AM</span>
              </motion.div>

              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
                className="self-start max-w-[85%] bg-white dark:bg-[#222] border border-slate-100 dark:border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md"
              >
                <p className="text-sm text-slate-700 dark:text-slate-200">Kalo DP 100jt cicilannya kena berapa ya?</p>
                <span className="text-[10px] text-slate-400 block mt-1">10:15 AM</span>
              </motion.div>
              
              {/* Time Skip Indicator */}
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2, type: "spring", bounce: 0.6 }}
                className="flex items-center gap-3 justify-center my-4"
              >
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-rose-300 dark:to-rose-500/50" />
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 shrink-0 px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 rounded-full border border-rose-100 dark:border-rose-500/20 shadow-sm shadow-rose-500/10">
                  <Clock className="w-3 h-3 animate-pulse" /> TELAT 2 JAM
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-rose-300 dark:to-rose-500/50" />
              </motion.div>

              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 2.8, type: "spring" }}
                className="self-end max-w-[85%] bg-slate-800 dark:bg-slate-700 rounded-2xl rounded-tr-sm px-4 py-3 text-white shadow-md"
              >
                <p className="text-sm">Halo pak, maaf baru balas. Tadi saya sedang serah terima unit. Promonya masih ada pak.</p>
                <span className="text-[10px] text-slate-300 block mt-1">12:30 PM</span>
              </motion.div>

              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 3.5, type: "spring" }}
                className="self-start max-w-[85%] bg-white dark:bg-[#222] border border-rose-200 dark:border-rose-500/30 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg shadow-rose-500/10"
              >
                <p className="text-sm text-slate-800 dark:text-white font-bold">Gajadi pak, barusan saya udah deal SPK sama dealer sebelah yang fast respon.</p>
                <span className="text-[10px] text-slate-400 block mt-1">12:35 PM</span>
              </motion.div>
            </div>
            
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
            className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs tracking-wide mb-4 px-4 py-2 bg-rose-50 dark:bg-rose-500/10 rounded-full border border-rose-100 dark:border-rose-500/20"
          >
            <AlertCircle className="w-4 h-4" /> THE GHOSTING EFFECT
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight"
          >
            Telat Satu Jam. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Satu SPK Melayang.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium"
          >
            Anda sedang di jalan, *meeting*, atau menyerahkan unit ke klien. Prospek baru bertanya via WhatsApp, namun Anda membalas 2 jam kemudian.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5"
          >
            <p className="text-base text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
              Di era digital, loyalitas prospek diukur dalam hitungan menit. Jika Anda lambat merespons, Sales dealer sebelah akan merebut prospek (dan komisi) Anda.
            </p>
          </motion.div>
        </motion.div>
        
      </div>
    </div>
  );
}
