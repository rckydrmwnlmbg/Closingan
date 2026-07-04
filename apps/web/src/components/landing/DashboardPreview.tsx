"use client";

import { useState } from "react";
import { MessageSquare, Users, BarChart3, Settings, Bell, Search, Flame, Bot, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: number;
  sender?: string;
  text: string;
  time?: string;
  isAi?: boolean;
  type?: string;
  isSales?: boolean;
};

export function DashboardPreview() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "user",
      text: "Siang mas, saya lihat iklan HRV di Instagram. Boleh minta pricelistnya?",
      time: "13:42",
      isAi: false
    },
    {
      id: 2,
      type: "system",
      text: "AI MENGAMBIL KENDALI"
    },
    {
      id: 3,
      sender: "ai",
      text: "Selamat siang Bapak Budi! Tentu, saya adalah asisten AI dari dealer. Untuk Honda HR-V, apakah Bapak berencana tukar tambah mobil lama atau pembelian baru?",
      time: "13:43 • AI Generated",
      isAi: true
    },
    {
      id: 4,
      sender: "user",
      text: "Pembelian baru. Rencana DP 30jt, tenor 4 tahun. Kira-kira kena berapa per bulannya? Bisa test drive juga?",
      time: "13:45",
      isAi: false
    },
    {
      id: 5,
      type: "alert",
      text: "AI mendeteksi potensi SPK & Simulasi Kredit. Mode dialihkan ke HUMAN_ACTIVE."
    }
  ]);

  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "ai",
      text: inputValue,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " • Sales",
      isSales: true,
      isAi: false
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
  };

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">

      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center max-w-3xl mx-auto mb-20 relative z-10 px-4">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Sistem Pintar di Balik Layar
        </h2>
        <p className="text-lg text-slate-400 font-light">
          Dashboard intuitif yang dirancang khusus agar Sales bisa mengeksekusi *closing* lebih cepat tanpa hambatan teknis. Coba ketik pesan di bawah!
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="rounded-[2rem] bg-[#0A0A0A] border border-white/10 flex flex-col overflow-hidden shadow-[0_20px_100px_rgba(0,0,0,1)] ring-1 ring-white/5"
        >
          {/* Mac Header */}
          <div className="bg-[#111111] border-b border-white/5 px-4 py-3 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500" />
            </div>
            <div className="text-xs font-medium text-slate-500">app.closingan.id</div>
            <div className="w-16" /> {/* Spacer */}
          </div>

          <div className="flex h-[600px]">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col hidden md:flex">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-black text-lg">C</div>
                  <span className="font-bold text-white tracking-wide">Closingan</span>
                </div>
              </div>

              <div className="px-4 py-2 space-y-1 flex-1">
                <motion.div whileHover={{ x: 4 }} className="px-3 py-2 bg-white/5 text-white rounded-lg text-sm font-medium flex items-center justify-between border border-white/5 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-emerald-400" /> Inbox
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs">2</span>
                </motion.div>
                <motion.div whileHover={{ x: 4 }} className="px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium flex items-center gap-3 transition-all cursor-pointer">
                  <Users className="w-4 h-4" /> Prospek
                </motion.div>
                <motion.div whileHover={{ x: 4 }} className="px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium flex items-center gap-3 transition-all cursor-pointer">
                  <BarChart3 className="w-4 h-4" /> Analitik
                </motion.div>
                <motion.div whileHover={{ x: 4 }} className="px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium flex items-center gap-3 transition-all cursor-pointer">
                  <Settings className="w-4 h-4" /> Pengaturan
                </motion.div>
              </div>

              <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">WhatsApp Terhubung</span>
                </div>
              </div>
            </div>

            {/* Chat List */}
            <div className="w-80 border-r border-white/5 bg-[#0D0D0D] hidden lg:flex flex-col">
              <div className="p-4 border-b border-white/5">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Cari prospek..." className="w-full bg-black border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4 bg-white/5 border-l-2 border-emerald-500 cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white text-sm">Bapak Budi</span>
                    <span className="text-xs text-slate-500">13:45</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> HOT LEAD
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">Apakah bisa test drive besok sore?</p>
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 bg-[#111111] flex flex-col relative">
              {/* Chat Header */}
              <div className="h-[72px] px-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-white border border-white/10">
                    B
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2">Bapak Budi</h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Human Active
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors">
                    Resolusi
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto scroll-smooth flex flex-col">
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => {
                    if (msg.type === "system") {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.4 }}
                          className="flex items-center justify-center my-4"
                        >
                          <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            {msg.text}
                          </span>
                        </motion.div>
                      );
                    }
                    if (msg.type === "alert") {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: index * 0.4, type: "spring", stiffness: 100 }}
                          className="flex items-center justify-center my-6"
                        >
                          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse">
                            <Flame className="w-4 h-4 text-amber-500" />
                            <span className="text-xs text-amber-400 font-medium">
                              {msg.text}
                            </span>
                          </div>
                        </motion.div>
                      );
                    }

                    const isRight = msg.sender === "ai";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: msg.isSales ? 0 : index * 0.4 }}
                        className={`flex items-start gap-3 ${isRight ? 'flex-row-reverse' : ''}`}
                      >
                        {isRight ? (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isAi ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-200 shadow-sm border border-white/5'}`}>
                            {msg.isAi ? <Bot className="w-4 h-4 text-black" /> : <div className="text-xs font-bold text-black">S</div>}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm border border-white/5">B</div>
                        )}
                        <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
                          <div className={`${isRight ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl rounded-tr-sm hover:shadow-lg transition-shadow shadow-md' : 'bg-[#1A1A1A] border border-white/5 rounded-2xl rounded-tl-sm text-slate-300 hover:bg-[#222] transition-colors shadow-sm'} p-4 text-sm max-w-[80%]`}>
                            {msg.text}
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 block">{msg.time}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#0A0A0A] border-t border-white/5">
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ketik balasan Anda di sini (Cobalah mengirim pesan)..."
                    className="w-full bg-[#111111] border border-white/10 rounded-xl pl-4 pr-24 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                  <button type="submit" disabled={!inputValue.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Kirim
                  </button>
                </div>
                <div className="mt-2 text-[10px] text-slate-600 flex items-center gap-2">
                  <span>💡 Tip: Coba kirim pesan di atas untuk melihat bagaimana sistem merespons interaksi Anda.</span>
                </div>
              </form>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
