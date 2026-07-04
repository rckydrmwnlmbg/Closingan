"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 rounded-full border transition-all duration-500 ${
        scrolled
          ? "border-white/10 bg-black/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "border-white/5 bg-black/20 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
      }`}
    >
      <div className="px-6 sm:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">
                C
              </span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Closingan
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="#solusi"
              className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
            >
              Solusi AI
            </a>
            <a
              href="#harga"
              className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
            >
              Harga
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95"
            >
              Coba Gratis
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
