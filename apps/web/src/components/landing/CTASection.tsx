"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-[#050505] py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-slate-900/50 backdrop-blur-xl rounded-[3rem] p-12 md:p-20 border border-indigo-500/20 shadow-[0_0_50px_rgba(79,70,229,0.15)] overflow-hidden"
        >
          {/* Cyberpunk Glows */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl" />
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 mb-8 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Zap className="w-8 h-8" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
            Siap mendominasi target bulan ini?
          </h2>
          <p className="text-xl text-slate-400 font-medium mb-10 max-w-2xl mx-auto">
            Bergabung dengan ratusan top sales mobil yang sudah menghemat waktu dan meningkatkan konversi mereka dengan engine AI Closingan.
          </p>
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-indigo-600 text-white font-bold text-xl hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.8)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-[gradient_2s_linear_infinite]" />
            <span className="relative z-10">Deploy Engine Sekarang</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-slate-500 text-sm mt-6 font-mono uppercase tracking-widest">
            TRIAL_14_DAYS // NO_CREDIT_CARD
          </p>
        </motion.div>
      </div>
    </section>
  );
}
