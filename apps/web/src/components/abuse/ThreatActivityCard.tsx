import { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ShieldAlert, Fingerprint, Globe, Clock, Unlock } from "lucide-react";
import { PardonModal } from "./PardonModal";

export function ThreatActivityCard({
  client,
  onPardon,
}: {
  client: { id: string; ipAddress?: string; fingerprintHash?: string; reason?: string; blockedAt: string };
  onPardon: () => void;
}) {
  const [isPardonModalOpen, setIsPardonModalOpen] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        whileHover={{
          y: -5,
          boxShadow: "0 10px 30px -10px rgba(239,68,68,0.3)",
        }}
        className="relative overflow-hidden rounded-xl bg-gray-900/60 border border-red-500/30 p-6 backdrop-blur-xl transition-all duration-300 group"
      >
        {/* Glowing top accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />

        {/* Background glow effect on hover */}
        <div className="absolute -inset-24 bg-red-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/40">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-100 flex items-center gap-2">
                Active Threat
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsPardonModalOpen(true)}
            className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-full transition-colors group/btn"
            title="Pardon / Unblock"
          >
            <Unlock className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>

        <div className="space-y-3 relative z-10 text-sm">
          <div className="flex items-center gap-3 text-gray-300">
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="font-mono bg-black/40 px-2 py-0.5 rounded text-gray-200">
              {client.ipAddress || "Unknown IP"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-gray-300">
            <Fingerprint className="w-4 h-4 text-gray-500" />
            <span
              className="font-mono text-xs text-gray-400 truncate w-48"
              title={client.fingerprintHash}
            >
              {client.fingerprintHash}
            </span>
          </div>

          <div className="flex items-center gap-3 text-gray-300">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400">
              Blocked {formatDistanceToNow(new Date(client.blockedAt))} ago
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700/50 relative z-10">
          <p className="text-xs text-red-300/80 font-medium">Reason:</p>
          <p className="text-sm text-gray-300 mt-1">
            {client.reason || "Suspicious activity detected"}
          </p>
        </div>
      </motion.div>

      <PardonModal
        isOpen={isPardonModalOpen}
        onClose={() => setIsPardonModalOpen(false)}
        client={client}
        onSuccess={onPardon}
      />
    </>
  );
}
