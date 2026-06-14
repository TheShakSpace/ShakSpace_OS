import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ParticleField from "./ParticleField";
import BootSequence from "./BootSequence";
import LoadingProgress from "./LoadingProgress";
import { Sparkles } from "lucide-react";

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(1); // 1: Field, 2: Logo + Text, 3: Core Boot, 4: Complete

  useEffect(() => {
    const phase2Timer = setTimeout(() => setPhase(2), 500);
    const phase3Timer = setTimeout(() => setPhase(3), 1200);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        const increment = prev < 50 ? 3 : prev < 85 ? 2.5 : 1.5;
        return Math.min(100, prev + increment);
      });
    }, 70);

    return () => {
      clearTimeout(phase2Timer);
      clearTimeout(phase3Timer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setPhase(4);

      const exitTimer = setTimeout(() => {
        onComplete();
      }, 900);

      return () => clearTimeout(exitTimer);
    }
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0F1115] overflow-hidden flex flex-col items-center justify-between py-12 px-6 z-50 select-none">
      {/* 3D Particle Starfield */}
      <ParticleField />

      {/* Decorative Top Ambient Guard */}
      <div className="absolute top-0 inset-x-0 h-[150px] bg-gradient-to-b from-[#0F1115] to-transparent pointer-events-none z-10" />

      {/* Header Info Capsule */}
      <div className="z-20 text-center pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-full backdrop-blur-md">
          <Sparkles size={11} className="text-[#4F8CFF] animate-pulse" />
          <span className="text-[9px] font-bold font-mono text-[#A0A6B1] tracking-widest uppercase">
            The Shak Space OS Boot v1.0.4
          </span>
        </div>
      </div>

      {/* Center Logo & Interactive State Core */}
      <div className="z-20 flex flex-col items-center justify-center max-w-lg w-full gap-8 pointer-events-none">
        {/* LOGO & TITLE HEADER */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="text-center space-y-2 mt-4"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4F8CFF] via-blue-500 to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-xl shadow-blue-500/10 mb-4 ring-1 ring-white/10 hover:scale-105 transition-transform duration-300">
                S
              </div>

              <h1 className="text-3xl font-black tracking-widest text-[#FFFFFF] font-sans">
                THE SHAK SPACE
              </h1>

              <p className="text-[11px] text-[#A0A6B1] tracking-[0.3em] font-mono uppercase">
                Internet Operating System
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOADING PROGRESS SECTIONS */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full flex flex-col items-center gap-6"
            >
              <BootSequence progress={progress} />
              <LoadingProgress progress={progress} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer System Status Label */}
      <div className="z-20 pointer-events-none text-center">
        <p className="text-[10px] font-mono text-white/30 tracking-tight">
          SECURE CONNECTION ESTABLISHED • PORT 3000
        </p>
      </div>

      {/* Decorative Bottom Ambient Guard */}
      <div className="absolute bottom-0 inset-x-0 h-[150px] bg-gradient-to-t from-[#0F1115] to-transparent pointer-events-none z-10" />
    </div>
  );
}