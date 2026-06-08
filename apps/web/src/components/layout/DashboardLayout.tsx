"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Inbox,
  Database,
  Blocks,
  Menu,
  X,
  Clock,
  Flame,
  BarChart,
  MessageCircle,
  Users,
  Settings,
  CreditCard,
  Search,
  Bell,
} from "lucide-react";
import { siteConfig } from "@/config/site";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
  badge?: string;
}

const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isActive,
  isCollapsed,
  badge,
}: SidebarItemProps) => {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
          isActive
            ? "border-l-2 border-emerald-400 bg-white/5 text-emerald-400"
            : "border-l-2 border-transparent text-white/50 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-4">
          <Icon size={20} className="shrink-0" />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden font-sans"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {!isCollapsed && badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
            {badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Inbox, label: "Inbox", href: "/inbox", badge: "2" },
    { icon: Clock, label: "Follow-Up", href: "/follow-ups" },
    { icon: Flame, label: "Leads", href: "/leads" },
    { icon: Database, label: "Knowledge Base", href: "/dashboard/knowledge" },
    { icon: Blocks, label: "Campaign", href: "/campaigns" },
    { icon: BarChart, label: "Analytics", href: "/dashboard/analytics" },
    { icon: MessageCircle, label: "WhatsApp", href: "/dashboard/settings/whatsapp" },
    { icon: Users, label: "Team", href: "/team" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: CreditCard, label: "Billing", href: "/billing" },
  ];

  return (
    <div className={`flex h-screen ${siteConfig.theme.bgClass} text-white overflow-hidden selection:bg-emerald-500/30`}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? "72px" : "260px" }}
        className={`flex flex-col h-full border-r ${siteConfig.theme.borderClass} ${siteConfig.theme.bgClass} shrink-0 z-20`}
      >
        <div className={`flex items-center justify-between p-5 border-b ${siteConfig.theme.borderClass} h-[72px]`}>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="font-sans text-lg font-bold tracking-widest text-white flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
                  <span className="text-black text-xs font-black">C</span>
                </div>
                CLOSINGAN
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
              badge={item.badge}
            />
          ))}
        </nav>

        {/* WhatsApp Connection Widget */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`p-4 m-4 rounded-xl border ${siteConfig.theme.borderClass} bg-white/[0.02]`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">WhatsApp Active</span>
              </div>
              <p className="text-xs text-white/50 mb-3 leading-relaxed">
                628123456789 connected to Autopilot.
              </p>
              <Link href="/dashboard/settings/whatsapp">
                <button className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors border border-white/5">
                  Manage Device
                </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 h-full flex flex-col overflow-hidden ${siteConfig.theme.bgClass}`}>
        {/* Top Header */}
        <header className={`h-[72px] border-b ${siteConfig.theme.borderClass} flex items-center justify-between px-8 shrink-0 bg-slate-950/50 backdrop-blur-md`}>
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Selamat Siang, Budi! 👋</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                placeholder="Cari prospek..."
                className={`w-64 pl-9 pr-4 py-2 bg-white/5 border ${siteConfig.theme.borderClass} rounded-full text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all`}
              />
            </div>

            <div className="flex items-center gap-4 text-white/50">
              <div className="text-sm hidden sm:block">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 border-2 border-white/10 overflow-hidden cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://i.pravatar.cc/100?img=11" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
