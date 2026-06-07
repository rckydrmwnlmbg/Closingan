"use client";

import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/HeroButton";
import { FloatingBubbles } from "@/components/ui/HeroAnimation";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import { Brain, Lock, Zap } from "lucide-react";
import Link from "next/link";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-emerald-500/30 overflow-hidden">
      <FloatingBubbles />

      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[#050505]/80 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-serif font-bold text-xl tracking-tighter">
            AUTOMASI<span className="text-emerald-500">.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Login
            </Link>
            <Button size="sm" variant="primary">
              Mulai Coba Gratis
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div variants={item} className="inline-flex items-center px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium tracking-wide uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            AI Sales OS 2.0 Live
          </motion.div>

          <motion.h1
            variants={item}
            className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-white mb-6 leading-[1.1]"
          >
            Automasi WhatsApp <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Enterprise.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Sistem RAG (Retrieval-Augmented Generation) AI tingkat lanjut yang mengunci prospek 24/7 dengan konteks bisnis yang akurat dan personal.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="primary" className="w-full sm:w-auto">
              Mulai Coba Gratis
            </Button>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Lihat Demo
            </Button>
          </motion.div>

          <motion.div variants={item} className="mt-8 text-xs text-zinc-500 font-mono">
            *AI hanya menyajikan data statis. Perhitungan finansial dilakukan manual.
          </motion.div>
        </motion.div>

        {/* Features Bento */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-32"
        >
          <BentoGrid>
            <BentoCard
              title="Intelijen RAG"
              description="Sistem membaca basis pengetahuan Anda secara real-time untuk memberikan jawaban yang 100% akurat tanpa halusinasi."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5" />}
              icon={<Brain className="h-5 w-5 text-emerald-500" />}
              className="md:col-span-2"
            />
            <BentoCard
              title="Keamanan Tingkat Lanjut"
              description="Enkripsi end-to-end dan isolasi data per tenant menjamin kerahasiaan prospek Anda."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5" />}
              icon={<Lock className="h-5 w-5 text-emerald-500" />}
              className="md:col-span-1"
            />
            <BentoCard
              title="Latensi Minimal"
              description="Dibangun di atas arsitektur edge untuk merespon dalam hitungan milidetik."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5" />}
              icon={<Zap className="h-5 w-5 text-emerald-500" />}
              className="md:col-span-3"
            />
          </BentoGrid>
        </motion.div>
      </main>
    </div>
  );
}
