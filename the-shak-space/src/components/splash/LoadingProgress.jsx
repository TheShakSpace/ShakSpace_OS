import React from "react";
import { motion } from "motion/react";

export default function LoadingProgress({ progress }) {
  const radius = 30;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Premium Circular Progress Meter */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-[rgba(255,255,255,0.06)] fill-transparent"
            strokeWidth={strokeWidth}
          />

          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-[#4F8CFF] fill-transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Percentage Display */}
        <span className="absolute text-xs font-mono font-bold text-white tracking-widest pl-1">
          {Math.min(100, Math.floor(progress))}%
        </span>
      </div>

      {/* Subtle bar tracking glow below */}
      <div className="w-48 h-[2px] bg-white/[0.04] rounded-full overflow-hidden relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#4F8CFF] to-blue-400"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}