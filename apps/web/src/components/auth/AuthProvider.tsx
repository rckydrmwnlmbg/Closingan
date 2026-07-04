'use client';

import { useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setToken = useAuthStore((state) => state.setToken);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (!token) {
          // Attempt silent refresh
          const res = await fetchApi('/v1/auth/silent-refresh', { method: 'POST' });
          if (mounted && res.success && res.data?.accessToken) {
            setToken(res.data.accessToken);
          }
        }
      } catch (error) {
        // Silently fail if refresh token is invalid or absent
        console.debug('Silent refresh failed or not authenticated:', error);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Optional: You can return a global loading spinner here if you want to wait for auth state before rendering children.
  // For now, we render children immediately to avoid blocking public pages.
  return <>{children}</>;
}
