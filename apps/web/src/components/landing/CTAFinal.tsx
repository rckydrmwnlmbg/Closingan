"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Lock, CheckCircle2, QrCode } from "lucide-react";

export function CTAFinal() {
  return (
    <section className="relative py-28 md:py-36 bg-[#050505] overflow-hidden">
      {/* Animated background accents */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4 pointer-events-none"
      />
      <motion.div
        animate={{
          rotate: -360,
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative bg-[#0C0C0C]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-16 overflow-hidden shadow-2xl"
        >
          {/* Inner glow effects */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-900/30 text-indigo-300 rounded-full text-xs font-bold tracking-wide mb-6 border border-indigo-500/20 shadow-sm">
                <Lock className="w-4 h-4" /> AMAN & TERPERCAYA
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                Amankan{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                  Target SPK
                </span>{" "}
                Anda Bulan Ini.
              </h2>
              <p className="text-slate-400 font-medium mb-8 leading-relaxed text-base md:text-lg">
                Bergabunglah dengan ratusan Top Sales Otomotif Indonesia yang
                bisa tidur nyenyak karena tahu AI mengurus prospek mereka 24/7.
              </p>
              <ul className="space-y-4 mb-8">
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 text-sm md:text-base text-slate-200 font-bold"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4 text-indigo-400" />
                  </div>
                  Cukup scan QR WhatsApp (Hitungan detik)
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 text-sm md:text-base text-slate-200 font-bold"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  </div>
                  Nomor Anda tetap milik Anda sepenuhnya
                </motion.li>
              </ul>
            </motion.div>

            {/* Right: Pricing Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                type: "spring",
              }}
            >
              <div className="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 flex flex-col justify-center relative shadow-2xl shadow-indigo-500/5 hover:border-indigo-500/30 transition-colors duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-[2rem]" />

                <div className="relative z-10 text-center">
                  <h3 className="text-white font-extrabold text-xl mb-4 tracking-wide uppercase">
                    Uji Coba Sistem
                  </h3>
                  <div className="flex items-baseline justify-center gap-1 mb-3">
                    <span className="text-xl text-slate-500 font-bold">Rp</span>
                    <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tighter">
                      0
                    </span>
                    <span className="text-base text-slate-500 font-bold">
                      / 14 hari
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-8 font-semibold">
                    Tanpa kartu kredit. Bebas batalkan kapan saja.
                  </p>

                  <Link
                    href="/register"
                    className="group flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Mulai Sekarang{" "}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <p className="text-xs text-slate-500 mt-6 font-medium">
                    Butuh bantuan setup?{" "}
                    <a
                      href="#"
                      className="text-indigo-400 font-bold hover:underline"
                    >
                      Hubungi Tim Kami
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
