"use client";

import { XCircle, CheckCircle2 } from "lucide-react";

export function BenefitSection() {
  return (
    <section className="py-20 bg-[#020804] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Sebelum vs Sesudah Pakai Closingan
          </h2>
          <p className="text-base text-slate-400">
            Bukan soal teknologi canggih. Ini soal tidak kehilangan prospek yang sudah susah payah Anda dapatkan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* TANPA CLOSINGAN */}
          <div className="rounded-2xl p-8 bg-red-950/15 border border-red-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-900/15 rounded-full blur-[80px] pointer-events-none" />

            <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2.5">
              <XCircle className="w-6 h-6" />
              Tanpa Closingan
            </h3>

            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  Prospek chat jam 11 malam, baru dibalas besok pagi. Sudah deal sama dealer lain.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  Bingung mana yang serius mau beli, mana yang cuma tanya-tanya. Energi habis untuk prospek yang tidak jadi.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  Lagi serah terima unit, 2 prospek baru masuk. Baru bisa balas setelah 2 jam — keduanya sudah pindah.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  Follow-up manual pakai reminder HP. Sering lupa, prospek merasa diabaikan.
                </p>
              </li>
            </ul>
          </div>

          {/* DENGAN CLOSINGAN */}
          <div className="rounded-2xl p-8 bg-emerald-950/20 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.08)] relative overflow-hidden md:-translate-y-3">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />

            <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6" />
              Dengan Closingan
            </h3>

            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-sm text-white leading-relaxed">
                  Prospek chat jam berapapun, AI langsung jawab dalam hitungan detik. Anda tidur nyenyak.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-sm text-white leading-relaxed">
                  AI otomatis mengumpulkan info budget, DP, dan tenor. Anda hanya terima prospek yang sudah siap closing.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-sm text-white leading-relaxed">
                  Saat prospek bilang &quot;mau test drive&quot; atau tanya rekening, notifikasi langsung masuk ke HP Anda.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-sm text-white leading-relaxed">
                  Sistem follow-up otomatis. Prospek yang belum respon 2 hari akan di-ping ulang secara natural.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
