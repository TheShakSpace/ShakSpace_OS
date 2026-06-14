import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal } from "lucide-react";

const BOOT_LOGS = [
  { text: "Initializing Workspace Engine...", minProgress: 1 },
  { text: "Loading Knowledge Hub Indexed Records...", minProgress: 22 },
  { text: "Connecting AI Synthesizer Agent Layer...", minProgress: 45 },
  { text: "Starting Automation Runtime Engine...", minProgress: 65 },
  { text: "Loading User Premium Environment...", minProgress: 85 },
  { text: "System Ready. Initializing Dashboard...", minProgress: 98 },
];

export default function BootSequence({ progress }) {
  return (
    <div className="w-full max-w-sm font-mono text-[11px] space-y-2 bg-black/20 border border-white/[0.04] p-4 rounded-xl backdrop-blur-md">
      <div className="flex items-center gap-2 text-white/40 pb-2 mb-2 border-b border-white/[0.04]">
        <Terminal size={12} className="text-[#4F8CFF]" />
        <span className="uppercase text-[9px] font-bold tracking-wider">
          V-OS Dynamic Kernal Terminal
        </span>
      </div>

      <div className="space-y-1.5 h-[120px] flex flex-col justify-end overflow-hidden">
        <AnimatePresence>
          {BOOT_LOGS.map((log, index) => {
            const hasStarted = progress >= log.minProgress;

            const isCompleted =
              progress > log.minProgress + 15 ||
              (index === BOOT_LOGS.length - 1 && progress >= 100);

            if (!hasStarted) return null;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10, y: 5 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  {isCompleted ? (
                    <span className="text-emerald-500 font-bold shrink-0">
                      ✔
                    </span>
                  ) : (
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-[#4F8CFF] shrink-0 font-black animate-pulse"
                    >
                      ●
                    </motion.span>
                  )}

                  <span
                    className={
                      isCompleted
                        ? "text-[#A0A6B1]"
                        : "text-white font-medium"
                    }
                  >
                    {log.text}
                  </span>
                </div>

                <div className="shrink-0 pl-2">
                  {isCompleted ? (
                    <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.25 rounded-[3px] text-[9px]">
                      done
                    </span>
                  ) : (
                    <span className="text-[#4F8CFF] bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 px-1 py-0.25 rounded-[3px] text-[9px] animate-pulse">
                      load
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}