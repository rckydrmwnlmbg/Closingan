"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Mail, Lock } from "lucide-react";
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
      // Dummy endpoint for now, or match your actual backend
      // Replace with actual API call to /api/v1/auth/login
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // Just mock success for the sake of UI if API doesn't exist yet
        // throw new Error("Invalid credentials");
      }

      // Mock setting a token if actual API fails
      document.cookie = "session_token=mock-token; path=/; max-age=86400"; // 1 day

      router.push("/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message || "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm">Enter your credentials to access your terminal.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg">
            {error}
          </div>
        )}

        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-10 py-3 text-slate-100 placeholder-transparent focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all peer"
            placeholder="Email Address"
          />
          <label
            htmlFor="email"
            className="absolute left-10 -top-2.5 text-xs text-slate-500 bg-slate-900 px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-slate-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400 cursor-text"
          >
            Email Address
          </label>
        </div>

        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-10 py-3 text-slate-100 placeholder-transparent focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all peer"
            placeholder="Password"
          />
          <label
            htmlFor="password"
            className="absolute left-10 -top-2.5 text-xs text-slate-500 bg-slate-900 px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-slate-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400 cursor-text"
          >
            Password
          </label>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-700 bg-slate-900/50 text-indigo-500 focus:ring-indigo-500/30" />
            <span className="text-slate-400 hover:text-slate-300 transition-colors">Remember me</span>
          </label>
          <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative group overflow-hidden rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Loader2 className="w-5 h-5 animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            )}
          </span>
        </button>

      </form>

      <div className="mt-8 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <button onClick={onSwitch} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors focus:outline-none underline underline-offset-4 decoration-indigo-400/30 hover:decoration-indigo-400">
          Request Access
        </button>
      </div>
    </div>
  );
}
