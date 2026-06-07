"use client";

import Link from "next/link";
import { ArrowRight, Moon, ListX, Calculator, Check, CheckCircle2, MessageSquareText, Zap, ShieldCheck, Mail } from "lucide-react";
import { siteConfig } from "@/config/site";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// --- COMPONENTS ---

const Navbar = () => (
  <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="text-white font-bold tracking-widest uppercase text-sm">
        {siteConfig.name}
      </div>
      <nav className="hidden md:flex items-center gap-10 text-xs font-medium text-zinc-500 tracking-wider uppercase">
        <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
        <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
      </nav>
      <div className="flex items-center gap-6">
        <Link href="/login" className="text-xs font-medium tracking-wider uppercase text-zinc-500 hover:text-white transition-colors">
          Log in
        </Link>
        <Link href="/register" className="px-5 py-2.5 bg-white text-black text-xs font-bold tracking-wider uppercase hover:bg-zinc-200 transition-colors">
          Start Free Trial
        </Link>
      </div>
    </div>
  </header>
);

const ChatAnimation = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1000); // Show User Msg
    const timer2 = setTimeout(() => setStep(2), 2500); // Show Typing
    const timer3 = setTimeout(() => setStep(3), 4500); // Show AI Msg
    const timer4 = setTimeout(() => setStep(0), 10000); // Loop

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [step]);

  return (
    <div className="w-full max-w-lg mx-auto border border-white/10 bg-black p-8 relative overflow-hidden h-[450px] flex flex-col justify-end">
      {/* Background Grid */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)'
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 w-full">
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="self-start max-w-[85%]"
            >
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/5 p-5 text-sm text-zinc-300 leading-relaxed">
                Halo, ada promo Brio RS bulan ini? Saya rencana DP 20 juta.
              </div>
              <div className="text-[10px] tracking-wider text-zinc-600 mt-2 ml-1 uppercase font-mono">Lead • 10:42 AM</div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="self-end flex items-center gap-2 p-4 border border-white/5 bg-zinc-900/50 backdrop-blur-sm"
            >
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mr-2">AI Analyzing Context</div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 bg-white/50 rounded-none"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="w-1.5 h-1.5 bg-white/50 rounded-none"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="w-1.5 h-1.5 bg-white/50 rounded-none"
              />
            </motion.div>
          )}

          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="self-end max-w-[90%]"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 text-sm text-white leading-relaxed">
                Selamat pagi Bapak! Tentu ada. Untuk Brio RS bulan Juni dengan DP 20 Juta, angsuran per bulannya sekitar Rp 4,5 Jutaan (Tenor 5 thn).
                <br/><br/>
                Saat ini kami ada promo free asuransi all-risk 1 tahun. Mau saya jadwalkan test drive akhir pekan ini?
              </div>
              <div className="text-[10px] tracking-wider text-zinc-500 mt-2 mr-1 uppercase font-mono text-right flex items-center justify-end gap-2">
                <Zap className="w-3 h-3 text-white/50" />
                AI Auto-Admin • 10:42 AM
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden">
      {/* Noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[100] opacity-[0.03] mix-blend-screen"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <Navbar />

      <main className="pt-24 pb-0 flex flex-col">
        {/* HERO SECTION */}
        <section className="relative px-6 max-w-7xl mx-auto w-full min-h-[90vh] flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24 pt-10 border-b border-white/5 pb-20">
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/10 bg-white/5 mb-8">
                <span className="w-2 h-2 bg-white animate-pulse" />
                <span className="text-[10px] tracking-widest uppercase font-mono text-zinc-400">Closingan Engine v2.0 Live</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-[1.05] text-white text-balance antialiased mb-8">
                Automate WhatsApp.<br />
                <span className="text-zinc-600">Secure Hot Leads.</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-400 font-light tracking-wide max-w-2xl mb-12 leading-relaxed">
                The premier AI auto-admin engineered exclusively for automotive sales professionals. Prevent high-intent leads from leaking while you sleep, pitch, or drive.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all duration-300 w-full sm:w-auto"
                >
                  <span>Deploy Agent</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 border border-white/20 text-white text-sm font-medium uppercase tracking-widest hover:bg-white/5 hover:border-white/40 transition-all duration-300 w-full sm:w-auto"
                >
                  View Architecture
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 w-full relative z-10 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full relative"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/5 blur-[120px] pointer-events-none" />
              <ChatAnimation />
            </motion.div>
          </div>
        </section>

        {/* BENTO GRID: PAIN POINTS */}
        <section className="px-6 py-40 max-w-7xl mx-auto w-full relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-20 relative z-10"
          >
            <h2 className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-500 mb-6">The Problem</h2>
            <h3 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 max-w-3xl leading-[1.1]">
              Stop losing deals to the fastest responder.
            </h3>
            <p className="text-zinc-400 text-xl max-w-2xl font-light">
              Modern buyers expect instant, accurate responses regardless of the hour. Human limitations are costing you commissions.
            </p>
          </motion.div>

          {/* Raw CSS Grid, No rounded corners, 1px thin borders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-white/10 border border-white/10 relative z-10">
            {/* Item 1 */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-black p-12 flex flex-col group hover:bg-zinc-950/50 transition-colors duration-500"
            >
              <div className="mb-10 w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-2xl font-bold mb-4 tracking-tight">After-Hours Attrition</h4>
              <p className="text-zinc-500 text-base leading-relaxed font-light">
                Prospects browse and inquire at 2 AM. Failing to engage instantly means they move to the next dealership in their search results.
              </p>
            </motion.div>

            {/* Item 2 */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-black p-12 flex flex-col group hover:bg-zinc-950/50 transition-colors duration-500"
            >
              <div className="mb-10 w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center">
                <ListX className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-2xl font-bold mb-4 tracking-tight">Follow-Up Paralysis</h4>
              <p className="text-zinc-500 text-base leading-relaxed font-light">
                Hundreds of unstructured chats drown out the high-intent buyers. Sorting the noise from the signal manually is computationally impossible for humans.
              </p>
            </motion.div>

            {/* Item 3 */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-black p-12 flex flex-col group hover:bg-zinc-950/50 transition-colors duration-500"
            >
              <div className="mb-10 w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-2xl font-bold mb-4 tracking-tight">Manual Calculation Fatigue</h4>
              <p className="text-zinc-500 text-base leading-relaxed font-light">
                Recalculating OTR prices, DP variations, and financing tenors for every inquiry consumes hours that should be spent closing.
              </p>
            </motion.div>
          </div>
        </section>

        {/* COMPREHENSIVE FEATURES */}
        <section id="features" className="px-6 py-40 w-full border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="mb-32 max-w-3xl"
            >
              <h2 className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-500 mb-6">Architecture</h2>
              <h3 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 leading-[1.1]">Elite Engineering for Elite Sales.</h3>
              <p className="text-zinc-400 text-xl font-light leading-relaxed">
                We discarded standard auto-replies. Closingan is built on a custom Retrieval-Augmented Generation (RAG) pipeline tuned specifically for automotive sales semantics.
              </p>
            </motion.div>

            <div className="space-y-40">
              {/* Feature 1: Knowledge Base */}
              <div className="flex flex-col lg:flex-row gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex-1 space-y-8"
                >
                  <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                     <span className="font-mono text-xs text-white">01</span>
                  </div>
                  <h4 className="text-3xl md:text-4xl font-bold tracking-tight">Knowledge Base RAG Vectorization</h4>
                  <p className="text-zinc-400 text-lg leading-relaxed font-light">
                    Upload your PDF brochures, latest OTR pricelists, and credit simulation sheets. Our engine vectorizes the documents, granting the AI instant recall of every dimension, spec, and pricing tier.
                  </p>
                  <div className="pt-6 grid grid-cols-1 gap-4">
                    {[
                      "Semantic understanding of vehicle specs",
                      "Real-time OTR & discount dynamic injection",
                      "Instant, accurate contextual responses"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-sm text-zinc-300 p-4 border border-white/5 bg-white/[0.02]">
                        <Check className="w-4 h-4 text-white" />
                        <span className="tracking-wide">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <div className="flex-1 w-full relative">
                  <div className="aspect-[4/3] bg-black border border-white/10 p-1 flex flex-col">
                    <div className="border-b border-white/10 p-3 bg-zinc-900/50 flex justify-between items-center">
                      <div className="flex gap-2">
                         <div className="w-2 h-2 bg-white/20" />
                         <div className="w-2 h-2 bg-white/20" />
                         <div className="w-2 h-2 bg-white/20" />
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Vector_DB_Sync</div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col gap-4 overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-zinc-700">INDEXING...</div>
                       <div className="w-3/4 h-8 border border-white/10 bg-white/5 flex items-center px-4">
                         <span className="text-xs font-mono text-zinc-400">Pricelist_Honda_Jabar_2024.pdf</span>
                       </div>
                       <div className="flex gap-2 items-center">
                         <div className="w-4 h-px bg-white/20" />
                         <span className="text-[10px] font-mono text-white/50">Extracting Tables...</span>
                       </div>
                       <div className="w-1/2 h-8 border border-white/10 bg-white/5 flex items-center px-4">
                         <span className="text-xs font-mono text-zinc-400">Brosur_CRV_Hybrid.pdf</span>
                       </div>
                       <div className="flex gap-2 items-center">
                         <div className="w-4 h-px bg-white/20" />
                         <span className="text-[10px] font-mono text-green-500/50">Vectorized 1,420 tokens</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: Guardrails */}
              <div className="flex flex-col lg:flex-row-reverse gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex-1 space-y-8"
                >
                  <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                     <span className="font-mono text-xs text-white">02</span>
                  </div>
                  <h4 className="text-3xl md:text-4xl font-bold tracking-tight">Strict Output Guardrails</h4>
                  <p className="text-zinc-400 text-lg leading-relaxed font-light">
                    The AI is bound by deterministic safety parameters. It cannot hallucinate unauthorized discounts. If a prospect demands abnormal terms or highly complex calculations, the system automatically pauses and escalates to human control.
                  </p>
                  <div className="pt-6 grid grid-cols-1 gap-4">
                    {[
                      "Zero hallucination on pricing & promises",
                      "Strict topical adherence (automotive only)",
                      "Algorithmic human hand-off protocols"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-sm text-zinc-300 p-4 border border-white/5 bg-white/[0.02]">
                        <ShieldCheck className="w-4 h-4 text-white" />
                        <span className="tracking-wide">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <div className="flex-1 w-full relative">
                  <div className="aspect-[4/3] bg-black border border-white/10 p-1 flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]" />
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 text-center border border-white/5 bg-black/80 backdrop-blur-sm">
                       <div className="border border-white/20 p-4 bg-white/5 mb-6 w-full max-w-sm text-left">
                          <p className="text-sm text-zinc-300 mb-2">User Input:</p>
                          <p className="text-white font-medium">&quot;Saya mau ambil 3 unit, bisa diskon 150 juta total?&quot;</p>
                       </div>

                       <div className="flex flex-col items-center justify-center w-full max-w-sm border border-red-500/30 bg-red-500/10 p-6">
                          <span className="text-xs font-mono text-red-500 mb-2">GUARDRAIL_TRIGGERED</span>
                          <span className="text-[10px] text-red-400/80 font-mono text-center">
                            Discount parameter exceeds authorized threshold (Max: 20M).<br/>
                            Executing forced escalation to Human Operator.
                          </span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3: Intent Radar */}
              <div className="flex flex-col lg:flex-row gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex-1 space-y-8"
                >
                  <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                     <span className="font-mono text-xs text-white">03</span>
                  </div>
                  <h4 className="text-3xl md:text-4xl font-bold tracking-tight">Semantic Intent Radar</h4>
                  <p className="text-zinc-400 text-lg leading-relaxed font-light">
                    Stop wasting time on low-intent inquiries. Our engine analyzes the semantic context of every message and tags leads based on their readiness to purchase. CRITICAL leads trigger immediate alerts.
                  </p>
                  <div className="pt-6 grid grid-cols-1 gap-4">
                    {[
                      "NLP-based buying intent classification",
                      "Priority sorting by lead temperature",
                      "Centralized omnichannel prospect dashboard"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-sm text-zinc-300 p-4 border border-white/5 bg-white/[0.02]">
                        <MessageSquareText className="w-4 h-4 text-white" />
                        <span className="tracking-wide">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <div className="flex-1 w-full relative">
                  <div className="aspect-[4/3] bg-black border border-white/10 flex flex-col">
                    <div className="p-4 border-b border-white/5 flex justify-between">
                       <span className="text-xs font-mono text-zinc-500 uppercase">Incoming_Queue</span>
                       <span className="text-xs font-mono text-white">4 Active</span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-3">
                       {[
                         { name: "+62 812-9988-****", time: "Just now", status: "CRITICAL", req: "Requesting Booking Fee AC", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
                         { name: "Bapak Hendra", time: "5m ago", status: "WARM", req: "Asking about tenor 5yr", color: "text-white", bg: "bg-white/5", border: "border-white/20" },
                         { name: "+62 856-1122-****", time: "12m ago", status: "COLD", req: "Just checking price", color: "text-zinc-500", bg: "bg-transparent", border: "border-white/5" }
                       ].map((lead, i) => (
                         <div key={i} className={`p-4 border ${lead.border} ${lead.bg} flex justify-between items-center`}>
                            <div>
                               <div className="font-medium text-sm text-white mb-1">{lead.name}</div>
                               <div className="text-[10px] text-zinc-500 font-mono">{lead.time} • {lead.req}</div>
                            </div>
                            <div className={`text-[10px] font-mono uppercase tracking-widest ${lead.color} border border-current px-2 py-1`}>
                               {lead.status}
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="px-6 py-40 max-w-7xl mx-auto w-full">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-500 mb-6">Investment</h2>
            <h3 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-[1.1]">Calculate the ROI.</h3>
            <p className="text-zinc-400 text-xl font-light mb-12">
              A fraction of a human assistant&apos;s salary. Zero downtime. Infinite patience.
            </p>

            <div className="inline-flex p-1 border border-white/10 bg-black">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-8 py-3 text-xs tracking-widest uppercase font-bold transition-all ${!isYearly ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-8 py-3 text-xs tracking-widest uppercase font-bold transition-all ${isYearly ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                Annually
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 mx-auto max-w-5xl">
            {/* Pro Tier */}
            <motion.div
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               className="bg-black p-12 lg:p-16 flex flex-col relative group hover:bg-zinc-950/50 transition-colors duration-500"
            >
              <h4 className="text-2xl font-bold mb-4 tracking-tight">Pro Agent</h4>
              <div className="text-zinc-500 text-sm mb-10 font-light">Engineered for individual top-performing sales consultants.</div>

              <div className="mb-12">
                <span className="text-5xl font-bold tracking-tighter text-white">
                  {isYearly ? 'Rp 399k' : 'Rp 499k'}
                </span>
                <span className="text-zinc-600 text-sm font-mono ml-2 uppercase">/ mo</span>
              </div>

              <ul className="space-y-6 mb-16 flex-1">
                 {[
                   "1 Connected WhatsApp Number",
                   "Unlimited PDF Knowledge Base",
                   "24/7 AI Auto-Response Engine",
                   "Intent Classification Dashboard",
                   "Standard Email Support"
                 ].map((f, i) => (
                    <li key={i} className="flex items-start gap-4 text-sm text-zinc-300 font-light">
                      <CheckCircle2 className="w-5 h-5 text-white/40 shrink-0" />
                      <span className="leading-snug">{f}</span>
                    </li>
                 ))}
              </ul>

              <Link href="/register" className="w-full py-5 border border-white/20 text-center text-xs tracking-widest uppercase font-bold hover:bg-white hover:text-black transition-colors duration-300">
                Deploy Pro Agent
              </Link>
            </motion.div>

            {/* Dealership Tier */}
            <motion.div
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="bg-black p-12 lg:p-16 flex flex-col relative group hover:bg-zinc-950/50 transition-colors duration-500"
            >
              <div className="absolute top-0 right-12 -translate-y-1/2 bg-white text-black px-4 py-1 text-[10px] font-bold tracking-widest uppercase">
                Enterprise
              </div>

              <h4 className="text-2xl font-bold mb-4 tracking-tight">Dealership</h4>
              <div className="text-zinc-500 text-sm mb-10 font-light">Full-scale deployment for official branches and sales teams.</div>

              <div className="mb-12">
                <span className="text-5xl font-bold tracking-tighter text-white">
                  {isYearly ? 'Rp 999k' : 'Rp 1.199k'}
                </span>
                <span className="text-zinc-600 text-sm font-mono ml-2 uppercase">/ mo</span>
              </div>

              <ul className="space-y-6 mb-16 flex-1">
                 {[
                   "Up to 5 WhatsApp Numbers",
                   "Custom Guardrail Configuration",
                   "Team Performance Analytics",
                   "Advanced CRM Integrations",
                   "Priority 24/7 Engineer Support",
                   "White-glove Onboarding & Setup"
                 ].map((f, i) => (
                    <li key={i} className="flex items-start gap-4 text-sm text-zinc-300 font-light">
                      <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                      <span className="leading-snug">{f}</span>
                    </li>
                 ))}
              </ul>

              <Link href="/register" className="w-full py-5 bg-white text-black text-center text-xs tracking-widest uppercase font-bold hover:bg-zinc-200 transition-colors duration-300">
                Contact Engineering
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black pt-32 pb-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-8 mb-24">
           {/* Brand & Newsletter */}
           <div className="md:col-span-5 space-y-8 pr-8">
              <div className="text-white font-bold tracking-widest uppercase text-lg">
                {siteConfig.name}
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed font-light max-w-sm">
                Automating automotive sales through deterministic AI and custom RAG pipelines. Built for the modern dealership.
              </p>

              <div className="pt-4 space-y-4">
                <div className="text-xs font-mono tracking-widest uppercase text-white/50">System Updates</div>
                <div className="flex border border-white/10 focus-within:border-white/40 transition-colors">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-transparent border-none outline-none text-sm text-white px-4 py-3 flex-1 placeholder:text-zinc-600"
                  />
                  <button className="px-4 border-l border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
           </div>

           {/* Links */}
           <div className="md:col-span-2 space-y-6">
              <h4 className="text-white font-mono tracking-widest uppercase text-xs">Platform</h4>
              <ul className="space-y-4">
                <li><Link href="#features" className="text-zinc-500 hover:text-white text-sm font-light transition-colors">Architecture</Link></li>
                <li><Link href="#pricing" className="text-zinc-500 hover:text-white text-sm font-light transition-colors">Pricing</Link></li>
                <li><Link href="/changelog" className="text-zinc-500 hover:text-white text-sm font-light transition-colors">Changelog</Link></li>
                <li><Link href="/docs" className="text-zinc-500 hover:text-white text-sm font-light transition-colors">Documentation</Link></li>
              </ul>
           </div>

           <div className="md:col-span-2 space-y-6">
              <h4 className="text-white font-mono tracking-widest uppercase text-xs">Company</h4>
              <ul className="space-y-4">
                <li><Link href="/about" className="text-zinc-500 hover:text-white text-sm font-light transition-colors">About</Link></li>
                <li><Link href="/blog" className="text-zinc-500 hover:text-white text-sm font-light transition-colors">Engineering Blog</Link></li>
                <li><Link href="/careers" className="text-zinc-500 hover:text-white text-sm font-light transition-colors">Careers</Link></li>
                <li><Link href="mailto:contact@closingan.com" className="text-zinc-500 hover:text-white text-sm font-light transition-colors">Contact</Link></li>
              </ul>
           </div>

           <div className="md:col-span-3 space-y-6">
              <h4 className="text-white font-mono tracking-widest uppercase text-xs">Legal</h4>
              <ul className="space-y-4">
                <li><Link href="/privacy" className="text-zinc-500 hover:text-white text-sm font-light transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-zinc-500 hover:text-white text-sm font-light transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="text-zinc-500 hover:text-white text-sm font-light transition-colors">Security</Link></li>
              </ul>
           </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-none animate-pulse" />
             <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">All Systems Operational</span>
           </div>

           <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
             © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
           </div>
        </div>
      </footer>
    </div>
  );
}
