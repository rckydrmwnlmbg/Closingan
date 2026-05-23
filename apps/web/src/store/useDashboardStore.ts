import { create } from 'zustand';

export interface DashboardSummary {
  hotLeadsToday: number;
  pendingReply: number;
  longestPendingMinutes: number;
  followUpToday: number;
  followUpOverdue: number;
  aiStatus: {
    isActive: boolean;
    mode: string;
  };
  waStatus: {
    state: string;
    phoneNumber: string | null;
  };
  criticalAlerts: Array<{
    type: string;
    message: string;
    conversationId: string;
  }>;
  quotaUsagePercent: number;
}

interface DashboardStore {
  summary: DashboardSummary | null;
  setSummary: (summary: DashboardSummary) => void;
  updateWaStatus: (state: string) => void;
  updateQuotaUsage: (percent: number) => void;
  addCriticalAlert: (alert: { type: string; message: string; conversationId: string }) => void;
  dismissAlert: (conversationId: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  summary: null,
  setSummary: (summary) => set({ summary }),
  updateWaStatus: (state) => set((store) => ({
    summary: store.summary ? { ...store.summary, waStatus: { ...store.summary.waStatus, state } } : null
  })),
  updateQuotaUsage: (percent) => set((store) => ({
    summary: store.summary ? { ...store.summary, quotaUsagePercent: percent } : null
  })),
  addCriticalAlert: (alert) => set((store) => {
    if (!store.summary) return store;
    const exists = store.summary.criticalAlerts.some(a => a.conversationId === alert.conversationId && a.type === alert.type);
    if (exists) return store;
    return {
      summary: {
        ...store.summary,
        criticalAlerts: [alert, ...store.summary.criticalAlerts]
      }
    };
  }),
  dismissAlert: (conversationId) => set((store) => {
    if (!store.summary) return store;
    return {
      summary: {
        ...store.summary,
        criticalAlerts: store.summary.criticalAlerts.filter(a => a.conversationId !== conversationId)
      }
    };
  })
}));
