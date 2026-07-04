"use client";

import { motion } from "framer-motion";
import { Clock, AlertCircle } from "lucide-react";

export function ProblemStory() {
  return (
    <section className="relative py-28 md:py-36 bg-[#050505] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-rose-900/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left: WhatsApp Mockup */}
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
              whileInView={{ scale: 1, opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute inset-0 bg-gradient-to-tr from-rose-900/30 to-orange-900/20 rounded-full blur-[80px]"
            />

            {/* Phone mockup */}
            <motion.div
              animate={{ y: [-12, 12, -12] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full max-w-sm bg-[#0E0E0E]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-rose-500/10"
            >
              {/* Phone header */}
              <div className="bg-[#111]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-center">
                <div className="text-sm font-bold text-white">
                  Prospek (0812...)
                </div>
              </div>

              {/* Chat body */}
              <div className="p-5 flex flex-col gap-4 min-h-[400px] bg-[#0A0A0A]">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="self-start max-w-[85%] bg-[#1A1A1A] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md"
                >
                  <p className="text-sm text-slate-200">
                    Siang pak, promo DP Pajero Dakar 40jt masih ada?
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    10:14 AM
                  </span>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="self-start max-w-[85%] bg-[#1A1A1A] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md"
                >
                  <p className="text-sm text-slate-200">
                    Kalo DP 100jt cicilannya kena berapa ya?
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    10:15 AM
                  </span>
                </motion.div>

                {/* Time Skip */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2, type: "spring", bounce: 0.5 }}
                  className="flex items-center gap-3 justify-center my-4"
                >
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-rose-500/50" />
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1 shrink-0 px-3 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/20 shadow-sm shadow-rose-500/10">
                    <Clock className="w-3 h-3 animate-pulse" /> TELAT 2 JAM
                  </span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-rose-500/50" />
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.6, type: "spring" }}
                  className="self-end max-w-[85%] bg-slate-700 rounded-2xl rounded-tr-sm px-4 py-3 text-white shadow-md"
                >
                  <p className="text-sm">
                    Halo pak, maaf baru balas. Tadi saya sedang serah terima
                    unit. Promonya masih ada pak.
                  </p>
                  <span className="text-[10px] text-slate-300 block mt-1">
                    12:30 PM
                  </span>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2.0, type: "spring" }}
                  className="self-start max-w-[85%] bg-[#1A1A1A] border border-rose-500/30 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg shadow-rose-500/10"
                >
                  <p className="text-sm text-white font-bold">
                    Gajadi pak, barusan saya udah deal SPK sama dealer sebelah
                    yang fast respon.
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    12:35 PM
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Typography */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 text-rose-400 font-bold text-xs tracking-wide mb-5 px-4 py-2 bg-rose-500/10 rounded-full border border-rose-500/20"
            >
              <AlertCircle className="w-4 h-4" /> THE GHOSTING EFFECT
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
            >
              Telat Satu Jam.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
                Satu SPK Melayang.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-lg text-slate-400 leading-relaxed mb-8 font-medium"
            >
              Anda sedang di jalan, meeting, atau menyerahkan unit ke klien.
              Prospek baru bertanya via WhatsApp, namun Anda membalas 2 jam
              kemudian.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl"
            >
              <p className="text-base text-slate-300 font-semibold leading-relaxed">
                Di era digital, loyalitas prospek diukur dalam hitungan menit.
                Jika Anda lambat merespons, Sales dealer sebelah akan merebut
                prospek (dan komisi) Anda.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
