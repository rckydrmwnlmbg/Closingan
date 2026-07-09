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
import { ExitSurveyModal } from "@/components/shared/ExitSurveyModal";
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
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [churnStatus, setChurnStatus] = useState<{atRisk: boolean, signalType?: string, notes?: string} | null>(null);

  const [showExitSurvey, setShowExitSurvey] = useState(false);

  React.useEffect(() => {
    async function checkOnboarding() {
      try {
        const { fetchApi } = await import("@/lib/api");
        const res = await fetchApi("/v1/tenant/onboarding");
        if (res?.data && !res.data.isOnboarded) {
          window.location.href = "/onboarding";
        } else {
          setIsCheckingOnboarding(false);
        }
      } catch {
        setIsCheckingOnboarding(false);
      }
    }
    async function checkChurnStatus() {
      try {
        const { fetchApi } = await import("@/lib/api");
        const res = await fetchApi("/v1/admin/churn-signals/status");
        if (res?.data && res.data.atRisk) {
          setChurnStatus(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch churn status", err);
      }
    }
    async function checkExitSurvey() {
      try {
        const { fetchApi } = await import("@/lib/api");
        const res = await fetchApi("/v1/tenant/exit-survey/status");
        if (res?.data && res.data.eligible) {
          setShowExitSurvey(true);
        }
      } catch (err) {
        console.error("Failed to fetch exit survey status", err);
      }
    }
    checkOnboarding();
    checkChurnStatus();
    checkExitSurvey();
  }, []);

  if (isCheckingOnboarding) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Memuat...</div>;
  }

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
        {/* Intervention Banner */}
        <AnimatePresence>
          {churnStatus && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500/20 border-b border-amber-500/30 px-8 py-3 flex items-center justify-between z-50 shrink-0"
            >
              <div className="flex items-center gap-3">
                <Flame className="text-amber-500 animate-pulse" size={20} />
                <span className="text-amber-100 text-sm">
                  <strong>Butuh bantuan setup?</strong> Kami melihat ada penurunan aktivitas dan siap membantu Anda mendapatkan hasil maksimal.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => window.open('https://wa.me/628123456789', '_blank')}
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-semibold rounded-full text-xs hover:bg-amber-400 transition-colors"
                >
                  Hubungi Tim Ahli →
                </button>
                <button 
                  onClick={() => setChurnStatus(null)}
                  className="text-amber-500/60 hover:text-amber-500 p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

      {showExitSurvey && (
        <ExitSurveyModal onClose={() => setShowExitSurvey(false)} />
      )}
    </div>
  );
}
