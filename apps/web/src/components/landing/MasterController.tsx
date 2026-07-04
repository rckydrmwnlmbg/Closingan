"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";

// Slide Components
import { SlideHero } from "./SlideHero";
import { SlideProblem } from "./SlideProblem";
import { SlideEngine } from "./SlideEngine";
import { SlideHandoff } from "./SlideHandoff";
import { SlideCTA } from "./SlideCTA";

const SLIDES = [
  { id: "hero", component: SlideHero },
  { id: "problem", component: SlideProblem },
  { id: "engine", component: SlideEngine },
  { id: "handoff", component: SlideHandoff },
  { id: "cta", component: SlideCTA },
];

function InteractiveBackground() {
  // Spring physics for smooth mouse following
  // Spring physics for smooth mouse following
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x * 100);
      mouseY.set(y * 100);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-slate-50 dark:bg-[#0a0a0a]">
      {/* Dynamic 3D-like Orbs */}
      <motion.div
        style={{ x: mouseX, y: mouseY }}
        className="absolute w-full h-full"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-300/30 dark:bg-emerald-600/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div
          animate={{ 
            y: [0, -50, 0],
            x: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] bg-cyan-300/30 dark:bg-cyan-600/20 rounded-full blur-[90px] mix-blend-multiply dark:mix-blend-screen"
        />
      </motion.div>
      
      {/* Subtle Noise Texture for Premium Feel */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}

export function MasterController() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const isScrolling = useRef(false);

  // Smooth Loading Screen
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoaded(true), 300);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 15;
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Update URL Hash automatically
  useEffect(() => {
    if (isLoaded) {
      window.history.replaceState(null, "", `/#${SLIDES[currentSlide].id}`);
    }
  }, [currentSlide, isLoaded]);

  // Handle Scroll Jacking with FASTER debounce
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isLoaded || isScrolling.current) return;
    
    if (Math.abs(e.deltaY) < 20) return; // lower threshold for snappiness

    if (e.deltaY > 0 && currentSlide < SLIDES.length - 1) {
      isScrolling.current = true;
      setCurrentSlide((prev) => prev + 1);
      setTimeout(() => (isScrolling.current = false), 600); // 1200ms -> 600ms
    } else if (e.deltaY < 0 && currentSlide > 0) {
      isScrolling.current = true;
      setCurrentSlide((prev) => prev - 1);
      setTimeout(() => (isScrolling.current = false), 600); // 1200ms -> 600ms
    }
  }, [currentSlide, isLoaded]);

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Handle Touch (Swipe) with FASTER debounce
  const touchStartY = useRef(0);
  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isLoaded || isScrolling.current) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    if (Math.abs(deltaY) < 40) return; // lower threshold

    if (deltaY > 0 && currentSlide < SLIDES.length - 1) {
      isScrolling.current = true;
      setCurrentSlide((prev) => prev + 1);
      setTimeout(() => (isScrolling.current = false), 600);
    } else if (deltaY < 0 && currentSlide > 0) {
      isScrolling.current = true;
      setCurrentSlide((prev) => prev - 1);
      setTimeout(() => (isScrolling.current = false), 600);
    }
  }, [currentSlide, isLoaded]);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchEnd]);

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-slate-900 dark:text-white bg-slate-50 dark:bg-[#0a0a0a]">
      
      <InteractiveBackground />

      {/* Loading Screen */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 z-50 bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center"
          >
            <div className="w-64">
              <div className="flex justify-between items-end mb-4 font-semibold text-sm text-slate-500">
                <span>Loading Closingan...</span>
                <span>{Math.min(progress, 100)}%</span>
              </div>
              <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Slide Content */}
      <div className="absolute inset-0 z-10">
        <AnimatePresence mode="wait">
          {SLIDES.map((slide, index) => {
            if (index === currentSlide) {
              const SlideComponent = slide.component;
              return (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 50, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.98 }}
                  transition={{ 
                    duration: 0.5, 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 25 
                  }}
                  className="w-full h-full"
                >
                  <SlideComponent />
                </motion.div>
              );
            }
            return null;
          })}
        </AnimatePresence>
      </div>

      {/* Modern Floating Navigation Dots */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-5 p-3 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 shadow-xl">
        {SLIDES.map((_, index) => (
          <button 
            key={index}
            onClick={() => {
              if (isScrolling.current || index === currentSlide) return;
              isScrolling.current = true;
              setCurrentSlide(index);
              setTimeout(() => (isScrolling.current = false), 600);
            }}
            className="group relative flex items-center justify-center w-6 h-6"
          >
            <div className={`transition-all duration-300 rounded-full ${
              index === currentSlide 
                ? "w-3 h-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-125" 
                : "w-2 h-2 bg-slate-400/50 dark:bg-slate-500/50 group-hover:bg-slate-600 dark:group-hover:bg-slate-300"
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}
