"use client";

import { useState } from "react";

import { Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  onSwitch: () => void;
}

export default function LoginForm({ onSwitch }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Dummy endpoint for now
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // throw new Error("Invalid credentials");
      }

      document.cookie = "session_token=mock-token; path=/; max-age=86400"; // 1 day
      router.push("/dashboard/analytics");
    } catch (err: unknown) {
      setError((err as Error).message || "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">Sign In</h2>
        <p className="text-zinc-400 text-sm font-light">Access your workspace.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium text-zinc-400">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-sm"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-medium text-zinc-400">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-white hover:bg-zinc-200 text-black font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              Continue
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>

      </form>

      <div className="mt-6 text-center text-xs text-zinc-500">
        Don&apos;t have an account?{" "}
        <button onClick={onSwitch} className="text-white hover:text-zinc-300 font-medium transition-colors focus:outline-none">
          Sign up
        </button>
      </div>
    </div>
  );
}
