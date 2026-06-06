"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Mail, Lock, User, Building } from "lucide-react";
import { useRouter } from "next/navigation";

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

      // Mock setting a token
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
        <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Initialize Instance</h2>
        <p className="text-slate-400 text-sm">Create a new workspace for your organization.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-10 py-3 text-slate-100 placeholder-transparent focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all peer"
              placeholder="Full Name"
            />
            <label
              htmlFor="name"
              className="absolute left-10 -top-2.5 text-xs text-slate-500 bg-slate-900 px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-slate-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-violet-400 cursor-text"
            >
              Full Name
            </label>
          </div>

          <div className="relative group">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-10 py-3 text-slate-100 placeholder-transparent focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all peer"
              placeholder="Company"
            />
            <label
              htmlFor="company"
              className="absolute left-10 -top-2.5 text-xs text-slate-500 bg-slate-900 px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-slate-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-violet-400 cursor-text"
            >
              Company (Opt)
            </label>
          </div>
        </div>

        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
          <input
            id="reg-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-10 py-3 text-slate-100 placeholder-transparent focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all peer"
            placeholder="Work Email"
          />
          <label
            htmlFor="reg-email"
            className="absolute left-10 -top-2.5 text-xs text-slate-500 bg-slate-900 px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-slate-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-violet-400 cursor-text"
          >
            Work Email
          </label>
        </div>

        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
          <input
            id="reg-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-10 py-3 text-slate-100 placeholder-transparent focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all peer"
            placeholder="Password"
          />
          <label
            htmlFor="reg-password"
            className="absolute left-10 -top-2.5 text-xs text-slate-500 bg-slate-900 px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-slate-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-violet-400 cursor-text"
          >
            Password
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 relative group overflow-hidden rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 px-4 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                Deploy Instance
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            )}
          </span>
        </button>

      </form>

      <div className="mt-8 text-center text-sm text-slate-400">
        Already have an instance?{" "}
        <button onClick={onSwitch} className="text-violet-400 hover:text-violet-300 font-medium transition-colors focus:outline-none underline underline-offset-4 decoration-violet-400/30 hover:decoration-violet-400">
          Authenticate
        </button>
      </div>
    </div>
  );
}
