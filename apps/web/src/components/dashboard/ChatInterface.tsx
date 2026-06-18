"use client";

import React from "react";

export const ChatInterface = () => {
  return (
    <div className="col-span-1 lg:col-span-6 bg-surface border border-slate-200 rounded-2xl flex flex-col overflow-hidden h-[600px] md:h-[700px] lg:h-full shadow-sm">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-3 md:p-4 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg border border-slate-200">
              BS
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-2">
              Budi Santoso
              <span className="hidden sm:flex bg-rose-100 text-rose-600 text-[10px] md:text-xs px-2 py-0.5 rounded-full font-semibold border border-rose-200 items-center gap-1">
                <i className="ph-fill ph-fire"></i> Hot Lead
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <i className="ph-fill ph-whatsapp text-emerald-500"></i> +62 812-3456-7890
              </p>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                Intent: Ready
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-brand transition-colors">
            <i className="ph ph-phone text-lg md:text-xl"></i>
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <i className="ph ph-dots-three-vertical text-lg md:text-xl"></i>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50/50 relative">
        <div className="space-y-4 md:space-y-6">

          {/* Date Divider */}
          <div className="flex justify-center">
            <span className="bg-slate-100 text-slate-500 text-[10px] md:text-xs font-medium px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Hari ini
            </span>
          </div>

          {/* Incoming Message */}
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm max-w-[90%] sm:max-w-[80%] shadow-sm p-3">
              <p className="text-sm text-slate-800 mb-1.5 leading-relaxed">Halo mas, saya lihat iklan Brio RS di Instagram. Boleh minta pricelist terbarunya?</p>
              <div className="text-[10px] text-slate-400">09:12</div>
            </div>
          </div>

          {/* Outgoing Message */}
          <div className="flex justify-end">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tr-sm max-w-[90%] sm:max-w-[80%] shadow-sm p-3">
              <p className="text-sm text-slate-800 mb-1.5 leading-relaxed">Halo Bapak Budi! Tentu pak, untuk Brio RS OTR Jakarta saat ini mulai dari Rp 243.100.000. Bapak berencana pembelian cash atau kredit?</p>
              <div className="text-[10px] text-slate-500 text-right flex items-center justify-end gap-1">
                09:13 <i className="ph ph-checks text-brand"></i>
              </div>
            </div>
          </div>

          {/* Incoming Message */}
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm max-w-[90%] sm:max-w-[80%] shadow-sm p-3">
              <p className="text-sm text-slate-800 mb-1.5 leading-relaxed">Rencana kredit mas. Promo bulan ini ada apa aja ya? Bisa kirim ke area Depok?</p>
              <div className="text-[10px] text-slate-400">09:14</div>
            </div>
          </div>

          {/* Incoming Message (Consecutive) */}
          <div className="flex justify-start mt-2">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm max-w-[90%] sm:max-w-[80%] shadow-sm p-3">
              <p className="text-sm text-slate-800 mb-1.5 leading-relaxed">Kalau untuk DP berapa kak?</p>
              <div className="text-[10px] text-slate-400 text-right">09:14</div>
            </div>
          </div>

          {/* AI Automated Message */}
          <div className="flex justify-end">
            <div className="bg-brand/5 border border-brand/20 rounded-2xl rounded-tr-sm max-w-[90%] sm:max-w-[80%] shadow-sm p-3 relative overflow-hidden">
               {/* AI Badge */}
               <div className="flex items-center gap-1.5 mb-2 bg-white w-fit px-2 py-1 rounded-md text-[10px] font-bold text-brand border border-brand/20 shadow-sm">
                <i className="ph-fill ph-robot"></i>
                AI Copilot Replied
              </div>
              <p className="text-sm text-slate-800 mb-1.5 leading-relaxed">Untuk Brio RS CVT, DP mulai dari 15% atau sekitar 25 jutaan kak. Bisa juga disesuaikan dengan budget kakak ya. Mau saya bantu hitungkan simulasi kreditnya? 😊</p>
              <div className="text-[10px] text-slate-500 text-right flex items-center justify-end gap-1 mt-1">
                09:15 <i className="ph ph-checks text-brand"></i>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* NEW: AI Smart Replies / Quick Actions (Above Input) */}
      <div className="bg-slate-50 border-t border-slate-200 px-3 py-2 flex gap-2 overflow-x-auto custom-scrollbar flex-shrink-0">
         <div className="flex items-center justify-center pl-1 pr-2 border-r border-slate-200 mr-1 text-slate-400">
             <i className="ph-fill ph-sparkle"></i>
         </div>
         <button className="whitespace-nowrap bg-white border border-slate-200 hover:border-brand hover:text-brand text-slate-600 text-xs font-medium py-1.5 px-3 rounded-full shadow-sm transition-colors flex items-center gap-1.5">
            Boleh pak, DP 25 Jt
         </button>
         <button className="whitespace-nowrap bg-white border border-slate-200 hover:border-brand hover:text-brand text-slate-600 text-xs font-medium py-1.5 px-3 rounded-full shadow-sm transition-colors flex items-center gap-1.5">
            Kirim Brosur & Promo
         </button>
         <button className="whitespace-nowrap bg-white border border-slate-200 hover:border-brand hover:text-brand text-slate-600 text-xs font-medium py-1.5 px-3 rounded-full shadow-sm transition-colors flex items-center gap-1.5">
            Tanya Tenor
         </button>
      </div>

      {/* Chat Input Area */}
      <div className="bg-white border-t border-slate-200 flex-shrink-0 p-3 md:p-4">
        <div className="border border-slate-200 rounded-xl bg-slate-50/50 focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all flex flex-col shadow-sm">
          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b border-slate-200 overflow-x-auto flex-shrink-0">
            <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 rounded-lg flex-shrink-0 transition-colors"><i className="ph ph-smiley text-lg"></i></button>
            <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 rounded-lg flex-shrink-0 transition-colors"><i className="ph ph-paperclip text-lg"></i></button>
            <div className="w-px h-5 bg-slate-300 mx-1"></div>
            <button className="w-9 h-9 flex items-center justify-center text-brand hover:bg-brand/10 rounded-lg flex-shrink-0 transition-colors"><i className="ph-fill ph-magic-wand text-lg"></i></button>
          </div>

          {/* Input Field */}
          <div className="flex items-end p-2 md:p-3 gap-2 flex-1">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm p-1 custom-scrollbar min-h-[44px] max-h-[120px] leading-relaxed"
              placeholder="Ketik balasan Anda..."
              rows={1}
            ></textarea>
            <div className="flex items-center flex-shrink-0 pb-1">
              <div className="flex bg-brand rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all active:scale-[0.98]">
                <button className="px-4 md:px-5 py-2.5 text-white text-sm font-semibold hover:bg-brand_hover transition-colors flex items-center gap-2">
                  <span className="hidden sm:inline">Kirim</span>
                  <i className="ph-fill ph-paper-plane-tilt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center text-[10px] text-slate-400 hidden sm:block">
          <span className="font-semibold">Enter</span> untuk kirim, <span className="font-semibold">Shift + Enter</span> untuk baris baru
        </div>
      </div>
    </div>
  );
};
