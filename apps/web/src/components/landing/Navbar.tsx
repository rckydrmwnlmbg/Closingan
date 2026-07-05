"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Fitur", href: "#fitur" },
  { label: "Demo", href: "#demo" },
  { label: "Harga", href: "#harga" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 rounded-2xl border transition-all duration-500 ${
          scrolled
            ? "border-white/10 bg-black/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            : "border-white/5 bg-black/30 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
        }`}
      >
        <div className="px-5 sm:px-6">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <span className="text-white font-bold text-lg leading-none">
                  C
                </span>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Closingan
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-[13px] font-medium text-slate-400 hover:text-white px-3.5 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors hidden sm:block px-3 py-1.5"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-[13px] hover:bg-emerald-500 transition-all active:scale-95"
              >
                Coba Gratis
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#111] border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-medium text-slate-300 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-white/5 my-2" />
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-3 rounded-xl text-center transition-all mt-1"
              >
                Coba Gratis 14 Hari
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
