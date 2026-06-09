"use client";

import React from "react";

export const InsightsPanel = () => {
  return (
    <div className="col-span-1 lg:col-span-3 bg-surface border border-slate-200 rounded-2xl flex flex-col overflow-hidden min-h-[350px] md:min-h-[500px] lg:min-h-0 h-full">
      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 px-2 pt-2 flex-shrink-0">
        <button className="flex-1 py-3 text-sm font-medium text-brand border-b-2 border-brand">Insight</button>
        <button className="flex-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 border-b-2 border-transparent">Detail</button>
        <button className="flex-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 border-b-2 border-transparent">Riwayat</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar space-y-6">

        {/* Heat Score */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
          <div className="text-sm font-medium text-slate-700 mb-3">Heat Score</div>
          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold text-slate-900">94</div>
            <div className="text-sm font-medium text-rose-500 mb-1">Sangat Tinggi</div>
          </div>

          {/* Mock Graph */}
          <div className="mt-4 h-12 w-full overflow-hidden">
            <svg className="w-full h-full text-rose-500 stroke-current" preserveAspectRatio="none" viewBox="0 0 100 30">
              <path className="animate-area" d="M0,25 L10,22 L20,24 L30,15 L40,18 L50,15 L60,10 L70,12 L80,5 L90,10 L100,2 L100,30 L0,30 Z" fill="url(#gradient)" opacity="0.2" stroke="none"></path>
              <path className="animate-sparkline" d="M0,25 L10,22 L20,24 L30,15 L40,18 L50,15 L60,10 L70,12 L80,5 L90,10 L100,2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor"></stop>
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Informasi Lead */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <i className="ph ph-info text-slate-400"></i> Informasi Lead
          </h3>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500">Nama</span>
              <span className="col-span-2 text-slate-900 font-medium truncate">Budi Santoso</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500">Sumber</span>
              <span className="col-span-2 text-slate-900 truncate">WhatsApp</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500">Sales</span>
              <span className="col-span-2 text-slate-900 truncate">Ricky Firmansyah</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500">First Contact</span>
              <span className="col-span-2 text-slate-900 truncate">20 Mei 2025 10:15</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500">Last Activity</span>
              <span className="col-span-2 text-slate-900 truncate">2 menit yang lalu</span>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* AI Insight */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <i className="ph-fill ph-robot text-purple-500"></i> AI Insight
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed bg-purple-50/50 p-3 rounded-xl border border-purple-100">
            Lead ini menunjukkan minat yang sangat tinggi. Sudah menanyakan DP dan kemungkinan pembelian cash hari ini.
          </p>
        </div>

        {/* Next Best Action */}
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <i className="ph-fill ph-warning-circle text-amber-500"></i> Next Best Action
          </h3>
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white border border-amber-200 flex flex-shrink-0 items-center justify-center text-amber-500">
              <i className="ph ph-file-text text-lg"></i>
            </div>
            <p className="text-sm text-slate-700">Kirim simulasi kredit sesuai budget customer untuk mempercepat keputusan.</p>
          </div>
          <button className="w-full bg-brand text-white py-2 rounded-lg text-sm font-medium hover:bg-brand_hover transition-colors">
            Buat Simulasi Kredit
          </button>
        </div>

        <hr className="border-slate-100" />

        {/* Stage Tracker */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <i className="ph ph-git-commit text-slate-400"></i> Stage
          </h3>

          <div className="relative px-2 pb-4">
            {/* Progress Line */}
            <div className="absolute top-2 left-4 right-4 h-0.5 bg-slate-200 z-0"></div>
            <div className="absolute top-2 left-4 w-[75%] h-0.5 bg-brand z-0"></div>

            <div className="flex justify-between relative z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-brand border-2 border-white ring-2 ring-brand"></div>
                <span className="text-[10px] text-slate-500 font-medium">Aware</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-brand border-2 border-white ring-2 ring-brand"></div>
                <span className="text-[10px] text-slate-500 font-medium">Interest</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-brand border-2 border-white ring-2 ring-brand"></div>
                <span className="text-[10px] text-brand font-bold">Consider</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-200 border-2 border-white ring-2 ring-transparent"></div>
                <span className="text-[10px] text-slate-400 font-medium">Intent</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-200 border-2 border-white ring-2 ring-transparent"></div>
                <span className="text-[10px] text-slate-400 font-medium">Close</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
