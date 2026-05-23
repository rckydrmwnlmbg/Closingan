export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // We use standard NEXT_PUBLIC_API_URL based fetching.
  // Wait, the memory states: localStorage / sessionStorage — tidak supported di Claude.ai artifacts
  // Let's assume there is an auth token elsewhere or handle it later. For now, fetch without localstorage if possible, or just standard.
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || data.message || 'An error occurred');
  }

  return data;
}

export const fetcher = (url: string) => fetchApi(url).then(res => res.data);
