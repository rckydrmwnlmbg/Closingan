"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function EngineStory() {
  return (
    <section className="relative py-24 md:py-32 bg-[#050505] overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-900/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left: Typography */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="order-1"
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wide mb-5 px-3.5 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/15"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Bagaimana AI-nya Bekerja
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight"
            >
              Bukan Chatbot Template.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                AI yang Paham Jualan Mobil.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-base text-slate-400 leading-relaxed mb-8"
            >
              Closingan bukan auto-reply yang kirim template kaku. AI-nya baca konteks percakapan, 
              paham kalau prospek nanya soal DP, cicilan, atau stok warna — lalu jawab selayaknya sales berpengalaman.
            </motion.p>

            <div className="flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-0.5">
                    Ingat Percakapan Sebelumnya
                  </h4>
                  <p className="text-slate-400 text-[13px] leading-relaxed">
                    Kalau prospek sudah pernah nanya Avanza minggu lalu, AI tidak akan ulang dari awal. 
                    Langsung lanjut dari konteks terakhir.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-0.5">
                    Gali Info Prospek Otomatis
                  </h4>
                  <p className="text-slate-400 text-[13px] leading-relaxed">
                    AI menanyakan budget, rencana DP, dan tenor secara natural — jadi saat Anda ambil alih, 
                    data prospek sudah lengkap.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Chat Analysis UI */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="order-2 relative"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 0.4 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-cyan-900/10 rounded-[2.5rem] blur-[60px]"
            />

            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative bg-[#0E0E0E]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 md:p-6 shadow-2xl"
            >
              {/* Incoming chat */}
              <motion.div
                initial={{ y: -15, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, type: "spring" }}
                className="bg-[#1A1A1A] p-4 rounded-xl mb-5 border border-white/5"
              >
                <div className="text-[11px] text-slate-500 font-medium mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Chat masuk dari prospek
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">
                  &quot;Siang, mau nanya Xenia 1.5 R AT berapa OTR Jakarta? Rencana kredit DP 40jt tenor 4 tahun.&quot;
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.0, type: "spring" }}
                    className="text-[10px] font-semibold px-2.5 py-1 bg-emerald-500/15 text-emerald-300 rounded-md border border-emerald-500/20"
                  >
                    Mobil: Xenia 1.5 R AT
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.15, type: "spring" }}
                    className="text-[10px] font-semibold px-2.5 py-1 bg-blue-500/15 text-blue-300 rounded-md border border-blue-500/20"
                  >
                    DP: Rp 40jt
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.3, type: "spring" }}
                    className="text-[10px] font-semibold px-2.5 py-1 bg-purple-500/15 text-purple-300 rounded-md border border-purple-500/20"
                  >
                    Tenor: 4 tahun
                  </motion.span>
                </div>
              </motion.div>

              {/* Connection line */}
              <div className="flex justify-center mb-5 overflow-hidden">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: 24 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5, duration: 0.4 }}
                  className="w-1 bg-gradient-to-b from-indigo-500/40 to-cyan-400/60 rounded-full"
                />
              </div>

              {/* AI Generated Response */}
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.7, type: "spring" }}
                className="bg-gradient-to-br from-indigo-900/20 to-cyan-900/15 p-5 rounded-xl border border-indigo-500/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-semibold text-indigo-300">
                    Balasan AI
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-900/30 px-2 py-0.5 rounded">
                    0.2 detik
                  </span>
                </div>
                <p className="text-sm text-indigo-100/90 leading-relaxed">
                  Siang Pak! Xenia 1.5 R AT OTR Jakarta Rp 265,5jt. Untuk DP Rp 40jt tenor 4 tahun, 
                  estimasi cicilan sekitar Rp 5,8jt/bulan (tergantung leasing). Mau saya bantu 
                  bandingkan dari beberapa leasing pak?
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
