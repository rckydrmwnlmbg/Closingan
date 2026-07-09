'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { fetchAdminApi } from '@/lib/apiAdmin';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setToken = useAdminAuthStore((state) => state.setToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchAdminApi('/v1/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.access_token) {
        setToken(data.access_token);
        
        // Set cookie for middleware
        document.cookie = `super_admin_session_token=${data.access_token}; path=/super-admin; max-age=43200; samesite=strict`;
        
        router.push('/super-admin');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-red-500 tracking-tight">System Authority</h1>
          <p className="text-neutral-400 text-sm mt-2">Super Admin Access Only</p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Admin Email</label>
            <input
              type="email"
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Master Password</label>
            <input
              type="password"
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2.5 mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Authorize Access'}
          </button>
        </form>
      </div>
    </div>
  );
}
