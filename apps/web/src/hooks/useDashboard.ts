import useSWR from 'swr';
import { useEffect, useMemo } from 'react';
import { fetcher } from '@/lib/api';
import { useDashboardStore, DashboardSummary } from '@/store/useDashboardStore';
import { useSocket } from './useSocket';
import { debounce } from 'lodash';

export function useDashboard() {
  const { summary, setSummary, updateWaStatus, updateQuotaUsage, addCriticalAlert } = useDashboardStore();

  const { data, error, isLoading, mutate } = useSWR<DashboardSummary>(
    '/v1/dashboard/summary',
    fetcher,
    {
      // Polling removed in favor of WebSocket events to save bandwidth
    }
  );

  useEffect(() => {
    if (data) {
      setSummary(data);
    }
  }, [data, setSummary]);

  const socket = useSocket();

  // Debounce the SWR mutate call to prevent redundant API fetches on rapid WS chatter
  const debouncedMutate = useMemo(
    () => debounce(() => mutate(), 1000),
    [mutate]
  );

  useEffect(() => {
    if (!socket) return;

    const handleSystemAlert = (alert: { type?: string; message: string; conversationId?: string }) => {
      addCriticalAlert({ type: alert.type || 'SYSTEM_ALERT', message: alert.message, conversationId: alert.conversationId || 'system' });
      debouncedMutate();
    };

    const handleQuotaWarning = (data: { percent: number }) => {
      updateQuotaUsage(data.percent);
      debouncedMutate();
    };

    const handleWaStatusChanged = (data: { state: string }) => {
      updateWaStatus(data.state);
      debouncedMutate();
    };

    socket.on('system:alert', handleSystemAlert);
    socket.on('quota:warning', handleQuotaWarning);
    socket.on('wa:status_changed', handleWaStatusChanged);

    return () => {
      socket.off('system:alert', handleSystemAlert);
      socket.off('quota:warning', handleQuotaWarning);
      socket.off('wa:status_changed', handleWaStatusChanged);
      debouncedMutate.cancel();
    };
  }, [socket, updateWaStatus, updateQuotaUsage, addCriticalAlert, debouncedMutate]);

  return {
    summary: summary || data,
    error,
    isLoading: isLoading && !summary,
    mutate
  };
}
