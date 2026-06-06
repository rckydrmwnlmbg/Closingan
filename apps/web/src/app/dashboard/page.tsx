"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Flame,
  Clock,
  Coins,
  ArrowUpRight,
  QrCode,
  Menu,
  Inbox
} from "lucide-react";
import React from 'react';

// Reusable Bento Box Component
const BentoBox = ({
  children,
  className = "",
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
    whileHover={{ backgroundColor: "rgba(10, 10, 10, 1)" }}
    className={`border border-white/5 bg-[#000000] p-6 relative overflow-hidden group ${className}`}
  >
    {children}
  </motion.div>
);

// Minimalist Metric Card
const MetricCard = ({
  title,
  value,
  icon: Icon,
  delay
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  delay: number;
}) => (
  <BentoBox delay={delay} className="flex flex-col justify-between min-h-[140px]">
    <div className="flex justify-between items-start">
      <h3 className="text-white/50 text-xs font-medium tracking-[0.1em] uppercase font-mono">
        {title}
      </h3>
      <Icon size={16} className="text-white/30 group-hover:text-white/70 transition-colors" />
    </div>
    <div className="mt-4">
      <span className="font-serif text-4xl text-white tracking-tight" style={{ fontFamily: "'Libre Caslon Text', serif" }}>
        {value}
      </span>
    </div>

    {/* Abstract Background Decoration (Micro-chart hint) */}
    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
    <div className="absolute -bottom-1 -right-1 w-16 h-16 border-r border-b border-white/10 rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  </BentoBox>
);

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-10 lg:p-12 pb-24 max-w-screen-2xl mx-auto">

      {/* Top Bar Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-12 flex justify-between items-end border-b border-white/5 pb-6"
      >
        <div>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight" style={{ fontFamily: "'Libre Caslon Text', serif" }}>
            Command Center
          </h1>
          <p className="text-white/50 mt-2 font-mono text-sm tracking-wide">
            SYSTEM OVERVIEW // LIVE
          </p>
        </div>
      </motion.div>

      {/* Main Asymmetrical Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-[1px] bg-white/5 border border-white/5 p-[1px]">

        {/* WhatsApp Integration Panel (Large span) */}
        <BentoBox delay={0.1} className="md:col-span-4 lg:col-span-8 min-h-[300px] flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-white/50 text-xs font-medium tracking-[0.1em] uppercase font-mono mb-4">
                Connection Status
              </h2>
              <div className="font-serif text-3xl tracking-tight flex items-center gap-3">
                WhatsApp Bridge
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-20"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white/50"></span>
                </span>
              </div>
              <p className="text-white/40 mt-4 text-sm max-w-md leading-relaxed font-light">
                Secure link required. Scan the encrypted matrix to establish a persistent connection with the AI core.
              </p>
            </div>

            <button className="flex items-center gap-2 text-sm font-medium w-max border-b border-white/20 pb-1 hover:border-white transition-colors mt-8">
              Configure Pipeline <ArrowUpRight size={14} />
            </button>
          </div>

          {/* QR Placeholder Area */}
          <div className="w-full md:w-48 h-48 bg-[#0a0a0a] border border-white/5 flex items-center justify-center relative overflow-hidden group-hover:border-white/10 transition-colors shrink-0">
            <div className="absolute inset-0 backdrop-blur-md bg-black/40 z-10 flex items-center justify-center">
              <span className="text-white/30 text-xs tracking-widest uppercase font-mono">Awaiting Sync</span>
            </div>
            <QrCode size={64} className="text-white/10" />

            {/* Scanning line effect */}
            <motion.div
              animate={{ y: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-[1px] bg-white/20 z-0 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            />
          </div>
        </BentoBox>

        {/* AI Engine Status */}
        <BentoBox delay={0.2} className="md:col-span-2 lg:col-span-4 flex flex-col justify-between min-h-[300px]">
          <div>
            <h2 className="text-white/50 text-xs font-medium tracking-[0.1em] uppercase font-mono mb-4">
              AI Engine
            </h2>
            <div className="font-serif text-3xl tracking-tight">
              Standby Mode
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/40">Model</span>
              <span className="font-mono text-white/70">GPT-4o</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/40">Temperature</span>
              <span className="font-mono text-white/70">0.7</span>
            </div>
            <div className="h-[1px] w-full bg-white/5" />
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-white/40">System Status</span>
              <span className="text-white/70 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30" /> Idle
              </span>
            </div>
          </div>
        </BentoBox>

        {/* Metric Row */}
        <MetricCard title="Hot Leads" value="0" icon={Flame} delay={0.3} />
        <MetricCard title="Follow-ups" value="0" icon={Clock} delay={0.4} />
        <MetricCard title="Tokens Used" value="0" icon={Coins} delay={0.5} />
        <MetricCard title="Messages" value="0" icon={MessageSquare} delay={0.6} />

        {/* Activity Log / Table */}
        <BentoBox delay={0.7} className="md:col-span-4 lg:col-span-12 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <h2 className="font-serif text-xl tracking-tight">Recent Prospek</h2>
            <button className="text-white/30 hover:text-white transition-colors">
              <Menu size={20} />
            </button>
          </div>

          {/* Table Header Structure */}
          <div className="grid grid-cols-12 gap-4 text-white/30 text-xs tracking-widest uppercase font-mono mb-4 px-4">
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-4">Last Message</div>
            <div className="col-span-3 text-right">Time</div>
          </div>
          <div className="h-[1px] w-full bg-white/5 mb-8" />

          {/* Elegant Empty State */}
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition-opacity duration-500">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <div className="w-16 h-16 border border-white/10 flex items-center justify-center mb-6 mx-auto rotate-45">
                <div className="-rotate-45">
                  <Inbox size={24} className="text-white/40" />
                </div>
              </div>
              <h3 className="font-serif text-2xl tracking-tight mb-2 text-white/80">
                Belum ada prospek masuk
              </h3>
              <p className="text-white/40 text-sm font-light max-w-sm mx-auto">
                The matrix is quiet. Awaiting incoming connections from your marketing channels.
              </p>
            </motion.div>
          </div>
        </BentoBox>

      </div>
    </div>
  );
}
