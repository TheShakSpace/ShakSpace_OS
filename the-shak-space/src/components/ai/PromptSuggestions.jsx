import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { PROMPT_SUGGESTIONS } from "../../utils/aiHelpers";

export default function PromptSuggestions({ onSelect }) {
  return (
    <div className="w-full max-w-2xl">
      <p className="text-[10px] font-bold text-[#A0A6B1] uppercase tracking-widest mb-3">Try asking</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PROMPT_SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.id}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05 }}
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(s.prompt)}
            className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#4F8CFF]/35 hover:bg-white/[0.05] text-left transition-all cursor-pointer backdrop-blur-sm shadow-sm hover:shadow-md hover:shadow-[#4F8CFF]/5"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xl leading-none" role="img" aria-hidden>{s.icon}</span>
              <ArrowRight size={14} className="text-[#A0A6B1] group-hover:text-[#4F8CFF] group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5 opacity-0 group-hover:opacity-100" />
            </div>
            <span className="text-xs font-bold text-white block mt-2.5">{s.title}</span>
            <span className="text-[10px] text-[#A0A6B1] line-clamp-2 mt-1 leading-relaxed block">
              {s.prompt}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
