"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Inbox,
  Database,
  Bot,
  Blocks,
  Menu,
  X,
} from "lucide-react";
import { siteConfig } from "@/config/site";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isActive,
  isCollapsed,
}: SidebarItemProps) => {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${
          isActive
            ? "border-l-2 border-white bg-white/5 text-white"
            : "text-white/50 hover:text-white"
        }`}
      >
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
      </motion.div>
    </Link>
  );
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Inbox, label: "Inbox (Hot Leads)", href: "/dashboard/inbox" },
    { icon: Database, label: "Knowledge Base", href: "/dashboard/knowledge" },
    { icon: Bot, label: "AI Settings", href: "/dashboard/settings" },
    { icon: Blocks, label: "Integrations", href: "/dashboard/integrations" },
  ];

  return (
    <div className={`flex h-screen ${siteConfig.theme.bgClass} text-white overflow-hidden selection:bg-white/20`}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? "64px" : "240px" }}
        className={`flex flex-col h-full border-r ${siteConfig.theme.borderClass} ${siteConfig.theme.bgClass} shrink-0 z-20`}
      >
        <div className={`flex items-center justify-between p-4 border-b ${siteConfig.theme.borderClass} h-[72px]`}>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="font-sans text-sm font-semibold tracking-[0.2em] uppercase text-zinc-300"
              >
                {siteConfig.name}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-white/50 hover:text-white transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* User profile section could go here */}
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 h-full overflow-y-auto overflow-x-hidden ${siteConfig.theme.bgClass}`}>
        {children}
      </main>
    </div>
  );
}
