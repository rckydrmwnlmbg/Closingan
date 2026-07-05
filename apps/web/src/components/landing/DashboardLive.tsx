"use client";

import { useState } from "react";
import {
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  Flame,
  Bot,
  ShieldCheck,
  Clock,
  TrendingUp,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MenuKey = "inbox" | "prospek" | "analitik" | "pengaturan";

type Message = {
  id: number;
  sender?: string;
  text: string;
  time?: string;
  isAi?: boolean;
  type?: string;
  isSales?: boolean;
};

type Contact = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  tag?: "hot" | "warm" | "cold";
  unread?: number;
};

type Prospect = {
  id: string;
  name: string;
  phone: string;
  car: string;
  status: "hot" | "warm" | "cold";
  lastActivity: string;
  source: string;
};

const contacts: Contact[] = [
  {
    id: "budi",
    name: "Pak Budi",
    lastMessage: "Bisa test drive besok sore?",
    time: "13:45",
    tag: "hot",
    unread: 1,
  },
  {
    id: "ratna",
    name: "Bu Ratna",
    lastMessage: "Avanza Veloz warna apa aja?",
    time: "12:30",
    tag: "warm",
  },
  {
    id: "hendra",
    name: "Pak Hendra",
    lastMessage: "OK pak, nanti saya pikir2 dulu",
    time: "11:15",
    tag: "cold",
  },
  {
    id: "dewi",
    name: "Bu Dewi",
    lastMessage: "DP 30jt bisa ga pak?",
    time: "10:00",
    tag: "hot",
    unread: 2,
  },
];

const chatData: Record<string, Message[]> = {
  budi: [
    {
      id: 1,
      sender: "user",
      text: "Siang mas, saya lihat iklan HRV di Instagram. Boleh minta info harganya?",
      time: "13:42",
      isAi: false,
    },
    { id: 2, type: "system", text: "AI membalas otomatis" },
    {
      id: 3,
      sender: "ai",
      text: "Selamat siang Pak Budi! HRV ready stok pak. Untuk tipe E CVT OTR Jakarta Rp 375jt. Boleh tau rencana pembeliannya cash atau kredit?",
      time: "13:42 · AI",
      isAi: true,
    },
    {
      id: 4,
      sender: "user",
      text: "Kredit, DP 50jt tenor 4 tahun. Bisa test drive besok sore?",
      time: "13:45",
      isAi: false,
    },
    {
      id: 5,
      type: "alert",
      text: "Prospek minta test drive — mode dialihkan ke HUMAN_ACTIVE",
    },
  ],
  ratna: [
    {
      id: 10,
      sender: "user",
      text: "Halo, Avanza Veloz warna apa aja ya yang ready?",
      time: "12:28",
      isAi: false,
    },
    { id: 11, type: "system", text: "AI membalas otomatis" },
    {
      id: 12,
      sender: "ai",
      text: "Halo Bu Ratna! Avanza Veloz ready 3 warna: Putih, Silver, dan Hitam. Ibu tertarik yang warna apa?",
      time: "12:28 · AI",
      isAi: true,
    },
    {
      id: 13,
      sender: "user",
      text: "Yang putih pak. Kalo kredit DP 40jt bisa?",
      time: "12:30",
      isAi: false,
    },
  ],
  hendra: [
    {
      id: 20,
      sender: "user",
      text: "Masih ada promo Brio bulan ini?",
      time: "11:10",
      isAi: false,
    },
    { id: 21, type: "system", text: "AI membalas otomatis" },
    {
      id: 22,
      sender: "ai",
      text: "Pagi Pak Hendra! Masih ada pak, Brio Satya E CVT bulan ini ada cashback Rp 5jt. Bapak tertarik untuk info lebih lanjut?",
      time: "11:10 · AI",
      isAi: true,
    },
    {
      id: 23,
      sender: "user",
      text: "OK pak, nanti saya pikir2 dulu ya",
      time: "11:15",
      isAi: false,
    },
  ],
  dewi: [
    {
      id: 30,
      sender: "user",
      text: "Pagi pak, Rush TRD Sportivo masih ada stok?",
      time: "09:50",
      isAi: false,
    },
    { id: 31, type: "system", text: "AI membalas otomatis" },
    {
      id: 32,
      sender: "ai",
      text: "Pagi Bu Dewi! Rush TRD Sportivo ready stok 2 unit: Putih dan Hitam. OTR Jakarta Rp 312jt. Mau info kredit juga bu?",
      time: "09:50 · AI",
      isAi: true,
    },
    {
      id: 33,
      sender: "user",
      text: "Iya tolong. DP 30jt bisa ga pak? Tenor 5 tahun",
      time: "10:00",
      isAi: false,
    },
    {
      id: 34,
      sender: "ai",
      text: "Bisa bu! DP 30jt tenor 5 tahun estimasi cicilan sekitar Rp 6,2jt/bulan. Mau saya bantu compare leasing-nya?",
      time: "10:00 · AI",
      isAi: true,
    },
  ],
};

