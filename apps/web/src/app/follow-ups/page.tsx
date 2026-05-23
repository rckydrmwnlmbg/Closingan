"use client";

import { useEffect, useState, useMemo } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { fetcher, fetchApi } from "@/lib/api";
import Link from "next/link";

interface FollowUp {
  id: string;
  conversationId: string;
  customerName: string;
  reason: string;
  dueAt: string;
  status: "PENDING" | "DUE" | "OVERDUE" | "COMPLETED" | "SNOOZED";
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  snoozedUntil: string | null;
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"HARI_INI" | "OVERDUE" | "SEMUA">("HARI_INI");
  const [isSnoozeModalOpen, setIsSnoozeModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<string | null>(null);

  useEffect(() => {
    loadFollowUps();
  }, []);

  const loadFollowUps = async () => {
    try {
      setLoading(true);
      // Fetch all for now, we'll filter client side for simplicity
      // In a real scenario, we might use the status or cursor query
      const data = await fetcher("/v1/follow-ups?limit=50");
      setFollowUps(data);
    } catch (error) {
      console.error("Failed to load follow-ups", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await fetchApi(`/v1/follow-ups/${id}/complete`, { method: "PATCH" });
      setFollowUps(followUps.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Failed to complete follow-up", error);
    }
  };

  const openSnoozeModal = (id: string) => {
    setSelectedFollowUp(id);
    setIsSnoozeModalOpen(true);
  };

  const handleSnooze = async (durationHours: number) => {
    if (!selectedFollowUp) return;
    try {
      const snoozedUntil = new Date();
      snoozedUntil.setHours(snoozedUntil.getHours() + durationHours);

      await fetchApi(`/v1/follow-ups/${selectedFollowUp}/snooze`, {
        method: "PATCH",
        body: JSON.stringify({ snoozedUntil: snoozedUntil.toISOString() }),
      });
      setIsSnoozeModalOpen(false);
      setSelectedFollowUp(null);
      loadFollowUps();
    } catch (error) {
      console.error("Failed to snooze follow-up", error);
    }
  };

  const filteredFollowUps = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let filtered = followUps.filter((f) => f.status !== "COMPLETED");

    if (activeTab === "OVERDUE") {
      filtered = filtered.filter((f) => f.status === "OVERDUE");
    } else if (activeTab === "HARI_INI") {
      filtered = filtered.filter((f) => {
        if (f.status === "OVERDUE") return true;
        const due = new Date(f.dueAt);
        return due >= today && due < tomorrow;
      });
    }

    // Sort: OVERDUE first
    return filtered.sort((a, b) => {
      if (a.status === "OVERDUE" && b.status !== "OVERDUE") return -1;
      if (b.status === "OVERDUE" && a.status !== "OVERDUE") return 1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });
  }, [followUps, activeTab]);

  const overdueCount = followUps.filter((f) => f.status === "OVERDUE").length;

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative shadow-xl overflow-hidden text-gray-900 pb-16">
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-gray-200 shrink-0">
        <h1 className="text-xl font-bold">Follow-ups</h1>
      </header>

      {/* Filter Tabs */}
      <div className="flex bg-white px-4 py-2 border-b border-gray-200 shrink-0 space-x-2">
        {["HARI_INI", "OVERDUE", "SEMUA"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "HARI_INI" | "OVERDUE" | "SEMUA")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {tab === "HARI_INI"
              ? "Hari Ini"
              : tab === "OVERDUE"
              ? "Overdue"
              : "Semua"}
          </button>
        ))}
      </div>

      {/* List */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : filteredFollowUps.length === 0 ? (
          <div className="text-center py-10 text-gray-500 flex flex-col items-center">
            <span className="text-4xl mb-2">🎉</span>
            <p>Tidak ada follow-up {activeTab.toLowerCase()}.</p>
          </div>
        ) : (
          filteredFollowUps.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg p-4 shadow-sm border ${
                item.status === "OVERDUE"
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{item.customerName}</h3>
                  <p className="text-sm text-gray-600">{item.reason}</p>
                </div>
                {item.status === "OVERDUE" && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md">
                    OVERDUE
                  </span>
                )}
                {item.status !== "OVERDUE" && item.urgency === "HIGH" && (
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
                    HIGH
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-4">
                Due: {new Date(item.dueAt).toLocaleString("id-ID")}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleComplete(item.id)}
                  className="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-md hover:bg-green-700 transition"
                >
                  Selesai
                </button>
                <button
                  onClick={() => openSnoozeModal(item.id)}
                  className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded-md hover:bg-gray-200 transition"
                >
                  Snooze
                </button>
                <Link
                  href={`/inbox/${item.conversationId}`}
                  className="flex-1 bg-blue-50 text-blue-600 text-sm font-medium py-2 rounded-md hover:bg-blue-100 transition text-center"
                >
                  Buka Chat
                </Link>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Snooze Modal */}
      {isSnoozeModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
          <div className="bg-white w-full max-w-md rounded-t-xl sm:rounded-xl p-4 animate-in slide-in-from-bottom pb-safe">
            <h2 className="text-lg font-semibold mb-4 text-center">Snooze Follow-up</h2>
            <div className="space-y-2">
              <button
                onClick={() => handleSnooze(1)}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center font-medium border border-gray-200"
              >
                1 Jam
              </button>
              <button
                onClick={() => handleSnooze(24)}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center font-medium border border-gray-200"
              >
                Besok
              </button>
              <button
                onClick={() => setIsSnoozeModalOpen(false)}
                className="w-full py-3 text-gray-500 hover:text-gray-700 text-center font-medium mt-2"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <BottomNav overdueCount={overdueCount} />
    </div>
  );
}
