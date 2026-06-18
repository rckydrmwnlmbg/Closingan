"use client";

import React from "react";

export const InsightsPanel = () => {
  return (
    <div className="col-span-1 lg:col-span-3 bg-surface border border-slate-200 rounded-2xl flex flex-col overflow-hidden min-h-[350px] md:min-h-[500px] lg:min-h-0 h-full shadow-sm">
      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 px-2 pt-2 flex-shrink-0 bg-white">
        <button className="flex-1 py-3 text-sm font-bold text-brand border-b-2 border-brand relative">
          Insight
          <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        </button>
        <button className="flex-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors border-b-2 border-transparent">Detail</button>
        <button className="flex-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors border-b-2 border-transparent">Riwayat</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar bg-slate-50 space-y-5">

        {/* TOP PRIORITY: Action Center */}
        {/* Next Best Action */}
        <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <i className="ph-fill ph-lightning text-amber-500"></i> Next Best Action
            </h3>
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white border border-amber-200 flex flex-shrink-0 items-center justify-center text-amber-500 shadow-sm">
                <i className="ph ph-calculator text-lg"></i>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">Kirim simulasi kredit DP 15% (25 Jt) untuk Honda Brio RS mempercepat keputusan.</p>
            </div>
            <button className="w-full bg-brand text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand_hover transition-all shadow-sm hover:shadow active:scale-[0.98] flex justify-center items-center gap-2">
              <i className="ph ph-magic-wand"></i> Buat Simulasi & Kirim
            </button>
          </div>
        </div>

        {/* AI Insight (Context for Action) */}
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
            <i className="ph-fill ph-robot text-purple-500"></i> Copilot Analysis
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Lead ini menunjukkan <span className="font-semibold text-rose-600">minat yang sangat tinggi</span>. Sudah menanyakan DP dan kemungkinan pembelian cash hari ini. Potensi closing dalam <span className="font-semibold text-slate-800">24 jam</span>.
          </p>
        </div>

        {/* Bento Box: Scores */}
        <div className="grid grid-cols-2 gap-3">
          {/* Heat Score */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full -mr-8 -mt-8"></div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Heat Score</div>
            <div className="flex items-end gap-2 relative z-10">
              <div className="text-3xl font-bold text-slate-900 tracking-tight">94</div>
              <div className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 mb-1">TINGGI</div>
            </div>
          </div>

          {/* Buying Intent */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8"></div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Buying Intent</div>
             <div className="flex items-end gap-2 relative z-10">
              <div className="text-xl font-bold text-slate-900 mt-1">Ready</div>
              <i className="ph-fill ph-check-circle text-emerald-500 mb-1 text-sm"></i>
            </div>
          </div>
        </div>

        {/* Stage Tracker */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <i className="ph-fill ph-flag-pennant text-slate-400"></i> Sales Stage
          </h3>

          <div className="relative px-2 pb-2">
            {/* Progress Line */}
            <div className="absolute top-2 left-4 right-4 h-0.5 bg-slate-100 z-0"></div>
            <div className="absolute top-2 left-4 w-[75%] h-0.5 bg-brand z-0"></div>

            <div className="flex justify-between relative z-10">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-brand border-2 border-white shadow-sm"></div>
                <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Aware</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-brand border-2 border-white shadow-sm"></div>
                <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Interest</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-brand border-2 border-brand/20 ring-4 ring-brand/10 shadow-sm flex items-center justify-center -mt-0.5">
                   <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-[10px] text-brand font-bold uppercase tracking-wider">Consider</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
                <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Intent</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
                <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Close</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Lead Accordion / Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center justify-between mb-3 cursor-pointer group">
            <span className="flex items-center gap-2">
               <i className="ph-fill ph-user-circle text-slate-400"></i> Lead Profile
            </span>
            <i className="ph ph-caret-down text-slate-400 group-hover:text-slate-600 transition-colors"></i>
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-slate-50/50">
              <span className="text-slate-500 text-xs">Nama</span>
              <span className="text-slate-900 font-semibold">Budi Santoso</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50/50">
              <span className="text-slate-500 text-xs">Sumber</span>
              <span className="flex items-center gap-1.5 text-slate-900 font-medium"><i className="ph-fill ph-whatsapp text-green-500"></i> WhatsApp</span>
            </div>
             <div className="flex justify-between items-center py-1 border-b border-slate-50/50">
              <span className="text-slate-500 text-xs">Produk</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">Brio RS</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 text-xs">Last Active</span>
              <span className="text-slate-700 font-medium text-xs">2 mnt lalu</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
