"use client";

import { XCircle, CheckCircle2 } from "lucide-react";

export function BenefitSection() {
  return (
    <section className="py-24 bg-[#020804] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Mengapa Sales Otomotif Butuh Ini?
          </h2>
          <p className="text-lg text-slate-400">
            Perbedaan signifikan antara cara lama yang melelahkan dan cara baru yang serba otomatis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          
          {/* TANPA CLOSINGAN */}
          <div className="rounded-[2.5rem] p-10 bg-red-950/20 backdrop-blur-md border border-red-900/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/20 rounded-full blur-[80px] pointer-events-none" />
            
            <h3 className="text-2xl font-bold text-red-400 mb-8 flex items-center gap-3">
              <XCircle className="w-8 h-8" />
              Tanpa Closingan
            </h3>
            
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-slate-300">Harus begadang melayani prospek yang *chat* jam 11 malam.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-slate-300">Pusing memilah mana prospek yang serius dan mana yang hanya &quot;tanya-tanya&quot;.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-slate-300">SPK melayang ke dealer sebelah hanya karena Anda terlambat balas 5 menit saat sedang *test drive*.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-slate-300">Satu HP WhatsApp diperebutkan oleh banyak sales.</p>
              </li>
            </ul>
          </div>

          {/* DENGAN CLOSINGAN */}
          <div className="rounded-[2.5rem] p-10 bg-emerald-950/30 backdrop-blur-md border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden transform md:-translate-y-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" />
            
            <h3 className="text-2xl font-bold text-emerald-400 mb-8 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8" />
              Dengan Closingan
            </h3>
            
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-white font-medium">Tidur tenang, AI merespons prospek secara natural dalam 0.1 detik di jam berapapun.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-white font-medium">AI mengkualifikasi *budget*, TDP, dan Tenor secara otomatis. Anda tinggal terima bersih.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-white font-medium">Saat prospek siap beli (Hot Lead), alarm berbunyi di HP Anda untuk mengambil alih chat.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-white font-medium">Satu nomor WhatsApp terhubung ke seluruh tim Anda dengan aman (Omnichannel).</p>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
