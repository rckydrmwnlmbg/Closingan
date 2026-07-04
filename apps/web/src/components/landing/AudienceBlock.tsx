"use client";

import { motion } from "framer-motion";

export function AudienceBlock() {
  return (
    <section className="bg-[#050505] py-32 border-t border-indigo-500/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#050505] to-[#050505] z-0 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <span className="text-indigo-400 font-mono font-bold tracking-[0.2em] uppercase text-xs mb-6 block shadow-[0_0_10px_rgba(129,140,248,0.5)]">
            [ ENGINEERED_FOR_AUTOMOTIVE ]
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.1] drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Bukan CRM Biasa. <br />
            Ini Mesin Pencetak SPK.
          </h2>
          <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed">
            Software lain menyuruh Anda mengisi form yang rumit. 
            Closingan mengambil alih beban follow-up dari pundak Anda, 
            mengubah prospek dingin menjadi antrean test-drive.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
