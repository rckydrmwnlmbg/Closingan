"use client";

import Link from "next/link";
import { Mail, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#020804] pt-20 pb-10 border-t border-white/5 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-emerald-900/10 rounded-[100%] blur-[120px] pointer-events-none" />
      <div className="absolute top-8 w-full overflow-hidden flex justify-center select-none pointer-events-none opacity-[0.08]">
        <h2 className="text-[12vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-500 to-transparent tracking-tighter leading-none">
          CLOSINGAN
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28">
        <div className="w-full rounded-2xl p-10 bg-white/[0.03] backdrop-blur-xl border border-white/5 mb-10 hover:border-emerald-500/15 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
            {/* Brand */}
            <div className="col-span-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <span className="text-emerald-400 font-bold text-sm leading-none">
                      C
                    </span>
                  </div>
                  <span className="font-bold text-lg tracking-tight text-white">
                    Closingan
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  AI assistant untuk sales mobil Indonesia. Biar AI yang jaga chat, Anda fokus closing.
                </p>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-medium text-sm mb-4">Produk</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#fitur"
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    Fitur
                  </a>
                </li>
                <li>
                  <a
                    href="#harga"
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    Harga
                  </a>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium flex items-center gap-1"
                  >
                    Coba Gratis{" "}
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium text-sm mb-4">
                Perusahaan
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Syarat &amp; Ketentuan
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Kebijakan Privasi
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-medium text-sm mb-4">Kontak</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:support@closingan.id"
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" /> support@closingan.id
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Closingan. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
              All systems normal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
