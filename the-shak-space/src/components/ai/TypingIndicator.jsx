import { motion } from "motion/react";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl rounded-tl-sm bg-[#14171C]/90 border border-white/[0.08] backdrop-blur-md shadow-lg shadow-black/20"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full bg-[#4F8CFF]"
          />
        ))}
      </div>
      <span className="text-xs text-[#A0A6B1]">Generating response…</span>
    </motion.div>
  );
}
