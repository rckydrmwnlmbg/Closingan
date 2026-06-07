"use client";

import Link from "next/link";
import { ArrowRight, Moon, ListX, Calculator, Check, CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Components
const Navbar = () => (
  <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="text-white font-bold tracking-widest uppercase text-sm">
        {siteConfig.name}
      </div>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
        <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
      </nav>
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          Login
        </Link>
        <Link href="/register" className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors">
          Coba Gratis
        </Link>
      </div>
    </div>
  </header>
);

import { AnimatePresence } from "framer-motion";

const ChatAnimation = () => {
  const [step, setStep] = useState(0);

  // Sequence looping logic
  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;

    const runSequence = () => {
      setStep(0);
      timer1 = setTimeout(() => setStep(1), 1000); // Show typing indicator
      timer2 = setTimeout(() => setStep(2), 3000); // Show reply
      timer3 = setTimeout(runSequence, 8000); // Loop back to start
    };

    runSequence();

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto border border-white/5 bg-slate-950 p-6 relative overflow-hidden h-[400px] flex flex-col justify-end">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />

      <div className="relative z-10 flex flex-col gap-4 w-full">
        <AnimatePresence>
          {step >= 0 && (
            <motion.div
              key="message-1"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5 }}
              className="self-start max-w-[80%]"
            >
              <div className="bg-zinc-900 border border-white/5 p-4 text-sm text-zinc-300 rounded-tr-2xl rounded-br-2xl rounded-tl-2xl">
                Ada promo Brio bulan ini?
              </div>
              <div className="text-[10px] text-zinc-600 mt-1 ml-1">Prospek • 10:42 AM</div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="self-end bg-emerald-500/20 border border-emerald-500/30 p-4 rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl flex items-center gap-1"
            >
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </motion.div>
          )}

          {step >= 2 && (
            <motion.div
              key="message-2"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5 }}
              className="self-end max-w-[85%]"
            >
              <div className="bg-emerald-500 border border-emerald-400 p-4 text-sm text-white rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl">
                Tentu Bapak! Untuk Brio bulan Juni ada DP ringan 15 Juta. Angsuran mulai 3 jutaan. Ini data statis yang sudah kami siapkan.
              </div>
              <div className="text-[10px] text-zinc-500 mt-1 text-right mr-1">AI Auto-Admin • 10:42 AM</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className={`relative min-h-screen bg-slate-950 text-white selection:bg-white selection:text-black font-sans`}>
      {/* Noise overlay */}
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <Navbar />

      <main className="pt-32 pb-24 flex flex-col">
        {/* HERO SECTION */}
        <section className="relative px-6 max-w-7xl mx-auto w-full min-h-[80vh] flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24 pt-10">
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-zinc-500 tracking-[0.2em] uppercase text-xs font-semibold mb-6">AI untuk Sales Mobil</h2>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-white text-balance antialiased mb-8">
                Otomasiin WhatsApp Kamu.<br />
                <span className="text-zinc-400">Kunci Prospek 24/7.</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 font-light tracking-wide max-w-2xl mb-12">
                AI Auto-Admin pertama yang dilatih khusus untuk Sales Mobil. Jangan biarkan hot leads lepas hanya karena Anda sedang tidur atau sibuk.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors w-full sm:w-auto"
                >
                  <span>Mulai Coba Gratis</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors w-full sm:w-auto"
                >
                  Lihat Cara Kerjanya
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 w-full relative z-10 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="w-full relative"
            >
              {/* Decorative subtle glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald-500/20 blur-[120px] pointer-events-none" />
              <ChatAnimation />
            </motion.div>
          </div>
        </section>

        {/* BENTO GRID: PAIN POINTS */}
        <section className="px-6 py-32 max-w-7xl mx-auto w-full border-t border-white/5 mt-20 relative">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`, backgroundSize: '60px 60px', maskImage: 'linear-gradient(to bottom, black, transparent)' }} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 relative z-10"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Pernah Ngerasa Gini?</h2>
            <p className="text-zinc-400 text-lg">Masalah klasik sales mobil yang bikin boncos.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 relative z-10 bg-white/5 border border-white/5">
            {[
              {
                icon: <Moon className="w-8 h-8 text-zinc-400" />,
                title: "Capek balas chat jam 2 pagi?",
                desc: "Prospek sering chat di luar jam kerja. Telat balas = pindah ke sales lain."
              },
              {
                icon: <ListX className="w-8 h-8 text-zinc-400" />,
                title: "Leads numpuk tapi lupa follow-up?",
                desc: "Terlalu banyak chat masuk sampai bingung mana yang prioritas untuk di-follow up."
              },
              {
                icon: <Calculator className="w-8 h-8 text-zinc-400" />,
                title: "Kirim Hitungan Tanpa Typo",
                desc: "Anda hitung manual sekali, masukkan ke sistem, dan AI akan mengirimkan format angka statis tersebut ke prospek tanpa risiko halusinasi atau salah harga."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -5 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-slate-950 p-10 flex flex-col items-center text-center group hover:bg-slate-900 border border-transparent hover:border-emerald-500/50 transition-all cursor-pointer"
              >
                <div className="mb-6 p-4 bg-zinc-900 border border-white/5 rounded-none group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* COMPREHENSIVE FEATURES */}
        <section id="features" className="px-6 py-32 w-full bg-slate-900 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="mb-24"
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">Senjata Rahasia Sales Elite.</h2>
              <p className="text-zinc-400 text-xl max-w-2xl">Bukan sekadar auto-reply biasa. Ini AI canggih yang paham konteks jualan mobil.</p>
            </motion.div>

            <div className="space-y-32">
              {/* Feature 1 */}
              <div className="flex flex-col md:flex-row gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex-1 space-y-6"
                >
                  <div className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Feature 01</div>
                  <h3 className="text-3xl font-bold tracking-tight">Knowledge Base RAG</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                    Upload PDF brosur, pricelist OTR terbaru, atau paket kredit. AI akan membaca, menghafal setiap detail spesifikasi, dan harga secara instan.
                  </p>
                  <ul className="space-y-4 pt-4">
                    {["Hafal spek mesin, dimensi, & fitur", "Update OTR & diskon real-time", "Jawab instan sesuai data Anda"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-white" /> {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <div className="flex-1 w-full bg-slate-950 border border-white/10 aspect-video p-8 relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                   {/* Mock UI */}
                   <div className="w-full h-full border border-white/5 flex flex-col">
                      <div className="border-b border-white/5 p-4 text-xs font-mono text-zinc-500 flex justify-between">
                        <span>DATA_SOURCES.PDF</span>
                        <span>STATUS: SYNCED</span>
                      </div>
                      <div className="p-6 space-y-4 flex-1">
                        <div className="h-2 w-3/4 bg-white/10 rounded-none" />
                        <div className="h-2 w-full bg-white/5 rounded-none" />
                        <div className="h-2 w-5/6 bg-white/5 rounded-none" />
                        <div className="h-2 w-1/2 bg-white/5 rounded-none" />
                      </div>
                   </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col md:flex-row-reverse gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex-1 space-y-6"
                >
                  <div className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Feature 02</div>
                  <h3 className="text-3xl font-bold tracking-tight">Anti-Abuse & Guardrails</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                    AI sangat disiplin. Ia dirancang dengan batasan ketat untuk tidak berhalusinasi. Jika prospek meminta diskon di luar wajar atau hitungan kredit yang rumit, AI akan mengoper ke Anda.
                  </p>
                  <ul className="space-y-4 pt-4">
                    {["Tidak halusinasi janji diskon", "Fokus hanya bahas mobil", "Auto-handover ke manusia jika ragu"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-white" /> {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <div className="flex-1 w-full bg-slate-950 border border-white/10 aspect-video p-8 relative overflow-hidden group">
                    <div className="w-full h-full border border-red-500/20 bg-red-500/5 flex items-center justify-center relative">
                        <div className="absolute top-4 left-4 text-red-500/50 text-xs font-mono">SYSTEM_GUARDRAIL_ACTIVE</div>
                        <div className="text-center">
                           <div className="text-white text-sm border border-white/10 p-3 bg-slate-950 inline-block mb-4">&quot;Bisa kasih diskon 100 juta gak?&quot;</div>
                           <div className="text-xs text-red-400 font-mono">ACTION BLOCKED. HANDING OVER TO HUMAN.</div>
                        </div>
                    </div>
                </div>
              </div>

               {/* Feature 3 */}
               <div className="flex flex-col md:flex-row gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex-1 space-y-6"
                >
                  <div className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Feature 03</div>
                  <h3 className="text-3xl font-bold tracking-tight">Hot Leads Radar</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                    Jangan buang waktu melayani &quot;tanya-tanya doang&quot;. Dashboard kami menganalisis intensi chat dan memberikan label CRITICAL untuk prospek yang siap booking fee hari ini.
                  </p>
                  <ul className="space-y-4 pt-4">
                    {["Analisis intensi beli via AI", "Notifikasi lead panas", "Dashboard sentralisasi prospek"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-white" /> {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <div className="flex-1 w-full bg-slate-950 border border-white/10 aspect-video p-6 relative overflow-hidden">
                    <div className="w-full h-full flex flex-col gap-3">
                       {[
                         { name: "Budi Santoso", status: "CRITICAL", color: "text-red-500", border: "border-red-500/30" },
                         { name: "Andi Wijaya", status: "WARM", color: "text-yellow-500", border: "border-white/10" },
                         { name: "Siti Rahma", status: "COLD", color: "text-zinc-500", border: "border-white/10" }
                       ].map((lead, i) => (
                         <div key={i} className={`flex items-center justify-between p-4 bg-zinc-900 border ${lead.border}`}>
                            <div className="font-medium text-sm">{lead.name}</div>
                            <div className={`text-xs font-bold tracking-wider ${lead.color}`}>{lead.status}</div>
                         </div>
                       ))}
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="px-6 py-32 max-w-5xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">Investasi Masuk Akal.</h2>
            <p className="text-zinc-400 text-lg mb-10">Lebih murah dari gaji admin, kerja 24/7 tanpa cuti.</p>

            <div className="inline-flex items-center p-1 bg-white/5 border border-white/10">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 text-sm font-medium transition-colors ${!isYearly ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 text-sm font-medium transition-colors ${isYearly ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Tahunan (Hemat 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Starter */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="border border-white/10 bg-slate-950/50 backdrop-blur-sm p-10 flex flex-col relative group hover:border-white/30 transition-colors"
            >
              <h3 className="text-xl font-bold mb-2">Pro Sales</h3>
              <div className="text-zinc-400 text-sm mb-6">Untuk individual sales yang ingin meroket.</div>
              <div className="text-4xl font-bold tracking-tighter mb-8">
                {isYearly ? 'Rp 399k' : 'Rp 499k'} <span className="text-lg font-normal text-zinc-500">/bln</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                 {["1 Nomor WhatsApp", "Unlimited Knowledge Base (PDF)", "AI Auto-Reply 24/7", "Hot Leads Dashboard", "Basic Support"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-zinc-500" /> {f}
                    </li>
                 ))}
              </ul>
              <Link href="/register" className="w-full py-4 border border-white/20 text-center text-sm font-bold hover:bg-white hover:text-black transition-colors">
                Pilih Pro
              </Link>
            </motion.div>

            {/* Dealership */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
               className="border border-white bg-white/5 backdrop-blur-sm p-10 flex flex-col relative"
            >
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 tracking-widest uppercase">
                Rekomendasi
              </div>
              <h3 className="text-xl font-bold mb-2">Dealership</h3>
              <div className="text-zinc-400 text-sm mb-6">Untuk tim sales atau dealer resmi.</div>
              <div className="text-4xl font-bold tracking-tighter mb-8">
                {isYearly ? 'Rp 999k' : 'Rp 1.199k'} <span className="text-lg font-normal text-zinc-500">/bln</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                 {["Hingga 5 Nomor WhatsApp", "Semua fitur Pro Sales", "Custom Guardrails Setup", "Team Analytics & Reporting", "Priority 24/7 Support", "Setup & Onboarding Dibantu"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-white" /> {f}
                    </li>
                 ))}
              </ul>
              <Link href="/register" className="w-full py-4 bg-emerald-500 text-white text-center text-sm font-bold hover:bg-emerald-600 transition-colors">
                Hubungi Sales
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-slate-950 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
           <div className="md:col-span-2 space-y-4">
              <div className="text-white font-bold tracking-widest uppercase text-sm">
                {siteConfig.name}
              </div>
              <p className="text-zinc-500 text-sm max-w-sm">
                {siteConfig.slogan}
              </p>
           </div>

           <div>
              <h4 className="text-white font-semibold text-sm mb-4">Produk</h4>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-zinc-500 hover:text-white text-sm transition-colors">Fitur</Link></li>
                <li><Link href="#pricing" className="text-zinc-500 hover:text-white text-sm transition-colors">Harga</Link></li>
              </ul>
           </div>

           <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal & Bantuan</h4>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-zinc-500 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-zinc-500 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
                <li><Link href="mailto:support@closingan.com" className="text-zinc-500 hover:text-white text-sm transition-colors">Kontak</Link></li>
              </ul>
           </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="text-zinc-600 text-xs">
             © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
           </div>
           <div className="text-zinc-600 text-xs flex gap-4">
             <span>Built for Sales Mobil</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
