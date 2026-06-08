"use client";

import { motion } from "framer-motion";
import {
  Users,
  Clock,
  Hand,
  Bot,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Send,
  MoreVertical,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import React, { useState } from 'react';
import { siteConfig } from "@/config/site";

// Reusable Bento Box Component
const BentoBox = ({
  children,
  className = "",
  delay = 0,
  noPadding = false
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  noPadding?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
    className={`border ${siteConfig.theme.borderClass} ${siteConfig.theme.bgClass} rounded-xl relative overflow-hidden group flex flex-col ${noPadding ? '' : 'p-5'} ${className}`}
  >
    {children}
  </motion.div>
);

// Minimalist Metric Card
const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  delay
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay: number;
}) => (
  <BentoBox delay={delay} className="min-h-[140px] justify-between">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-white/5 rounded-lg border border-white/5">
          <Icon size={16} className="text-white/70" />
        </div>
        <h3 className="text-white/50 text-xs font-medium tracking-wider">
          {title}
        </h3>
      </div>
    </div>
    <div className="mt-4 flex items-end justify-between">
      <span className="font-sans font-bold text-3xl text-white tracking-tight">
        {value}
      </span>
      {trendValue && (
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' :
          trend === 'down' ? 'text-red-400 bg-red-400/10' :
          'text-white/50 bg-white/5'
        }`}>
          {trend === 'up' && <ArrowUpRight size={14} />}
          {trend === 'down' && <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      )}
    </div>
  </BentoBox>
);

export default function DashboardPage() {
  const [chatMessage, setChatMessage] = useState("");

  const hotLeads = [
    { name: "Ahmad Rizki", product: "Honda HR-V SE", time: "2m ago", score: 98 },
    { name: "Budi Santoso", product: "Toyota Zenix", time: "15m ago", score: 95 },
    { name: "Citra Dewi", product: "Mitsubishi Xpander", time: "1h ago", score: 88 },
  ];

  const followUps = [
    { name: "Diana Putri", product: "Test Drive HR-V", time: "10:00 AM", status: "pending" },
    { name: "Eko Prasetyo", product: "Kirim Brosur CR-V", time: "13:30 PM", status: "pending" },
    { name: "Fajar Nugroho", product: "Follow Up Kredit", time: "16:00 PM", status: "pending" },
  ];

  const chatHistory = [
    { type: 'human', text: "Halo siang mas, saya mau tanya harga OTR HR-V SE putih berapa ya?", time: "10:30 AM" },
    { type: 'ai', text: "Halo Bapak/Ibu! Untuk Honda HR-V tipe SE warna Putih (Platinum White Pearl), harga OTR saat ini adalah Rp 424.600.000. Ada rencana pembelian secara cash atau kredit?", time: "10:31 AM" },
    { type: 'human', text: "Kredit mas. Kalau DP 100jt angsurannya berapa?", time: "10:35 AM" },
    { type: 'human_override', text: "Baik Pak. Untuk DP 100 Juta, angsuran HR-V SE selama 5 tahun (60x) sekitar Rp 7.500.000/bulan. Kebetulan bulan ini ada promo potongan tenor 1 bulan. Bapak ada waktu untuk test drive besok?", time: "10:37 AM" },
    { type: 'human', text: "Boleh, besok jam 10 pagi ya.", time: "10:45 AM" },
    { type: 'ai', text: "Siap Pak! Jadwal test drive Honda HR-V SE untuk besok jam 10 pagi sudah saya catat. Nanti saya siapkan unitnya. Ada pertanyaan lain sebelum besok kita bertemu?", time: "10:46 AM" }
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-24">
      {/* Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Lead Aktif" value="124" icon={Users} trend="up" trendValue="+12%" delay={0.1} />
        <MetricCard title="Jeda Autopilot (60s)" value="12" icon={Clock} trend="neutral" trendValue="Antri" delay={0.2} />
        <MetricCard title="Intervensi Manual" value="8" icon={Hand} trend="down" trendValue="-2%" delay={0.3} />
        <MetricCard title="Dibalas oleh AI" value="1,042" icon={Bot} trend="up" trendValue="+24%" delay={0.4} />
      </div>

      {/* Three-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[600px]">

        {/* Left Column: Leads & Follow-up (3 columns wide) */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full">
          {/* Hot Leads */}
          <BentoBox delay={0.5} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white">
                <Flame size={18} className="text-orange-500" />
                <h2 className="font-semibold text-sm">Lead Panas</h2>
              </div>
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">Lihat Semua</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-1">
              {hotLeads.map((lead, i) => (
                <div key={i} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm text-white group-hover:text-emerald-400 transition-colors">{lead.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">
                      <Flame size={10} /> {lead.score}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/50">
                    <span>{lead.product}</span>
                    <span>{lead.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </BentoBox>

          {/* Follow-Ups */}
          <BentoBox delay={0.6} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white">
                <Calendar size={18} className="text-emerald-400" />
                <h2 className="font-semibold text-sm">Follow-Up Hari Ini</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-1">
              {followUps.map((task, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <div className="mt-0.5">
                    <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center hover:border-emerald-400 hover:bg-emerald-400/10 transition-colors"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-white">{task.name}</h3>
                    <div className="text-xs text-white/50 mt-1">{task.product}</div>
                  </div>
                  <div className="text-xs font-medium text-white/40">{task.time}</div>
                </div>
              ))}
            </div>
          </BentoBox>
        </div>

        {/* Middle Column: Live Chat (6 columns wide) */}
        <BentoBox delay={0.7} noPadding className="lg:col-span-6 flex flex-col h-full bg-slate-950 border-white/10 shadow-2xl">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-lg font-bold">
                A
              </div>
              <div>
                <h2 className="font-semibold text-white">Ahmad Rizki</h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/50">+62 812-3456-7890</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1 text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                <Hand size={14} /> Ambil Alih
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 text-white/50 transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-90" style={{ backgroundColor: '#020617' }}>
            <div className="text-center my-4">
              <span className="text-[10px] font-medium text-white/30 bg-white/5 px-3 py-1 rounded-full uppercase tracking-wider">
                Hari ini
              </span>
            </div>

            {chatHistory.map((msg, i) => {
              const isOutbound = msg.type !== 'human';

              return (
                <div key={i} className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}>
                  {/* Indicator for AI or Manual override */}
                  {isOutbound && (
                    <div className="flex items-center gap-1.5 mb-1 mr-1">
                      {msg.type === 'ai' ? (
                        <>
                          <Bot size={12} className="text-emerald-400" />
                          <span className="text-[10px] font-medium text-emerald-400">AI Assistant</span>
                        </>
                      ) : (
                        <>
                          <Hand size={12} className="text-orange-400" />
                          <span className="text-[10px] font-medium text-orange-400">Manual Override</span>
                        </>
                      )}
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    !isOutbound
                      ? 'bg-slate-800 text-white rounded-tl-sm border border-white/5'
                      : msg.type === 'ai'
                        ? 'bg-emerald-900/40 border border-emerald-500/20 text-emerald-50 rounded-tr-sm'
                        : 'bg-orange-900/40 border border-orange-500/20 text-orange-50 rounded-tr-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-white/30">
                    {msg.time}
                    {isOutbound && <CheckCircle2 size={10} className={msg.type === 'ai' ? "text-emerald-500/50" : "text-orange-500/50"} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Autopilot Status Indicator */}
          <div className="px-4 py-2 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center justify-between">
             <div className="flex items-center gap-2 text-xs text-emerald-400">
                <Bot size={14} />
                <span className="font-medium">Autopilot Aktif</span>
             </div>
             <div className="text-[10px] text-emerald-400/70 font-mono flex items-center gap-1">
                Next response in: <span className="font-bold text-emerald-400">45s</span> (Redis Delay)
             </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-slate-950 border-t border-white/10">
            <div className="relative flex items-end gap-2">
              <textarea
                rows={1}
                placeholder="Ketik balasan manual (mengambil alih dari AI)..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all resize-none max-h-32 min-h-[44px]"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <button className="absolute right-2 bottom-2 p-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors flex items-center justify-center">
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
          </div>
        </BentoBox>

        {/* Right Column: Insights (3 columns wide) */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full">
          {/* Heat Score */}
          <BentoBox delay={0.8} className="flex flex-col items-center justify-center py-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />
            <h2 className="text-white/50 text-xs font-medium tracking-wider mb-2 uppercase">Heat Score</h2>
            <div className="text-5xl font-bold text-white flex items-center gap-2 tracking-tighter">
              98 <Flame size={32} className="text-orange-500" />
            </div>
            <div className="mt-2 text-xs font-medium text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-500/20">
              Sangat Tertarik
            </div>
          </BentoBox>

          {/* Lead Information */}
          <BentoBox delay={0.9} className="flex-1">
            <h2 className="font-semibold text-sm mb-4 text-white flex items-center gap-2">
              <Users size={16} className="text-white/50" />
              Informasi Lead
            </h2>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Produk Diminati</div>
                <div className="text-sm font-medium text-white bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                  Honda HR-V SE Putih
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Sumber</div>
                <div className="text-sm font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Facebook Ads
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Metode Pembayaran</div>
                <div className="text-sm font-medium text-white flex items-center gap-2">
                  Kredit (DP 100jt)
                </div>
              </div>
            </div>
          </BentoBox>

          {/* AI Insight & Next Action */}
          <BentoBox delay={1.0} className="bg-gradient-to-br from-slate-900 to-slate-950 border-emerald-500/20 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-300" />
            <h2 className="font-semibold text-sm mb-3 text-white flex items-center gap-2">
              <Bot size={16} className="text-emerald-400" />
              AI Insight
            </h2>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Prospek menunjukkan minat kuat pada skema kredit. Promo potongan tenor 1 bulan berhasil menarik perhatian.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingUp size={12} /> Next Best Action
              </div>
              <p className="text-xs text-white font-medium">
                Konfirmasi ulang jadwal test drive besok pagi (H-2 jam) dan siapkan simulasi kredit cetak.
              </p>
            </div>
          </BentoBox>
        </div>

      </div>
    </div>
  );
}
