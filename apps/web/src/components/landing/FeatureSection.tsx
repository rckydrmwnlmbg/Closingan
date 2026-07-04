import { Bot, MessageSquare, Zap, ShieldCheck, CarFront, Users } from "lucide-react";

export function FeatureSection() {
  return (
    <section id="solusi" className="py-32 bg-[#050505] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-900/30 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-900/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold tracking-widest text-emerald-400 uppercase mb-3">
            Mengapa Closingan?
          </h2>
          <h3 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Bukan Sekadar Chatbot.
          </h3>
          <p className="text-xl text-slate-400 leading-relaxed font-light">
            Dirancang dari nol secara eksklusif untuk mendobrak batasan dan mengeliminasi *bottleneck* penjualan mobil di Indonesia.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
          
          {/* Card 1: Large (Span 2) */}
          <div className="md:col-span-2 rounded-[2.5rem] p-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 transition-all duration-500 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] group-hover:bg-emerald-500/40 transition-all duration-500" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                <MessageSquare className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-white mb-4">Integrasi WhatsApp Tanpa Batas</h4>
                <p className="text-lg text-slate-300 leading-relaxed font-light max-w-xl">
                  Satu nomor WhatsApp untuk seluruh tim. Balas ribuan pesan secara bersamaan tanpa takut nomor diblokir. Ucapkan selamat tinggal pada metode membagikan satu handphone ke banyak sales.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Regular */}
          <div className="rounded-[2.5rem] p-10 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 transition-all duration-500 group relative overflow-hidden shadow-2xl">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                <CarFront className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white mb-3">Konteks Otomotif</h4>
                <p className="text-slate-400 leading-relaxed font-light">
                  Mengerti istilah leasing, TDP, Tenor, hingga Asuransi All-Risk dengan akurasi 99%.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Regular */}
          <div className="rounded-[2.5rem] p-10 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-teal-500/50 transition-all duration-500 group relative overflow-hidden shadow-2xl">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-8 h-8 text-teal-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white mb-3">Respon Kilat</h4>
                <p className="text-slate-400 leading-relaxed font-light">
                  Setiap pesan dibalas dalam 0.1 detik. Prospek Anda tidak akan pernah menunggu lagi.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Large (Span 2) */}
          <div className="md:col-span-2 rounded-[2.5rem] p-10 bg-gradient-to-tl from-emerald-950/40 to-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 transition-all duration-500 group relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-500/20 rounded-full blur-[80px] group-hover:bg-teal-500/40 transition-all duration-500" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-white mb-4">Smart Human Handoff</h4>
                <p className="text-lg text-slate-300 leading-relaxed font-light max-w-xl">
                  AI bertugas menghangatkan prospek. Saat muncul kata kunci &quot;test drive&quot; atau &quot;simulasi&quot;, AI otomatis menepi dan membunyikan alarm di HP Anda untuk eksekusi penutupan.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: Regular */}
          <div className="rounded-[2.5rem] p-10 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 transition-all duration-500 group relative overflow-hidden shadow-2xl">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                <Bot className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-3">Filter Otomatis</h4>
                <p className="text-slate-400 leading-relaxed font-light text-sm">
                  Mengabaikan leads &quot;sampah&quot; dan hanya memfokuskan energi Anda pada Hot Leads.
                </p>
              </div>
            </div>
          </div>

          {/* Card 6: Regular */}
          <div className="rounded-[2.5rem] p-10 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 transition-all duration-500 group relative overflow-hidden shadow-2xl">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-3">Privasi Absolut</h4>
                <p className="text-slate-400 leading-relaxed font-light text-sm">
                  Enkripsi kelas militer. Data prospek Anda 100% aman dari intaian kompetitor.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
