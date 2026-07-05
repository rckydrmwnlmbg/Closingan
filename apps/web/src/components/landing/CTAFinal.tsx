"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, QrCode, Clock, ShieldCheck } from "lucide-react";

export function CTAFinal() {
  return (
    <section className="relative py-24 md:py-32 bg-[#050505] overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-emerald-600/6 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-teal-600/6 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative bg-[#0C0C0C]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-14 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-5 leading-tight">
                Jangan Biarkan Prospek
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  Lari ke Dealer Sebelah.
                </span>
              </h2>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                Setup cuma 2 menit: daftar, scan QR WhatsApp, selesai.
                AI langsung aktif merespons prospek Anda.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  Scan QR WhatsApp — tidak perlu ganti nomor
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  14 hari trial gratis, tanpa kartu kredit
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  Bisa batal kapan saja, nomor tetap milik Anda
                </div>
              </div>
            </motion.div>

            {/* Right: CTA Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                type: "spring",
              }}
              className="flex flex-col items-center text-center"
            >
              <div className="bg-[#111]/90 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
                <h3 className="text-white font-bold text-lg mb-2">
                  Mulai Sekarang
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Gratis 14 hari. Tidak ada yang perlu diinstall.
                </p>

                <Link
                  href="/register"
                  className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Coba Gratis{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <p className="text-[11px] text-slate-500 mt-4">
                  Butuh bantuan?{" "}
                  <a
                    href="#"
                    className="text-emerald-400 font-medium hover:underline"
                  >
                    Hubungi kami di WhatsApp
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
