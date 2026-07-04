"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { MessageSquare, BrainCircuit, Handshake } from "lucide-react";
import { useRef, MouseEvent } from "react";

const STORIES = [
  {
    icon: MessageSquare,
    title: "Prospek Menghubungi",
    description: "Saat Anda sibuk, prospek baru masuk. Engine kami langsung mendeteksi koneksi masuk dari WhatsApp.",
    color: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/30",
  },
  {
    icon: BrainCircuit,
    title: "Neural Engine Aktif",
    description: "AI memproses konteks, menghitung estimasi promo, dan merespons dalam milidetik layaknya sales profesional.",
    color: "from-indigo-500/20 to-purple-500/20",
    border: "border-indigo-500/30",
  },
  {
    icon: Handshake,
    title: "Handoff to Human",
    description: "Begitu prospek terindikasi Hot Lead (siap DP/Test Drive), sistem mengembalikan kendali penuh kepada Anda.",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
  },
];

// Interactive 3D Card Component
function Card3D({ story, index }: { story: typeof STORIES[0], index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full rounded-3xl bg-slate-900/50 backdrop-blur-md border ${story.border} p-8 flex flex-col gap-6 cursor-crosshair group overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${story.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      
      {/* 3D Floating Icon */}
      <div 
        className="w-16 h-16 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center shadow-2xl relative z-10"
        style={{ transform: "translateZ(50px)" }}
      >
        <story.icon className="w-8 h-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
      </div>

      <div style={{ transform: "translateZ(30px)" }} className="relative z-10">
        <div className="text-xs font-mono text-indigo-400 mb-2">PHASE_0{index + 1}</div>
        <h3 className="text-3xl font-bold tracking-tighter text-white mb-4">
          {story.title}
        </h3>
        <p className="text-slate-400 font-medium leading-relaxed">
          {story.description}
        </p>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [300, -300]);

  return (
    <section ref={containerRef} className="relative bg-[#050505] py-40 perspective-[1000px] overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 rounded-full text-indigo-300 font-mono text-xs mb-6 shadow-[0_0_20px_rgba(79,70,229,0.2)]"
          >
            SYSTEM_ARCHITECTURE
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Otomatisasi <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Tanpa Henti.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div style={{ y: y1 }} className="flex">
            <Card3D story={STORIES[0]} index={0} />
          </motion.div>
          <motion.div style={{ y: y2 }} className="flex">
            <Card3D story={STORIES[1]} index={1} />
          </motion.div>
          <motion.div style={{ y: y3 }} className="flex">
            <Card3D story={STORIES[2]} index={2} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
