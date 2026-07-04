"use client";

import Link from "next/link";
import { Mail, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#020804] pt-24 pb-12 border-t border-white/5 overflow-hidden">
      {/* Massive Background Glow & Typography */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-emerald-900/20 rounded-[100%] blur-[120px] pointer-events-none" />
      <div className="absolute top-10 w-full overflow-hidden flex justify-center select-none pointer-events-none opacity-20">
        <h2 className="text-[12vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-500 to-transparent tracking-tighter leading-none">
          CLOSINGAN
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32">
        
        {/* Minimalist Grid enclosed in a Glass Panel for premium feel */}
        <div className="w-full rounded-[3rem] p-12 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-12 hover:border-emerald-500/30 hover:shadow-[0_0_80px_rgba(16,185,129,0.1)] transition-all duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            
            {/* Brand */}
            <div className="col-span-1 md:col-span-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                    <span className="text-emerald-400 font-bold text-lg leading-none">C</span>
                  </div>
                  <span className="font-extrabold text-xl tracking-tight text-white">Closingan</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-light mb-6">
                  Senjata rahasia Top Achiever Sales Otomotif di Indonesia. Jangan biarkan leads Anda lepas.
                </p>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-medium text-sm mb-6">Produk</h4>
              <ul className="space-y-4">
                <li><a href="#solusi" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Solusi AI</a></li>
                <li><a href="#harga" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Harga & Paket</a></li>
                <li><Link href="/register" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium flex items-center gap-1">Coba Gratis <ArrowUpRight className="w-3 h-3" /></Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium text-sm mb-6">Perusahaan</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Blog Sales</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Kebijakan Privasi</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-medium text-sm mb-6">Kontak</h4>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:support@closingan.id" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <Mail className="w-4 h-4" /> support@closingan.id
                  </a>
                </li>
                <li className="text-sm text-slate-400 font-light leading-relaxed">
                  Gedung Cyber 2, Lt. 17<br/>
                  Jl. H. R. Rasuna Said<br/>
                  Jakarta Selatan 12950
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Closingan. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> All systems normal
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
