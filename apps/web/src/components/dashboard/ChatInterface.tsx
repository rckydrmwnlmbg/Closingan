"use client";

import React from "react";

export const ChatInterface = () => {
  return (
    <div className="col-span-1 lg:col-span-6 bg-surface border border-slate-200 rounded-2xl flex flex-col overflow-hidden h-[500px] md:h-[600px] lg:h-full shadow-sm">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-3 md:p-4 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg border border-slate-200">
              BS
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-2">
              Budi Santoso
              <span className="bg-rose-100 text-rose-600 text-[10px] md:text-xs px-2 py-0.5 rounded-full font-semibold border border-rose-200 flex items-center gap-1">
                <i className="ph-fill ph-fire"></i> Hot Lead
              </span>
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <i className="ph-fill ph-whatsapp text-green-500"></i> +62 812-3456-7890
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <i className="ph ph-phone text-lg md:text-xl"></i>
          </button>
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <i className="ph ph-dots-three-vertical text-lg md:text-xl"></i>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50/50 relative">
        <div className="space-y-4 md:space-y-6">

          {/* Date Divider */}
          <div className="flex justify-center">
            <span className="bg-slate-100 text-slate-500 text-[10px] md:text-xs font-medium px-3 py-1 rounded-full border border-slate-200">
              Hari ini
            </span>
          </div>

          {/* Incoming Message */}
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm max-w-[90%] sm:max-w-[80%] shadow-sm p-3">
              <p className="text-sm text-slate-800 mb-1.5">Halo mas, saya lihat iklan Brio RS di Instagram. Boleh minta pricelist terbarunya?</p>
              <div className="text-[10px] text-slate-400">09:12</div>
            </div>
          </div>

          {/* Outgoing Message */}
          <div className="flex justify-end">
            <div className="bg-green-100/80 border border-green-200 rounded-2xl rounded-tr-sm max-w-[90%] sm:max-w-[80%] shadow-sm p-3">
              <p className="text-sm text-slate-800 mb-1.5">Halo Bapak Budi! Tentu pak, untuk Brio RS OTR Jakarta saat ini mulai dari Rp 243.100.000. Bapak berencana pembelian cash atau kredit?</p>
              <div className="text-[10px] text-slate-500 text-right flex items-center justify-end gap-1">
                09:13 <i className="ph ph-checks text-blue-500"></i>
              </div>
            </div>
          </div>

          {/* Incoming Message */}
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm max-w-[90%] sm:max-w-[80%] shadow-sm p-3">
              <p className="text-sm text-slate-800 mb-1.5">Rencana kredit mas. Promo bulan ini ada apa aja ya? Bisa kirim ke area Depok?</p>
              <div className="text-[10px] text-slate-400">09:14</div>
            </div>
          </div>

          {/* Incoming Message (Consecutive) */}
          <div className="flex justify-start mt-2">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm max-w-[90%] sm:max-w-[80%] shadow-sm p-3">
              <p className="text-sm text-slate-800 mb-1.5">Kalau untuk DP berapa kak?</p>
              <div className="text-[10px] text-slate-400 text-right">09:14</div>
            </div>
          </div>

          {/* AI Automated Message */}
          <div className="flex justify-end">
            <div className="bg-brand/10 border border-brand/20 rounded-2xl rounded-tr-sm max-w-[90%] sm:max-w-[80%] shadow-sm p-3 relative overflow-hidden">
               {/* AI Badge */}
               <div className="flex items-center gap-1.5 mb-2 bg-brand/10 w-fit px-2 py-0.5 rounded text-[10px] font-semibold text-brand border border-brand/10">
                <i className="ph-fill ph-robot"></i>
                AI Assistant
              </div>
              <p className="text-sm text-slate-800 mb-1.5">Untuk Brio RS CVT, DP mulai dari 15% atau sekitar 25 jutaan kak. Bisa juga disesuaikan dengan budget kakak ya. Mau saya bantu hitungkan simulasi kreditnya? 😊</p>
              <div className="text-[10px] text-slate-500 text-right flex items-center justify-end gap-1 mt-1">
                09:15 <i className="ph ph-checks text-blue-500"></i>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Chat Input Area */}
      <div className="bg-white border-t border-slate-200 flex-shrink-0 p-3">
        <div className="border border-slate-200 rounded-xl bg-slate-50 focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b border-slate-200 overflow-x-auto flex-shrink-0">
            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded flex-shrink-0"><i className="ph ph-smiley text-lg"></i></button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded flex-shrink-0"><i className="ph ph-paperclip text-lg"></i></button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded flex-shrink-0"><i className="ph ph-lightning text-lg"></i></button>
          </div>

          {/* Input Field */}
          <div className="flex items-end p-2 gap-2 flex-1">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm p-2 custom-scrollbar min-h-[40px] max-h-[120px]"
              placeholder="Ketik pesan..."
              rows={1}
            ></textarea>
            <div className="flex items-center flex-shrink-0 pb-1">
              <div className="flex bg-brand rounded-lg shadow-sm overflow-hidden">
                <button className="px-3 md:px-4 py-2 text-white text-sm font-medium hover:bg-brand_hover transition-colors flex items-center gap-2">
                  <span className="hidden sm:inline">Kirim</span>
                  <i className="ph ph-paper-plane-right sm:hidden"></i>
                </button>
                <div className="w-px bg-white/20"></div>
                <button className="px-2 py-2 text-white hover:bg-brand_hover transition-colors">
                  <i className="ph ph-caret-down"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center text-[10px] text-slate-400 hidden sm:block">
          Shift + Enter untuk baris baru, Enter untuk kirim
        </div>
      </div>
    </div>
  );
};
