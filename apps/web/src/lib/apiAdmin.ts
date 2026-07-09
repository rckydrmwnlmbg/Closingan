import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { API_URL } from './api';

export async function fetchAdminApi(endpoint: string, options: RequestInit = {}) {
  const token = useAdminAuthStore.getState().token;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'omit', // We don't need regular session cookies for this if using JWT
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || data.message || 'An error occurred');
  }

  return data;
}

export const adminFetcher = (url: string) => fetchAdminApi(url).then(res => res.data || res);
