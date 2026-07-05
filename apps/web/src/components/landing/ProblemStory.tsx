"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export function ProblemStory() {
  return (
    <section id="cara-kerja" className="relative py-24 md:py-32 bg-[#050505] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-rose-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left: WhatsApp Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center order-2 lg:order-1"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute inset-0 bg-gradient-to-tr from-rose-900/20 to-orange-900/10 rounded-full blur-[80px]"
            />

            {/* Phone mockup */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full max-w-sm bg-[#0E0E0E]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
            >
              {/* Phone header */}
              <div className="bg-[#111]/90 border-b border-white/5 px-5 py-3.5 flex items-center justify-center">
                <div className="text-sm font-semibold text-white">
                  Pak Adi · 0812...
                </div>
              </div>

              {/* Chat body */}
              <div className="p-4 flex flex-col gap-3.5 min-h-[380px] bg-[#0A0A0A]">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="self-start max-w-[85%] bg-[#1A1A1A] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3"
                >
                  <p className="text-[13px] text-slate-200 leading-relaxed">
                    Siang pak, Xpander Cross ready stok warna putih ga? Mau kredit DP 50jt.
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    10:14
                  </span>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="self-start max-w-[85%] bg-[#1A1A1A] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3"
                >
                  <p className="text-[13px] text-slate-200 leading-relaxed">
                    Cicilan kena berapa ya per bulan? Tenor 5 tahun
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    10:15
                  </span>
                </motion.div>

                {/* Time Skip */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2, type: "spring", bounce: 0.5 }}
                  className="flex items-center gap-3 justify-center my-3"
                >
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-rose-500/40" />
                  <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/20">
                    <Clock className="w-3 h-3" /> 2 jam berlalu
                  </span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-rose-500/40" />
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.6, type: "spring" }}
                  className="self-end max-w-[85%] bg-slate-700 rounded-2xl rounded-tr-sm px-4 py-3 text-white"
                >
                  <p className="text-[13px] leading-relaxed">
                    Halo pak, maaf baru balas. Tadi saya lagi serah terima unit. Ready pak, promonya masih ada.
                  </p>
                  <span className="text-[10px] text-slate-300 block mt-1">
                    12:30
                  </span>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2.0, type: "spring" }}
                  className="self-start max-w-[85%] bg-[#1A1A1A] border border-rose-500/20 rounded-2xl rounded-tl-sm px-4 py-3"
                >
                  <p className="text-[13px] text-rose-300 font-medium leading-relaxed">
                    Oh gapapa pak. Barusan saya udah SPK di dealer sebelah, mereka fast respon soalnya. Makasih ya pak 🙏
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    12:35
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
              className="inline-flex items-center gap-2 text-rose-400 font-semibold text-xs tracking-wide mb-5 px-3.5 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/15"
            >
              Masalah yang Familiar?
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight"
            >
              Telat Balas 2 Jam,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">
                SPK Pindah ke Sebelah.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-base text-slate-400 leading-relaxed mb-8"
            >
              Anda lagi di jalan, meeting leasing, atau nyerahin kunci ke pembeli.
              Prospek baru tanya stok dan harga di WhatsApp — tapi baru bisa balas 2 jam kemudian.
              Di dunia otomotif, 2 jam = prospek sudah pindah dealer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="p-5 bg-white/5 border border-white/10 rounded-xl"
            >
              <p className="text-sm text-slate-300 leading-relaxed">
                Kenyataannya, prospek tidak menunggu. Yang paling cepat merespons, itulah yang dapat SPK. Bukan yang paling jago jualan.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
