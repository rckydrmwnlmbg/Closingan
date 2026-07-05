"use client";

import { motion } from "framer-motion";
import { UserCheck, BellRing } from "lucide-react";

export function HandoffStory() {
  return (
    <section className="relative py-24 md:py-32 bg-[#050505] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[400px] h-[400px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left: Phone Notification Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center order-2 lg:order-1"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 0.4 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute inset-0 bg-gradient-to-tr from-amber-900/20 to-orange-900/10 rounded-full blur-[80px]"
            />

            {/* Phone frame */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-72 h-[420px] bg-[#0E0E0E]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Phone Screen */}
              <div className="flex-1 bg-[#0A0A0A] p-4 pt-10 relative overflow-hidden">
                {/* Notification Banner */}
                <motion.div
                  initial={{ y: -80, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 0.8,
                    type: "spring",
                    bounce: 0.4,
                  }}
                  className="w-full bg-[#1A1A1A]/95 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-l-2xl" />
                  <div className="flex items-start gap-3 relative z-10">
                    <motion.div
                      animate={{
                        rotate: [0, -12, 12, -12, 12, 0],
                      }}
                      transition={{
                        delay: 1.5,
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                      className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0"
                    >
                      <BellRing className="w-4 h-4 text-amber-400" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-white">
                          Closingan
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Baru saja
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-200 leading-relaxed">
                        🔥 Pak Adi minta jadwal test drive Xpander Cross besok sore. Ambil alih sekarang.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Second notification */}
                <motion.div
                  initial={{ y: -60, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 1.4,
                    type: "spring",
                    bounce: 0.4,
                  }}
                  className="w-full bg-[#1A1A1A]/95 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative overflow-hidden mt-3"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-2xl" />
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-white">
                          Closingan
                        </span>
                        <span className="text-[10px] text-slate-500">
                          2 menit lalu
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-200 leading-relaxed">
                        Bu Ratna sudah tanya soal DP dan leasing. Data lengkap, siap di-closing.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Background chat simulation */}
                <div className="mt-6 space-y-3 opacity-20">
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.8 }}
                    className="w-3/4 h-10 bg-white/10 rounded-xl rounded-tl-sm"
                  />
                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 2.0 }}
                    className="w-2/3 h-10 bg-emerald-900/30 rounded-xl rounded-tr-sm ml-auto"
                  />
                </div>
              </div>

              {/* Phone Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/15 rounded-full" />
            </motion.div>
          </motion.div>

          {/* Right: Typography */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="order-1 lg:order-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wide mb-5 px-3.5 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/15"
            >
              <UserCheck className="w-3.5 h-3.5" /> Kapan AI Berhenti, Anda Masuk
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight"
            >
              Prospek Sudah Panas.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                Tinggal Anda yang Closing.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-base text-slate-400 leading-relaxed mb-8"
            >
              AI tahu batasannya. Begitu prospek bilang &quot;mau test drive&quot;, 
              tanya soal rekening DP, atau minta ketemu — AI langsung berhenti 
              dan kirim notifikasi ke HP Anda.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="p-5 bg-white/5 border border-amber-500/15 rounded-xl flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">
                  Notifikasi langsung ke HP Anda
                </p>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Anda tinggal buka chat, baca ringkasan percakapan yang sudah dilakukan AI, 
                  lalu lanjutkan closing. Tanpa perlu edukasi ulang dari nol.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
