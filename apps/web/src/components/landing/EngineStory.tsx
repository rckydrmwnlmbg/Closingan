"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  CheckCircle2,
  BotMessageSquare,
  Sparkles,
} from "lucide-react";

export function EngineStory() {
  return (
    <section className="relative py-28 md:py-36 bg-[#050505] overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-900/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
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
              className="inline-flex items-center gap-2 text-indigo-400 font-bold text-xs tracking-wide mb-5 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20"
            >
              <BrainCircuit className="w-4 h-4" /> AI INTELLIGENCE
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
            >
              Membedah Chat.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Merangkai Jawaban.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-400 leading-relaxed mb-10 font-medium"
            >
              Bukan sekadar chatbot balasan otomatis. Engine NLP kami membaca
              niat prospek, mendeteksi pertanyaan spesifik, dan membangun
              interaksi yang natural layaknya asisten manusia.
            </motion.p>

            <div className="flex flex-col gap-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-1">
                    Mengingat Konteks
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    AI mengingat percakapan sebelumnya sehingga obrolan mengalir
                    natural seperti manusia seutuhnya.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-1">
                    Kualifikasi Prospek
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Merespons pertanyaan umum, mengumpulkan detail kebutuhan, dan
                    memanaskan prospek sebelum diserahkan ke Anda.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Chat Dissection UI */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="order-2 relative"
          >
            {/* Background Glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute inset-0 bg-gradient-to-tr from-indigo-900/30 to-cyan-900/20 rounded-[3rem] blur-[60px]"
            />

            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative bg-[#0E0E0E]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-indigo-500/10"
            >
              {/* Incoming chat */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, type: "spring" }}
                className="bg-[#1A1A1A] backdrop-blur-md p-5 rounded-2xl mb-6 border border-white/5 shadow-md"
              >
                <div className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Prospek masuk
                </div>
                <p className="text-slate-200 font-semibold text-base leading-relaxed">
                  &quot;Siang, saya ada rencana ambil mobil untuk keluarga,
                  mending HRV atau BRV ya?&quot;
                </p>

                {/* Intent badges */}
                <div className="flex flex-wrap gap-2 mt-5">
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.0, type: "spring" }}
                    className="text-[10px] font-black tracking-wide px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 shadow-sm"
                  >
                    NEEDS: KELUARGA
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.2, type: "spring" }}
                    className="text-[10px] font-black tracking-wide px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 shadow-sm"
                  >
                    INTENT: KOMPARASI
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.4, type: "spring" }}
                    className="text-[10px] font-black tracking-wide px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 shadow-sm"
                  >
                    TARGET: HRV / BRV
                  </motion.span>
                </div>
              </motion.div>

              {/* Connection line */}
              <div className="flex justify-center mb-6 overflow-hidden">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: 32 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  className="w-1.5 bg-gradient-to-b from-indigo-500/50 to-cyan-400/80 rounded-full"
                />
              </div>

              {/* AI Generated Response */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.8, type: "spring" }}
                className="bg-gradient-to-br from-indigo-900/30 to-cyan-900/20 p-6 rounded-2xl border border-indigo-500/30 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BotMessageSquare className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-extrabold text-indigo-300">
                      AI Response
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-900/40 px-2 py-1 rounded">
                    0.2s
                  </span>
                </div>
                <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                  Halo! Untuk mobil keluarga, BRV sangat cocok karena memiliki
                  kapasitas 7 penumpang yang lega.
                  <br />
                  <br />
                  Sedangkan HRV tampilannya lebih sporty dengan kapasitas 5
                  penumpang.
                  <br />
                  <br />
                  Kira-kira bapak butuh yang 7 penumpang atau 5 penumpang?
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
