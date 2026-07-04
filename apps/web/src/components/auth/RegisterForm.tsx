"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { siteConfig } from "@/config/site";

interface RegisterFormProps {
  onSwitch: () => void;
}

export default function RegisterForm({ onSwitch }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Dummy endpoint for now
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, company }),
      });

      if (!res.ok) {
        // Mock success
      }

      setToken("mock-token");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message || "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">Buat Akun</h2>
        <p className="text-zinc-400 text-sm font-light">Set up workspace Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-none">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full bg-transparent border ${siteConfig.theme.borderClass} rounded-none px-4 py-2.5 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-sm`}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="company" className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Dealer</label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={`w-full bg-transparent border ${siteConfig.theme.borderClass} rounded-none px-4 py-2.5 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-sm`}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="reg-email" className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Email Kerja</label>
          <input
            id="reg-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full bg-transparent border ${siteConfig.theme.borderClass} rounded-none px-4 py-2.5 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-sm`}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="reg-password" className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Password</label>
          <input
            id="reg-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full bg-transparent border ${siteConfig.theme.borderClass} rounded-none px-4 py-2.5 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-sm`}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-white hover:bg-zinc-200 text-black font-medium py-2.5 px-4 rounded-none transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              Buat Akun
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>

      </form>

      <div className="mt-6 text-center text-xs text-zinc-500">
        Sudah punya akun?{" "}
        <button onClick={onSwitch} className="text-white hover:text-zinc-300 font-medium transition-colors focus:outline-none">
          Masuk
        </button>
      </div>
    </div>
  );
}
