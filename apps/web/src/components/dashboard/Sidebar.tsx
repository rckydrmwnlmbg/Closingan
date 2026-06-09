"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
        document.body.classList.remove('overflow-hidden');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const closeSidebar = () => {
    setIsOpen(false);
    document.body.classList.remove('overflow-hidden');
  };

  return (
    <>
      {/* Mobile Menu Button (Rendered outside for easier access or handled in TopHeader) */}

      {/* Sidebar Overlay (Mobile) */}
      <div
        className={`fixed inset-0 bg-slate-900/50 z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}
        id="mobile-menu-backdrop"
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-sidebar flex flex-col justify-between text-slate-300 transition-transform duration-300 ease-in-out flex-shrink-0 w-64 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        id="sidebar"
      >
        <div className="md:hidden flex justify-end p-4">
          <button
            className="text-slate-400 hover:text-white"
            id="mobile-menu-close"
            onClick={closeSidebar}
          >
            <i className="ph ph-x text-2xl"></i>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center flex-shrink-0">
              <i className="ph ph-hexagon text-white text-xl"></i>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Closingan</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <Link href="#" className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-brand text-white font-medium transition-all duration-300 ease-in-out hover:scale-[1.02]">
              <div className="flex items-center gap-3">
                <i className="ph ph-squares-four text-lg"></i>
                <span>Dashboard</span>
              </div>
            </Link>

            <Link href="#" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors duration-300 ease-in-out hover:scale-[1.02]">
              <div className="flex items-center gap-3">
                <i className="ph ph-tray text-lg"></i>
                <span>Inbox</span>
              </div>
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">12</span>
            </Link>

            <Link href="#" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors duration-300 ease-in-out hover:scale-[1.02]">
              <div className="flex items-center gap-3">
                <i className="ph ph-clock-counter-clockwise text-lg"></i>
                <span>Follow-Up</span>
              </div>
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">8</span>
            </Link>

            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors duration-300 ease-in-out hover:scale-[1.02]">
              <i className="ph ph-users text-lg"></i>
              <span>Leads</span>
            </Link>

            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors duration-300 ease-in-out hover:scale-[1.02]">
              <i className="ph ph-book-open-text text-lg"></i>
              <span>Knowledge Base</span>
            </Link>

            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors duration-300 ease-in-out hover:scale-[1.02]">
              <i className="ph ph-megaphone text-lg"></i>
              <span>Campaign</span>
            </Link>

            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors duration-300 ease-in-out hover:scale-[1.02]">
              <i className="ph ph-chart-bar text-lg"></i>
              <span>Analitik</span>
            </Link>

            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors duration-300 ease-in-out hover:scale-[1.02]">
              <i className="ph ph-plug text-lg"></i>
              <span>Integrasi</span>
            </Link>
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-600">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">Ricky Firmansyah</div>
              <div className="text-xs text-slate-400 truncate">Sales Supervisor</div>
            </div>
            <i className="ph ph-caret-up text-slate-500"></i>
          </div>
        </div>
      </aside>
    </>
  );
};
