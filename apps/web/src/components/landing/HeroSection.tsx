"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-emerald-200/40 dark:bg-emerald-900/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-teal-200/40 dark:bg-teal-900/20 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-sm mb-6 border border-emerald-200 dark:border-emerald-500/20">
            Khusus untuk Sales Otomotif Indonesia
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 leading-[1.1]">
            Jangan Biarkan Prospek Lari Karena Anda <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Telat Membalas.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
            Anda sedang serah terima unit, prospek baru bertanya via WhatsApp. Biarkan AI kami mengkualifikasi *leads* dalam 2 detik, 24 jam sehari. Kunci SPK Anda sekarang.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-emerald-600 text-white font-bold text-base hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30 transition-all active:scale-95"
            >
              Mulai 14 Hari Gratis <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-slate-500 font-medium">Tanpa Kartu Kredit</p>
          </div>
        </motion.div>

        {/* Hero Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 mx-auto max-w-5xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/50 to-transparent dark:from-emerald-900/20 rounded-t-[3rem] -z-10 blur-2xl" />
          
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 md:p-10 flex flex-col items-center">
            
            <div className="w-full max-w-2xl bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl p-6 border border-slate-100 dark:border-white/5 relative shadow-inner">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 dark:text-white">Closingan AI</h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">Merespons dalam 0.2 detik</p>
                </div>
              </div>

              <div className="space-y-6 text-left">
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-[#222] border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Prospek (0812...)</p>
                    <p className="text-slate-800 dark:text-slate-200">Siang pak, promo Brio Satya bulan ini ada DP ringan?</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] shadow-lg shadow-emerald-600/20">
                    <p className="text-sm font-bold text-emerald-200 mb-1">AI Assistant</p>
                    <p className="text-white">Siang pak! Untuk Brio Satya bulan ini ada promo DP ringan mulai 15 Juta. Boleh saya kirimkan e-brosur lengkapnya?</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
