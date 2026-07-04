"use client";

import Link from "next/link";
import { Check } from "lucide-react";

export function PricingSection() {
  return (
    <section id="harga" className="py-24 bg-[#0a0a0a] border-t border-slate-800 relative">
      {/* Decorative gradient blob for glassmorphism to stand out */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Investasi Kecil untuk Mengamankan Komisi Besar
          </h2>
          <p className="text-lg text-slate-400 font-medium">
            Biaya langganan Closingan sebulan lebih murah dibandingkan komisi dari 1 SPK yang melayang karena Anda telat merespons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Trial Plan */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col hover:bg-white/10 transition-colors duration-300">
            <h3 className="text-xl font-bold text-white mb-2">Free Trial</h3>
            <p className="text-sm text-slate-400 mb-6">Buktikan sendiri seberapa cepat AI merespons.</p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold text-white">Rp 0</span>
              <span className="text-slate-500 font-medium">/ 14 hari</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                Merespons hingga 100 prospek pertama
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                Kualifikasi *Leads* Otomatis
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                Smart Human Handoff (Notifikasi ke HP)
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                Tanpa Kartu Kredit
              </li>
            </ul>

            <Link 
              href="/register"
              className="w-full block text-center px-6 py-3 rounded-xl border-2 border-slate-700 text-white font-bold hover:border-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Mulai Trial
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-emerald-950/40 backdrop-blur-md rounded-3xl p-8 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative flex flex-col transform md:-translate-y-4 hover:border-emerald-500/50 transition-all duration-300">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                Rekomendasi
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pro Sales</h3>
            <p className="text-sm text-slate-300 mb-6">Untuk Sales Otomotif yang serius mengejar target SPK bulanan.</p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold text-white">Rp 199.000</span>
              <span className="text-slate-400 font-medium">/ bulan</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">Unlimited</span> respons ke prospek
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                Upload Brosur PDF Unlimited
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                Custom AI Persona (Nada bicara AI bisa disesuaikan)
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                Prioritas Support 24/7
              </li>
            </ul>

            <Link 
              href="/register?plan=pro"
              className="w-full block text-center px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/40 transition-all active:scale-95"
            >
              Berlangganan Pro
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
