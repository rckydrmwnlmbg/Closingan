"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { siteConfig } from "@/config/site";

interface AuthContainerProps {
  initialIsLogin?: boolean;
}

export default function AuthContainer({ initialIsLogin = true }: AuthContainerProps) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);

  return (
    <div className={`min-h-screen w-full ${siteConfig.theme.bgClass} flex flex-col justify-center items-center font-sans text-white overflow-hidden relative`}>

      {/* Very Subtle Background grid */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-md relative z-10 px-6">
        <div className="text-center mb-8">
           <h1 className="text-zinc-500 tracking-[0.2em] uppercase text-xs font-semibold">{siteConfig.name}</h1>
        </div>

        <div className={`backdrop-blur-xl ${siteConfig.theme.bgClass} border ${siteConfig.theme.borderClass} rounded-none p-8 sm:p-10 shadow-2xl relative overflow-hidden`}>
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <LoginForm onSwitch={() => setIsLogin(false)} />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <RegisterForm onSwitch={() => setIsLogin(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
