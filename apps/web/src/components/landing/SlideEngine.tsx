"use client";

import { motion } from "framer-motion";
import { BrainCircuit, CheckCircle2, BotMessageSquare, Sparkles } from "lucide-react";

export function SlideEngine() {
  return (
    <div className="w-full h-full flex items-center justify-center px-4 md:px-12 lg:px-24">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Typography */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="order-1"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-wide mb-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-full border border-indigo-100 dark:border-indigo-500/20"
          >
            <BrainCircuit className="w-4 h-4" /> AI INTELLIGENCE
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight"
          >
            Membedah Chat. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">Merangkai Jawaban.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 font-medium"
          >
            Bukan sekadar *chatbot* balasan otomatis (*Auto-Reply*). Engine NLP kami membaca niat (*intent*) prospek, mendeteksi pertanyaan spesifik, dan membangun interaksi yang natural layaknya asisten manusia.
          </motion.p>
          
          <div className="flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-100 dark:border-white/5 backdrop-blur-sm"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 shadow-inner">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold text-base mb-1">Mengingat Konteks</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">AI mengingat percakapan sebelumnya sehingga obrolan mengalir natural seperti manusia seutuhnya.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-100 dark:border-white/5 backdrop-blur-sm"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold text-base mb-1">Kualifikasi Prospek</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Merespons pertanyaan umum, mengumpulkan detail kebutuhan, dan memanaskan prospek sebelum diserahkan ke Anda.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right: Clean Chat Dissection UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          className="order-2 relative perspective-1000"
        >
          {/* Background Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-tr from-indigo-300 to-cyan-200 dark:from-indigo-900/40 dark:to-cyan-900/20 rounded-[3rem] blur-3xl opacity-60" 
          />
          
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-white/80 dark:bg-[#121212]/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-indigo-500/10"
          >
            
            {/* The incoming chat */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
              className="bg-slate-50/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md p-5 rounded-2xl mb-6 relative border border-slate-200/50 dark:border-white/5 shadow-md"
            >
              <div className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Prospek masuk
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-semibold text-base leading-relaxed">
                &quot;Siang, saya ada rencana ambil mobil untuk keluarga, mending HRV atau BRV ya?&quot;
              </p>
              
              {/* Highlight Badges extracting data */}
              <div className="flex flex-wrap gap-2 mt-5">
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5, type: "spring" }}
                  className="text-[10px] font-black tracking-wide px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-500/30 shadow-sm"
                >
                  NEEDS: KELUARGA
                </motion.span>
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.7, type: "spring" }}
                  className="text-[10px] font-black tracking-wide px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-500/30 shadow-sm"
                >
                  INTENT: KOMPARASI
                </motion.span>
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.9, type: "spring" }}
                  className="text-[10px] font-black tracking-wide px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-500/30 shadow-sm"
                >
                  TARGET: HRV / BRV
                </motion.span>
              </div>
            </motion.div>
            
            {/* Connection Line */}
            <div className="flex justify-center mb-6 overflow-hidden">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: 32 }}
                transition={{ delay: 2.2, duration: 0.5 }}
                className="w-1.5 bg-gradient-to-b from-indigo-200 to-cyan-400 dark:from-indigo-500/50 dark:to-cyan-400/80 rounded-full" 
              />
            </div>

            {/* AI Generated Response */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.5, type: "spring" }}
              className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/30 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BotMessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-extrabold text-indigo-900 dark:text-indigo-300">AI Response</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/40 px-2 py-1 rounded">0.2s</span>
              </div>
              <p className="text-sm text-indigo-950 dark:text-indigo-100 leading-relaxed font-medium">
                Halo! Untuk mobil keluarga, BRV sangat cocok karena memiliki kapasitas 7 penumpang yang lega. <br/><br/>
                Sedangkan HRV tampilannya lebih sporty dengan kapasitas 5 penumpang. <br/><br/>
                Kira-kira bapak butuh yang 7 penumpang atau 5 penumpang?
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
        
      </div>
    </div>
  );
}
