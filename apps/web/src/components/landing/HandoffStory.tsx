"use client";

import { motion } from "framer-motion";
import { UserCheck, Handshake, BellRing } from "lucide-react";

export function HandoffStory() {
  return (
    <section className="relative py-28 md:py-36 bg-[#050505] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-amber-900/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left: Phone Notification Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center order-2 lg:order-1"
          >
            {/* Glow behind mockup */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute inset-0 bg-gradient-to-tr from-amber-900/30 to-orange-900/20 rounded-full blur-[80px]"
            />

            {/* Phone frame */}
            <motion.div
              animate={{ y: [-12, 12, -12] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-72 h-[450px] bg-[#0E0E0E]/90 backdrop-blur-2xl border-[6px] border-slate-800 rounded-[3rem] shadow-2xl shadow-amber-500/10 flex flex-col overflow-hidden"
            >
              {/* Phone Screen */}
              <div className="flex-1 bg-[#0A0A0A] p-4 pt-12 relative overflow-hidden">
                {/* Notification Banner */}
                <motion.div
                  initial={{ y: -80, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 0.8,
                    type: "spring",
                    bounce: 0.5,
                  }}
                  className="w-full bg-[#1A1A1A]/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/10 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-orange-500" />
                  <div className="flex items-start gap-3 relative z-10">
                    <motion.div
                      animate={{
                        rotate: [0, -15, 15, -15, 15, 0],
                      }}
                      transition={{
                        delay: 1.5,
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                      className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0"
                    >
                      <BellRing className="w-5 h-5 text-amber-400" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          Closingan Alert
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          Baru saja
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        🔥 Prospek (0819...) siap Test Drive! Ambil alih
                        percakapan sekarang.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Chat background simulation */}
                <div className="mt-8 space-y-4 opacity-30">
                  <motion.div
                    initial={{ x: -15, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.2 }}
                    className="w-3/4 h-12 bg-white/10 rounded-2xl rounded-tl-sm"
                  />
                  <motion.div
                    initial={{ x: -15, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.4 }}
                    className="w-2/3 h-16 bg-white/10 rounded-2xl rounded-tl-sm"
                  />
                  <motion.div
                    initial={{ x: 15, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.6 }}
                    className="w-3/4 h-12 bg-emerald-900/30 rounded-2xl rounded-tr-sm ml-auto"
                  />
                </div>
              </div>

              {/* Phone Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full" />
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
              className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs tracking-wide mb-5 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20"
            >
              <UserCheck className="w-4 h-4" /> HUMAN HANDOFF
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
            >
              AI yang Memanaskan.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                Anda yang Eksekusi.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-lg text-slate-400 leading-relaxed mb-8 font-medium"
            >
              AI kami tahu batasannya. Ia tidak akan mencoba menutup penjualan
              sendirian. Saat prospek mengetik &quot;Saya mau Test Drive&quot;
              atau meminta rekening DP, AI langsung berhenti.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="p-6 bg-white/5 backdrop-blur-xl border border-amber-500/20 rounded-2xl flex items-start gap-4 shadow-xl shadow-amber-500/5"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Handshake className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-base text-slate-300 font-bold leading-relaxed">
                Sistem akan mengirimkan notifikasi instan ke HP Anda. Anda
                tinggal masuk, bersalaman, dan mengunci komisi Anda. Tanpa repot
                edukasi awal.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
