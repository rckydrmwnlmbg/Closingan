import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col justify-center items-center">
      {/* Subtle fine-line grid background */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />

      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-tight text-white text-balance">
          Otomatisasi Penjualan Mobil 24/7.
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 font-light tracking-wide max-w-2xl mx-auto">
          AI asisten yang mengunci prospek saat Anda tidur.
        </p>

        <div className="pt-8">
          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black text-sm font-medium rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            <span>Mulai Coba Gratis</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
  );
}
