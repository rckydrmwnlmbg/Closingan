"use client";

import { Clock, AlertTriangle, TrendingDown } from "lucide-react";

export function ProblemSection() {
  return (
    <section id="masalah" className="py-24 bg-slate-50 dark:bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
            Realita Pahit Penjualan Mobil di Era Digital
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Prospek tidak peduli seberapa sibuk Anda. Jika Anda terlambat membalas, mereka akan mencari Sales lain yang *fast respon*.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Jeda Maut 5 Menit</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Peluang Anda melakukan *closing* turun drastis hingga 80% jika Anda membalas *chat* lebih dari 5 menit.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Anda Bukan Robot</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Anda tidak bisa memantau HP 24 jam. Anda butuh waktu untuk *meeting*, serah terima unit, *test drive*, dan istirahat.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Kehilangan Komisi</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Setiap kali Anda telat merespons prospek yang serius, Anda baru saja membuang jutaan rupiah komisi ke dealer sebelah.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
