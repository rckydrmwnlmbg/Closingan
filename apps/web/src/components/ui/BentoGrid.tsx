"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition duration-200 shadow-input p-6 border border-white/5 bg-[#0A0A0A] justify-between flex flex-col space-y-4 relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500" />
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200 relative z-10">
        {icon}
        <div className="font-serif font-bold text-xl text-neutral-200 mb-2 mt-2 tracking-tight">
          {title}
        </div>
        <div className="font-sans font-normal text-neutral-400 text-sm leading-relaxed">
          {description}
        </div>
      </div>
    </motion.div>
  );
};