const prospects: Prospect[] = [
  { id: "1", name: "Pak Budi", phone: "0812-xxxx-4567", car: "Honda HR-V E CVT", status: "hot", lastActivity: "13:45", source: "Instagram" },
  { id: "2", name: "Bu Dewi", phone: "0857-xxxx-8901", car: "Toyota Rush TRD", status: "hot", lastActivity: "10:00", source: "WhatsApp" },
  { id: "3", name: "Bu Ratna", phone: "0819-xxxx-2345", car: "Toyota Avanza Veloz", status: "warm", lastActivity: "12:30", source: "Facebook" },
  { id: "4", name: "Pak Hendra", phone: "0821-xxxx-6789", car: "Honda Brio Satya", status: "cold", lastActivity: "11:15", source: "Website" },
  { id: "5", name: "Pak Arif", phone: "0813-xxxx-1122", car: "Mitsubishi Xpander", status: "warm", lastActivity: "Kemarin", source: "Referral" },
  { id: "6", name: "Bu Sinta", phone: "0856-xxxx-3344", car: "Daihatsu Xenia", status: "cold", lastActivity: "2 hari lalu", source: "Website" },
];

const menuItems: { key: MenuKey; label: string; icon: React.ReactNode; badge?: string }[] = [
  { key: "inbox", label: "Inbox", icon: <MessageSquare className="w-4 h-4" />, badge: "3" },
  { key: "prospek", label: "Prospek", icon: <Users className="w-4 h-4" /> },
  { key: "analitik", label: "Analitik", icon: <BarChart3 className="w-4 h-4" /> },
  { key: "pengaturan", label: "Pengaturan", icon: <Settings className="w-4 h-4" /> },
];

