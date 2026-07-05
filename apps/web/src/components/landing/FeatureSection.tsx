import { Bot, MessageSquare, Zap, ShieldCheck, CarFront, Users } from "lucide-react";

export function FeatureSection() {
  return (
    <section id="fitur" className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-emerald-900/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-3">
            Fitur Utama
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Apa Saja yang Bisa Dilakukan Closingan
          </h3>
          <p className="text-base text-slate-400 leading-relaxed">
            Setiap fitur dirancang untuk satu tujuan: memastikan Anda tidak kehilangan prospek, apapun aktivitas Anda.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[minmax(240px,auto)]">
          {/* Card 1: Large */}
          <div className="md:col-span-2 rounded-2xl p-8 bg-gradient-to-br from-white/8 to-white/3 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-500" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 border border-white/5 group-hover:scale-105 transition-transform duration-300">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white mb-3">
                  Satu Nomor WhatsApp, Seluruh Tim
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                  Satu nomor WhatsApp bisa diakses oleh seluruh tim sales dari dashboard masing-masing. 
                  Tidak perlu lagi rebutan HP atau forward chat manual antar sales.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl p-8 bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 border border-white/5 group-hover:scale-105 transition-transform duration-300">
                <CarFront className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Paham Istilah Otomotif
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  AI mengerti percakapan soal DP, cicilan, tenor, leasing, OTR, hingga trade-in. Bukan chatbot generik.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl p-8 bg-white/5 border border-white/10 hover:border-teal-500/30 transition-all duration-300 group relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 border border-white/5 group-hover:scale-105 transition-transform duration-300">
                <Zap className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Balas dalam Hitungan Detik
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Prospek tidak perlu menunggu. AI langsung merespons begitu pesan masuk — 24 jam, 7 hari.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Large */}
          <div className="md:col-span-2 rounded-2xl p-8 bg-gradient-to-tl from-emerald-950/30 to-slate-900/20 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] group-hover:bg-teal-500/20 transition-all duration-500" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 border border-white/5 group-hover:scale-105 transition-transform duration-300">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white mb-3">
                  AI Tahu Kapan Harus Berhenti
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                  Saat prospek minta test drive, tanya rekening DP, atau ingin ketemu — AI langsung berhenti dan mengirim notifikasi ke HP Anda. Anda tinggal lanjutkan closing.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="rounded-2xl p-8 bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 border border-white/5 group-hover:scale-105 transition-transform duration-300">
                <Bot className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">
                  Kualifikasi Otomatis
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  AI mengumpulkan info budget, mobil diminati, dan timeline pembelian. Anda fokus ke prospek yang benar-benar siap.
                </p>
              </div>
            </div>
          </div>

          {/* Card 6 */}
          <div className="rounded-2xl p-8 bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 border border-white/5 group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">
                  Data Prospek Anda Aman
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Setiap akun terisolasi penuh. Data prospek sales A tidak bisa diakses oleh sales B. Privasi terjamin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
