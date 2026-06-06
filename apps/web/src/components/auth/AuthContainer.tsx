"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthContainerProps {
  initialIsLogin?: boolean;
}

export default function AuthContainer({ initialIsLogin = true }: AuthContainerProps) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex font-[family-name:var(--font-geist-sans)] text-slate-100 overflow-hidden">

      {/* Visual Side (Left) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-950 items-center justify-center overflow-hidden">
        {/* Abstract Animated Background */}
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 90, 0]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/30 blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, -90, 0]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-violet-900/20 blur-[150px]"
          />
        </div>

        <div className="relative z-10 p-12 text-center max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold mb-6 tracking-tight text-white">
              AI Brain <br/> <span className="text-indigo-400">Initiated.</span>
            </h1>
            <p className="text-lg text-slate-400 font-light leading-relaxed">
              Experience the next generation of intelligent systems. Secure, adaptive, and designed for tomorrow.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 sm:p-10 shadow-[0_0_40px_-10px_rgba(79,70,229,0.15)] relative overflow-hidden">

            {/* Subtle Inner Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <LoginForm onSwitch={() => setIsLogin(false)} />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <RegisterForm onSwitch={() => setIsLogin(true)} />
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

    </div>
  );
}
