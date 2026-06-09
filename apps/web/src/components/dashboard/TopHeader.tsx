"use client";

import React from "react";

export const TopHeader = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button className="md:hidden text-slate-500 hover:text-slate-800 p-1" id="mobile-menu-toggle" onClick={() => {
            const sidebar = document.getElementById('sidebar');
            const backdrop = document.getElementById('mobile-menu-backdrop');
            if(sidebar && backdrop) {
                sidebar.classList.remove('-translate-x-full');
                backdrop.classList.remove('hidden');
                requestAnimationFrame(() => backdrop.classList.remove('opacity-0'));
                document.body.classList.add('overflow-hidden');
            }
        }}>
          <i className="ph ph-list text-2xl"></i>
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800">Honda Bintaro Team</h1>
          <p className="text-xs md:text-sm text-slate-500 hidden sm:block">Kelola interaksi dan prospek Anda hari ini</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search Input - Hidden on very small screens */}
        <div className="relative hidden sm:block">
          <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
          <input
            type="text"
            placeholder="Cari lead, pesan..."
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all w-48 md:w-64"
          />
        </div>

        {/* Search Icon for Mobile */}
        <button className="sm:hidden w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
          <i className="ph ph-magnifying-glass text-xl"></i>
        </button>

        {/* Global Action Button */}
        <button className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
          <i className="ph ph-plus"></i>
          <span>Lead Baru</span>
        </button>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
          <i className="ph ph-bell text-xl"></i>
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
};
