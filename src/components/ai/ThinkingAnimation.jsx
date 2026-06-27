import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

const STEPS = ["Reading context", "Analyzing query", "Composing response"];

export default function ThinkingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex flex-col gap-2.5 px-4 py-3.5 rounded-2xl rounded-tl-sm bg-[#14171C]/90 border border-white/[0.08] backdrop-blur-md shadow-lg shadow-black/20 min-w-[200px]"
    >
      <div className="flex items-center gap-2.5">
        <div className="relative w-5 h-5">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-[#4F8CFF]/20 border-t-[#4F8CFF]"
          />
          <Sparkles size={10} className="absolute inset-0 m-auto text-[#4F8CFF]" />
        </div>
        <span className="text-xs font-semibold text-white">Thinking</span>
        <span className="flex gap-1 ml-auto">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1, 0.85] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF]"
            />
          ))}
        </span>
      </div>

      <div className="space-y-1.5">
        {STEPS.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: [0.4, 1, 0.4], x: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
            className="flex items-center gap-2 text-[10px] text-[#A0A6B1]"
          >
            <span className="w-1 h-1 rounded-full bg-[#4F8CFF]/60" />
            {step}…
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
