"use client";

import { useState } from "react";
import useSWR from "swr";
import { ThreatActivityCard } from "@/components/abuse/ThreatActivityCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ManualBanModal } from "@/components/abuse/ManualBanModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AbuseDashboardPage() {
  const {
    data: clients,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/v1/abuse", fetcher);
  const [isManualBanOpen, setIsManualBanOpen] = useState(false);

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-w-[375px]">
        <DashboardHeader />
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 backdrop-blur-md bg-opacity-20">
          Failed to load abuse dashboard data.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-w-[375px] pb-24">
      <DashboardHeader />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-100">
          Command Center: Threat Activity
        </h1>
        <Button
          onClick={() => setIsManualBanOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-300"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Manual Ban
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-gray-800/50 animate-pulse border border-gray-700/50 backdrop-blur-sm"
            />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <AnimatePresence>
            {clients?.map((client: { id: string; ipAddress?: string; fingerprintHash?: string; reason?: string; blockedAt: string }) => (
              <ThreatActivityCard
                key={client.id}
                client={client}
                onPardon={() => mutate()}
              />
            ))}
            {clients?.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 bg-gray-900/40 rounded-xl border border-green-500/20 backdrop-blur-md">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <div className="w-8 h-8 rounded-full bg-green-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-medium text-green-400">
                  All Systems Secure
                </h3>
                <p className="text-gray-400 mt-2">
                  No active threats detected.
                </p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <ManualBanModal
        isOpen={isManualBanOpen}
        onClose={() => setIsManualBanOpen(false)}
        onSuccess={() => {
          setIsManualBanOpen(false);
          mutate();
        }}
      />
    </div>
  );
}
