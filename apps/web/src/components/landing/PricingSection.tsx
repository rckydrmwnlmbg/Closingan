"use client";

import Link from "next/link";
import { Check } from "lucide-react";

export function PricingSection() {
  return (
    <section id="harga" className="py-20 bg-[#0a0a0a] border-t border-slate-800 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Harga Lebih Murah dari Satu SPK yang Lepas
          </h2>
          <p className="text-base text-slate-400">
            Biaya langganan sebulan lebih kecil dari komisi satu unit mobil yang Anda kehilangan karena telat balas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Trial */}
          <div className="bg-white/5 rounded-2xl p-7 border border-white/10 flex flex-col hover:bg-white/[0.07] transition-colors duration-300">
            <h3 className="text-lg font-bold text-white mb-1">Free Trial</h3>
            <p className="text-sm text-slate-400 mb-5">
              Buktikan sendiri sebelum berlangganan.
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-extrabold text-white">Rp 0</span>
              <span className="text-slate-500 font-medium text-sm">/ 14 hari</span>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2.5 text-sm text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                Hingga 100 prospek pertama
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                Kualifikasi prospek otomatis
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                Notifikasi hot lead ke HP
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                Tanpa kartu kredit
              </li>
            </ul>

            <Link
              href="/register"
              className="w-full block text-center px-5 py-3 rounded-xl border border-slate-700 text-white font-semibold text-sm hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
            >
              Mulai Trial
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-emerald-950/30 rounded-2xl p-7 border border-emerald-500/25 shadow-[0_0_40px_rgba(16,185,129,0.08)] relative flex flex-col md:-translate-y-3 hover:border-emerald-500/40 transition-all duration-300">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wide">
                Rekomendasi
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Pro Sales</h3>
            <p className="text-sm text-slate-300 mb-5">
              Untuk sales yang serius mengejar target bulanan.
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-extrabold text-white">Rp 199.000</span>
              <span className="text-slate-400 font-medium text-sm">/ bulan</span>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2.5 text-sm text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><span className="font-semibold text-white">Unlimited</span> prospek</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Upload brosur PDF unlimited
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Custom nada bicara AI
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Support prioritas
              </li>
            </ul>

            <Link
              href="/register?plan=pro"
              className="w-full block text-center px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-[0.98]"
            >
              Berlangganan Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
