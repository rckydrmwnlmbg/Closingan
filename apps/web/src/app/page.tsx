import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white overflow-hidden flex flex-col justify-center items-center font-sans">
      {/* Subtle noise/grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-50 opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Subtle fine-line grid background */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />

      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto space-y-10">
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-[1.1] text-white text-balance antialiased">
          Automasi WhatsApp Enterprise.
        </h1>

        <p className="text-xl md:text-2xl text-zinc-400 font-light tracking-wide max-w-3xl mx-auto">
          Sistem RAG AI yang mengunci prospek 24/7.
        </p>

        <div className="pt-10">
          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-black text-base font-semibold rounded-none overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Mulai Coba Gratis</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
  );
}
