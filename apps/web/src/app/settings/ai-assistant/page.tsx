"use client";

import { useState } from "react";
import { Settings, MessageCircle, Bot, Sparkles, LayoutDashboard, Database, Check } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export default function AIAssistantSettingsPage() {
  const [isAIAssistantActive, setIsAIAssistantActive] = useState(true);

  return (
    <div className={`flex h-full text-white ${siteConfig.theme.bgClass}`}>
      {/* Inner Sidebar */}
      <div className={`w-64 border-r ${siteConfig.theme.borderClass} shrink-0 bg-slate-950 flex flex-col h-full`}>
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tight mb-6">Settings</h2>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              <Settings size={18} />
              Akun Saya
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              <MessageCircle size={18} />
              WhatsApp
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-emerald-400 bg-white/5 font-medium border border-emerald-500/20">
              <Bot size={18} />
              AI Assistant
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              <LayoutDashboard size={18} />
              Preferensi
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Side: Settings */}
        <ScrollArea className="flex-1 h-full">
          <div className="p-8 max-w-3xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">AI Assistant Settings</h1>
              <p className="text-white/50 text-sm">Konfigurasi bagaimana AI merespons prospek Anda.</p>
            </div>

            <div className="space-y-8">
              {/* Status Toggle */}
              <div className={`p-5 rounded-xl border ${siteConfig.theme.borderClass} bg-white/[0.02] flex items-center justify-between`}>
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-1">
                    <Sparkles size={18} className="text-emerald-400" />
                    Status AI Assistant
                  </h3>
                  <p className="text-xs text-white/50">Saat aktif, AI akan otomatis membalas pesan prospek yang masuk.</p>
                </div>
                <Switch
                  checked={isAIAssistantActive}
                  onCheckedChange={setIsAIAssistantActive}
                />
              </div>

              {/* Peran & Gaya AI */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Peran & Gaya AI</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/60 uppercase font-medium tracking-wider">Peran AI</label>
                    <Select defaultValue="sales-consultant">
                      <SelectTrigger className="bg-slate-900 border-white/10">
                        <SelectValue placeholder="Pilih Peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales-consultant">Sales Consultant</SelectItem>
                        <SelectItem value="customer-service">Customer Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/60 uppercase font-medium tracking-wider">Gaya Bahasa</label>
                    <Select defaultValue="friendly-professional">
                      <SelectTrigger className="bg-slate-900 border-white/10">
                        <SelectValue placeholder="Pilih Gaya Bahasa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly-professional">Ramah & Profesional</SelectItem>
                        <SelectItem value="formal">Formal & Tegas</SelectItem>
                        <SelectItem value="casual">Santai & Asik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium">Gunakan Emoji ✨</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium">Sapa dengan Nama</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">Bahas Harga di Awal</span>
                </div>
              </div>

              {/* Saran & Rekomendasi AI */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Saran & Rekomendasi AI</h3>
                <div className="space-y-2">
                  {[
                    { title: "Izinkan AI memberikan rekomendasi produk alternatif", active: true },
                    { title: "Izinkan AI memberikan diskon maksimal 5%", active: false },
                    { title: "Tanya jadwal test drive setelah 3 interaksi", active: true }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${siteConfig.theme.borderClass} bg-white/[0.02] flex items-center justify-between`}>
                      <span className="text-sm">{item.title}</span>
                      <Switch checked={item.active} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pengetahuan untuk AI */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Pengetahuan untuk AI</h3>
                  <Button variant="outline" size="sm" className="h-8 text-xs border-white/10 bg-white/5">
                    <Database size={14} className="mr-2" />
                    Kelola Knowledge Base
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: "Pricelist Mobil 2024", type: "PDF" },
                    { title: "Skema Kredit BCA Finance", type: "Teks" },
                    { title: "Promo Merdeka Agustus", type: "Teks" },
                    { title: "FAQ Servis Bengkel", type: "Link" },
                  ].map((kb, idx) => (
                    <Card key={idx} className="p-4 bg-slate-900 border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 font-medium">{kb.type}</span>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <Check size={10} />
                          DIGUNAKAN
                        </div>
                      </div>
                      <p className="text-sm font-medium">{kb.title}</p>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </ScrollArea>

        {/* Right Panel: Preview & Prompts */}
        <div className={`w-[400px] border-l ${siteConfig.theme.borderClass} bg-slate-950 flex flex-col h-full shrink-0 relative`}>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">

              {/* Preview */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-white/80">Preview AI Assistant</h3>
                <div className="bg-slate-900 border border-white/10 rounded-xl p-4 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-300"></div>

                  <div className="flex items-end justify-end">
                    <div className="bg-emerald-500 text-black px-4 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[85%] font-medium">
                      Halo kak, apakah unit CR-V Turbo masih ada?
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <Bot size={16} className="text-black" />
                    </div>
                    <div className="space-y-2">
                      <div className="bg-slate-800 text-white px-4 py-3 rounded-2xl rounded-tl-sm text-sm border border-white/5">
                        Halo Bapak/Ibu! 👋 Tentu, unit CR-V Turbo saat ini masih tersedia. Untuk pembelian bulan ini kita ada diskon khusus dan free asuransi lho. Boleh saya tahu untuk pembelian cash atau kredit?
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded text-white/60">Intent: Inkuiri Stok</span>
                        <span className="text-[10px] px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400">Confidence: 98%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Saran Prompt */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-white/80">Saran Prompt AI</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02] group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Prompt Sistem</span>
                      <button className="text-xs text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100">Edit</button>
                    </div>
                    <p className="text-xs text-white/60 line-clamp-3">Kamu adalah sales consultant senior Honda. Tugas utama kamu adalah membalas pertanyaan pelanggan, memberikan penawaran harga dari pricelist terlampir...</p>
                  </div>
                  <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02] group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Prompt Balasan (Fallback)</span>
                      <button className="text-xs text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100">Edit</button>
                    </div>
                    <p className="text-xs text-white/60 line-clamp-2">Mohon maaf, untuk pertanyaan teknis tersebut akan saya teruskan ke mekanik kami. Boleh ditunggu sebentar ya kak?</p>
                  </div>
                </div>
              </div>

            </div>
          </ScrollArea>

          {/* Sticky Save Button */}
          <div className="p-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-md absolute bottom-0 w-full">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-10 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/50">
              Simpan Perubahan
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
