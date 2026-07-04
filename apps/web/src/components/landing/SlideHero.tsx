"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Bot, Sparkles } from "lucide-react";

export function SlideHero() {
  return (
    <div className="w-full h-full flex items-center justify-center px-4 md:px-12 lg:px-24">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Typography & CTAs */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            AI Assistant Khusus Sales Mobil
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6"
          >
            Balas <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-500">Ribuan Leads</span> dalam 2 Detik.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-normal max-w-lg mb-10 leading-relaxed"
          >
            Berhenti kehilangan pelanggan karena Anda sedang sibuk *meeting* atau serah terima unit. Biarkan AI kami yang melakukan edukasi dan mengunci minat prospek 24/7.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Link 
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-base shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              Coba Gratis 14 Hari <ChevronRight className="w-5 h-5" />
            </Link>
            <span className="text-sm text-slate-500 font-medium px-4">
              Tanpa Kartu Kredit
            </span>
          </motion.div>
        </motion.div>

        {/* Right: WhatsApp Floating Mockup with Continuous Motion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="relative hidden lg:block h-[500px]"
        >
          {/* Decorative Glass Background - Continually Floating */}
          <motion.div 
            animate={{ 
              y: [-10, 10, -10],
              rotate: [-5, -7, -5]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-3xl rounded-[3rem] border border-white/40 dark:border-white/10 shadow-2xl" 
          />
          
          {/* Main Container */}
          <motion.div 
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full h-full p-6 flex flex-col gap-6 overflow-hidden z-10"
          >
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Closingan AI</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Active • Replying instantly</p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-6 relative">
              
              {/* Floating Chat 1 */}
              <motion.div 
                initial={{ x: -50, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
                className="self-start max-w-[85%] relative"
              >
                <div className="text-xs text-slate-500 mb-1 ml-2 font-medium">Prospek (0812...)</div>
                <div className="bg-white dark:bg-[#1e1e1e] border border-slate-100 dark:border-white/5 p-4 rounded-2xl rounded-tl-sm text-slate-700 dark:text-slate-200 text-sm shadow-xl shadow-black/5">
                  Halo pak, promo DP ringan untuk Brio Satya bulan ini berapa ya?
                </div>
              </motion.div>

              {/* Floating Chat AI 1 */}
              <motion.div 
                initial={{ x: 50, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, type: "spring", stiffness: 200, damping: 20 }}
                className="self-end max-w-[85%] relative"
              >
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 mr-2 text-right font-bold">AI Assistant (0.2s)</div>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-2xl rounded-tr-sm text-sm shadow-xl shadow-emerald-500/20">
                  Halo! Untuk Brio Satya bulan ini ada promo DP ringan pak. Boleh saya kirimkan e-brosur lengkapnya?
                </div>
              </motion.div>

              {/* Floating Chat 2 */}
              <motion.div 
                initial={{ x: -50, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 2.8, type: "spring", stiffness: 200, damping: 20 }}
                className="self-start max-w-[85%] relative mt-4"
              >
                <div className="text-xs text-slate-500 mb-1 ml-2 font-medium">Prospek (0819...)</div>
                <div className="bg-white dark:bg-[#1e1e1e] border border-slate-100 dark:border-white/5 p-4 rounded-2xl rounded-tl-sm text-slate-700 dark:text-slate-200 text-sm shadow-xl shadow-black/5">
                  Pajero Sport Dakar ready stok warna hitam?
                </div>
              </motion.div>

              {/* Floating Chat AI 2 */}
              <motion.div 
                initial={{ x: 50, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 3.2, type: "spring", stiffness: 200, damping: 20 }}
                className="self-end max-w-[85%] relative"
              >
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 mr-2 text-right font-bold">AI Assistant (0.1s)</div>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-2xl rounded-tr-sm text-sm shadow-xl shadow-emerald-500/20">
                  Pajero Sport Dakar Hitam ready 2 unit pak! Bisa langsung proses. Kapan bapak ada waktu luang untuk Test Drive?
                </div>
              </motion.div>

            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
