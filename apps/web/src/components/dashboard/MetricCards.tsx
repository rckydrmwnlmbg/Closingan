"use client";

import React from "react";

export const MetricCards = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-5 md:mb-6">
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand/30 transition-all cursor-pointer relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-brand/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
        <div className="flex items-center justify-between mb-3 md:mb-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <i className="ph-fill ph-tray text-xl md:text-2xl"></i>
          </div>
          <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
            <i className="ph ph-trend-up mr-1"></i> +12%
          </span>
        </div>
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Inbox Aktif</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">42</h3>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
            <i className="ph ph-arrow-right"></i>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 md:p-5 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
        <div className="flex items-center justify-between mb-3 md:mb-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <i className="ph-fill ph-clock-counter-clockwise text-xl md:text-2xl"></i>
          </div>
          <span className="flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
            <i className="ph-fill ph-warning-circle mr-1"></i> 5 Urgent
          </span>
        </div>
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Perlu Follow-Up</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">18</h3>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-100 transition-colors">
            <i className="ph ph-arrow-right"></i>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 md:p-5 rounded-2xl border border-rose-200 shadow-sm hover:shadow-md hover:border-rose-400 transition-all cursor-pointer relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
        <div className="flex items-center justify-between mb-3 md:mb-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <i className="ph-fill ph-fire text-xl md:text-2xl"></i>
          </div>
          <span className="flex items-center text-xs font-bold text-rose-600 animate-pulse bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
            <i className="ph-fill ph-circle text-[8px] mr-1.5"></i> Action Needed
          </span>
        </div>
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-rose-600 mb-1">Hot Leads</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">7</h3>
          </div>
          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-100 transition-colors">
            <i className="ph ph-arrow-right"></i>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-5 rounded-2xl border border-slate-700 shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
        <div className="flex items-center justify-between mb-3 md:mb-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center border border-white/10">
            <i className="ph-fill ph-check-circle text-xl md:text-2xl"></i>
          </div>
          <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
            Bulan Ini
          </span>
        </div>
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">Total Closing</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl md:text-3xl font-bold text-white">24</h3>
              <span className="text-sm text-slate-400">Unit</span>
            </div>
          </div>
           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-300 group-hover:bg-white/10 group-hover:text-white transition-colors">
            <i className="ph ph-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>
  );
};