export function DashboardLive() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("inbox");
  const [activeContact, setActiveContact] = useState("budi");
  const [messages, setMessages] = useState<Message[]>(chatData.budi);
  const [inputValue, setInputValue] = useState("");
  const [aiMode, setAiMode] = useState("smart_hybrid");
  const [autoGreeting, setAutoGreeting] = useState(true);

  const handleContactClick = (contactId: string) => {
    setActiveContact(contactId);
    setMessages(chatData[contactId] || []);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "ai",
      text: inputValue,
      time:
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }) + " · Anda",
      isSales: true,
      isAi: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
  };

  const statusColor = {
    hot: "bg-red-500/15 text-red-400 border-red-500/20",
    warm: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    cold: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  };

  const statusLabel = {
    hot: "Hot",
    warm: "Warm",
    cold: "Cold",
  };

  return (
    <section id="demo" className="py-20 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-900/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center max-w-2xl mx-auto mb-14 relative z-10 px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
          Lihat Dashboard-nya Langsung
        </h2>
        <p className="text-base text-slate-400">
          Klik menu di sidebar, pilih prospek, dan coba kirim pesan. Ini preview interaktif dari dashboard Closingan.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="rounded-2xl bg-[#0A0A0A] border border-white/10 flex flex-col overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.8)]"
        >
          {/* Browser Header */}
          <div className="bg-[#111] border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              app.closingan.id
            </div>
            <div className="w-16" />
          </div>

          <div className="flex h-[550px]">
            {/* Sidebar */}
            <div className="w-56 border-r border-white/5 bg-[#0a0a0a] flex-col hidden md:flex">
              <div className="p-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center font-bold text-black text-sm">
                    C
                  </div>
                  <span className="font-bold text-white text-sm tracking-wide">
                    Closingan
                  </span>
                </div>
              </div>

              <div className="px-3 py-1 space-y-0.5 flex-1">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveMenu(item.key)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition-all ${
                      activeMenu === item.key
                        ? "bg-white/5 text-white border border-white/5"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={
                          activeMenu === item.key
                            ? "text-emerald-400"
                            : ""
                        }
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </div>
                    {item.badge && (
                      <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-2.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/15 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-emerald-400 font-medium">
                    WhatsApp Terhubung
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                {activeMenu === "inbox" && (
                  <InboxView
                    key="inbox"
                    contacts={contacts}
                    activeContact={activeContact}
                    messages={messages}
                    inputValue={inputValue}
                    statusColor={statusColor}
                    onContactClick={handleContactClick}
                    onInputChange={setInputValue}
                    onSendMessage={handleSendMessage}
                  />
                )}
                {activeMenu === "prospek" && (
                  <ProspekView
                    key="prospek"
                    prospects={prospects}
                    statusColor={statusColor}
                    statusLabel={statusLabel}
                  />
                )}
                {activeMenu === "analitik" && (
                  <AnalitikView key="analitik" />
                )}
                {activeMenu === "pengaturan" && (
                  <PengaturanView
                    key="pengaturan"
                    aiMode={aiMode}
                    autoGreeting={autoGreeting}
                    onAiModeChange={setAiMode}
                    onAutoGreetingChange={setAutoGreeting}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────── INBOX VIEW ───────────── */
function InboxView({
  contacts,
  activeContact,
  messages,
  inputValue,
  statusColor,
  onContactClick,
  onInputChange,
  onSendMessage,
}: {
  contacts: Contact[];
  activeContact: string;
  messages: Message[];
  inputValue: string;
  statusColor: Record<string, string>;
  onContactClick: (id: string) => void;
  onInputChange: (val: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}) {
  const currentContact = contacts.find((c) => c.id === activeContact);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-1 h-full"
    >
      {/* Contact List */}
      <div className="w-72 border-r border-white/5 bg-[#0D0D0D] hidden lg:flex flex-col">
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari prospek..."
              className="w-full bg-black border border-white/10 rounded-lg pl-8 pr-3 py-2 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onContactClick(contact.id)}
              className={`w-full text-left p-3.5 border-b border-white/5 transition-all ${
                activeContact === contact.id
                  ? "bg-white/5 border-l-2 border-l-emerald-500"
                  : "hover:bg-white/[0.03] border-l-2 border-l-transparent"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white text-[13px]">
                  {contact.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  {contact.time}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                {contact.tag && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                      statusColor[contact.tag]
                    } flex items-center gap-1`}
                  >
                    {contact.tag === "hot" && (
                      <Flame className="w-2.5 h-2.5" />
                    )}
                    {contact.tag.toUpperCase()}
                  </span>
                )}
                {contact.unread && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-bold flex items-center justify-center">
                    {contact.unread}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {contact.lastMessage}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#111] flex flex-col">
        {/* Chat Header */}
        <div className="h-14 px-5 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-semibold text-white text-xs border border-white/10">
              {currentContact?.name.charAt(0) ?? "?"}
            </div>
            <div>
              <h3 className="font-medium text-white text-[13px]">
                {currentContact?.name ?? "Pilih prospek"}
              </h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Human Active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-slate-400 hover:text-white transition-colors p-1.5">
              <Bell className="w-3.5 h-3.5" />
            </button>
            <button className="px-2.5 py-1 rounded-md bg-emerald-500 text-black text-[11px] font-semibold hover:bg-emerald-400 transition-colors">
              Resolusi
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto flex flex-col">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              if (msg.type === "system") {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.15 }}
                    className="flex items-center justify-center my-2"
                  >
                    <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/15">
                      {msg.text}
                    </span>
                  </motion.div>
                );
              }
              if (msg.type === "alert") {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      delay: index * 0.15,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className="flex items-center justify-center my-3"
                  >
                    <div className="bg-amber-500/10 border border-amber-500/15 px-3.5 py-1.5 rounded-full flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[11px] text-amber-400 font-medium">
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: msg.isSales ? 0 : index * 0.15 }}
                  className={`flex items-start gap-2.5 ${
                    isRight ? "flex-row-reverse" : ""
                  }`}
                >
                  {isRight ? (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        msg.isAi
                          ? "bg-emerald-500"
                          : "bg-slate-200 border border-white/5"
                      }`}
                    >
                      {msg.isAi ? (
                        <Bot className="w-3.5 h-3.5 text-black" />
                      ) : (
                        <div className="text-[10px] font-bold text-black">
                          S
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/5">
                      {currentContact?.name.charAt(0) ?? "?"}
                    </div>
                  )}
                  <div
                    className={`flex flex-col ${
                      isRight ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`${
                        isRight
                          ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl rounded-tr-sm"
                          : "bg-[#1A1A1A] border border-white/5 rounded-2xl rounded-tl-sm text-slate-300"
                      } p-3 text-[13px] max-w-[85%] leading-relaxed`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">
                      {msg.time}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Chat Input */}
        <form
          onSubmit={onSendMessage}
          className="p-3 bg-[#0A0A0A] border-t border-white/5"
        >
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Ketik balasan Anda..."
              className="w-full bg-[#111] border border-white/10 rounded-lg pl-3.5 pr-20 py-2.5 text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/40 transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white text-black px-3 py-1 rounded-md text-[11px] font-semibold hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Kirim
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

/* ───────────── PROSPEK VIEW ───────────── */
function ProspekView({
  prospects,
  statusColor,
  statusLabel,
}: {
  prospects: Prospect[];
  statusColor: Record<string, string>;
  statusLabel: Record<string, string>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col bg-[#111] h-full"
    >
      {/* Header */}
      <div className="h-14 px-5 border-b border-white/5 flex items-center justify-between bg-black/20">
        <h3 className="font-medium text-white text-[13px] flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          Daftar Prospek
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">
            {prospects.length} prospek
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-[11px] text-slate-500 font-medium pb-3 pl-3">
                Nama
              </th>
              <th className="text-[11px] text-slate-500 font-medium pb-3 hidden sm:table-cell">
                Mobil Diminati
              </th>
              <th className="text-[11px] text-slate-500 font-medium pb-3">
                Status
              </th>
              <th className="text-[11px] text-slate-500 font-medium pb-3 hidden lg:table-cell">
                Sumber
              </th>
              <th className="text-[11px] text-slate-500 font-medium pb-3 text-right pr-3">
                Aktivitas
              </th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <td className="py-3 pl-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white border border-white/5">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[13px] text-white font-medium">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {p.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-[12px] text-slate-300 hidden sm:table-cell">
                  {p.car}
                </td>
                <td className="py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColor[p.status]}`}
                  >
                    {statusLabel[p.status]}
                  </span>
                </td>
                <td className="py-3 text-[12px] text-slate-400 hidden lg:table-cell">
                  {p.source}
                </td>
                <td className="py-3 text-[11px] text-slate-500 text-right pr-3">
                  {p.lastActivity}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ───────────── ANALITIK VIEW ───────────── */
function AnalitikView() {
  const stats = [
    {
      label: "Total Prospek",
      value: "127",
      change: "+12 minggu ini",
      icon: <Users className="w-4 h-4" />,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Rata-rata Respon",
      value: "0.3 detik",
      change: "AI auto-reply",
      icon: <Clock className="w-4 h-4" />,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
    {
      label: "Hot Leads",
      value: "23",
      change: "+5 dari kemarin",
      icon: <Flame className="w-4 h-4" />,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Conversion Rate",
      value: "18.2%",
      change: "+2.1% dari bulan lalu",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
    },
  ];

  const weeklyData = [
    { day: "Sen", leads: 18, responses: 18 },
    { day: "Sel", leads: 22, responses: 22 },
    { day: "Rab", leads: 15, responses: 15 },
    { day: "Kam", leads: 28, responses: 28 },
    { day: "Jum", leads: 32, responses: 32 },
    { day: "Sab", leads: 12, responses: 12 },
    { day: "Min", leads: 8, responses: 8 },
  ];

  const maxLeads = Math.max(...weeklyData.map((d) => d.leads));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col bg-[#111] h-full overflow-auto"
    >
      {/* Header */}
      <div className="h-14 px-5 border-b border-white/5 flex items-center bg-black/20">
        <h3 className="font-medium text-white text-[13px] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          Analitik Minggu Ini
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#0A0A0A] border border-white/5 rounded-xl p-3.5"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className={`w-7 h-7 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {stat.label}
                </span>
              </div>
              <div className="text-xl font-bold text-white mb-0.5">
                {stat.value}
              </div>
              <div className="text-[10px] text-slate-500">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4">
          <h4 className="text-[12px] font-medium text-slate-400 mb-4">
            Leads Masuk per Hari
          </h4>
          <div className="flex items-end gap-2 h-32">
            {weeklyData.map((day, i) => (
              <div
                key={day.day}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: `${(day.leads / maxLeads) * 100}%`,
                  }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-md min-h-[4px]"
                />
                <span className="text-[10px] text-slate-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4">
          <h4 className="text-[12px] font-medium text-slate-400 mb-3">
            Aktivitas Terakhir
          </h4>
          <div className="space-y-2.5">
            {[
              {
                icon: <Flame className="w-3 h-3 text-amber-400" />,
                text: "Pak Budi terdeteksi sebagai Hot Lead",
                time: "13:45",
              },
              {
                icon: <Bot className="w-3 h-3 text-emerald-400" />,
                text: "AI membalas 4 prospek baru",
                time: "12:30",
              },
              {
                icon: <UserCheck className="w-3 h-3 text-indigo-400" />,
                text: "Bu Dewi dijadwalkan follow-up",
                time: "10:15",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-[12px] text-slate-300 flex-1">
                  {item.text}
                </span>
                <span className="text-[10px] text-slate-500">
                  {item.time}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────── PENGATURAN VIEW ───────────── */
function PengaturanView({
  aiMode,
  autoGreeting,
  onAiModeChange,
  onAutoGreetingChange,
}: {
  aiMode: string;
  autoGreeting: boolean;
  onAiModeChange: (mode: string) => void;
  onAutoGreetingChange: (val: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col bg-[#111] h-full overflow-auto"
    >
      {/* Header */}
      <div className="h-14 px-5 border-b border-white/5 flex items-center bg-black/20">
        <h3 className="font-medium text-white text-[13px] flex items-center gap-2">
          <Settings className="w-4 h-4 text-emerald-400" />
          Pengaturan
        </h3>
      </div>

      <div className="p-4 space-y-4 max-w-2xl">
        {/* AI Mode */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4">
          <h4 className="text-[13px] font-medium text-white mb-1">
            Mode AI
          </h4>
          <p className="text-[11px] text-slate-500 mb-4">
            Tentukan sejauh mana AI membantu percakapan Anda.
          </p>
          <div className="space-y-2">
            {[
              {
                value: "auto_reply",
                label: "Auto Reply",
                desc: "AI balas semua pesan secara otomatis",
              },
              {
                value: "smart_hybrid",
                label: "Smart Hybrid",
                desc: "AI balas, tapi berhenti saat prospek siap closing",
              },
              {
                value: "ai_assist",
                label: "AI Assist",
                desc: "AI hanya menyarankan draft balasan, Anda yang kirim",
              },
              {
                value: "ai_off",
                label: "AI Off",
                desc: "Matikan AI sepenuhnya",
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onAiModeChange(option.value)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  aiMode === option.value
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                      aiMode === option.value
                        ? "border-emerald-500"
                        : "border-slate-600"
                    }`}
                  >
                    {aiMode === option.value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <div>
                    <span className="text-[13px] text-white font-medium">
                      {option.label}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      {option.desc}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Auto Greeting */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-[13px] font-medium text-white">
                Salam Pembuka Otomatis
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                AI menyapa prospek baru secara otomatis saat pertama kali
                chat.
              </p>
            </div>
            <button
              onClick={() => onAutoGreetingChange(!autoGreeting)}
              className="shrink-0"
            >
              {autoGreeting ? (
                <ToggleRight className="w-8 h-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>
          {autoGreeting && (
            <div className="bg-black/40 border border-white/5 rounded-lg p-3">
              <p className="text-[12px] text-slate-300 leading-relaxed">
                &quot;Halo! Terima kasih sudah menghubungi kami. Ada yang bisa
                saya bantu mengenai mobil impian Anda?&quot;
              </p>
            </div>
          )}
        </div>

        {/* Working Hours */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4">
          <h4 className="text-[13px] font-medium text-white mb-1">
            Jam Kerja
          </h4>
          <p className="text-[11px] text-slate-500 mb-3">
            Di luar jam kerja, AI tetap aktif. Saat jam kerja, Anda bisa ambil alih manual.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">
                Mulai
              </label>
              <div className="relative">
                <select className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white appearance-none focus:outline-none focus:border-emerald-500/40">
                  <option>08:00</option>
                  <option>09:00</option>
                  <option>10:00</option>
                </select>
                <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">
                Selesai
              </label>
              <div className="relative">
                <select className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white appearance-none focus:outline-none focus:border-emerald-500/40">
                  <option>17:00</option>
                  <option>18:00</option>
                  <option>20:00</option>
                </select>
                <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
