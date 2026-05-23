import useSWR from 'swr';
import { useEffect } from 'react';
import { fetcher } from '@/lib/api';
import { useDashboardStore, DashboardSummary } from '@/store/useDashboardStore';
import { useSocket } from './useSocket';

export function useDashboard() {
  const { summary, setSummary, updateWaStatus, updateQuotaUsage, addCriticalAlert } = useDashboardStore();

  // Use SWR for polling every 30 seconds
  const { data, error, isLoading, mutate } = useSWR<DashboardSummary>(
    '/v1/dashboard/summary',
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds auto refresh
    }
  );

  useEffect(() => {
    if (data) {
      setSummary(data);
    }
  }, [data, setSummary]);

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleSystemAlert = (alert: { type?: string; message: string; conversationId?: string }) => {
      addCriticalAlert({ type: alert.type || 'SYSTEM_ALERT', message: alert.message, conversationId: alert.conversationId || 'system' });
      mutate();
    };

    const handleQuotaWarning = (data: { percent: number }) => {
      updateQuotaUsage(data.percent);
      mutate();
    };

    const handleWaStatusChanged = (data: { state: string }) => {
      updateWaStatus(data.state);
      mutate();
    };

    socket.on('system:alert', handleSystemAlert);
    socket.on('quota:warning', handleQuotaWarning);
    socket.on('wa:status_changed', handleWaStatusChanged);

    return () => {
      socket.off('system:alert', handleSystemAlert);
      socket.off('quota:warning', handleQuotaWarning);
      socket.off('wa:status_changed', handleWaStatusChanged);
    };
  }, [socket, updateWaStatus, updateQuotaUsage, addCriticalAlert, mutate]);

  return {
    summary: summary || data,
    error,
    isLoading: isLoading && !summary,
    mutate
  };
}
