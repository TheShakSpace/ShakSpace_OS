import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check } from "lucide-react";
import { AI_MODELS } from "../../utils/aiHelpers";

export default function ModelSelector({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const selected = AI_MODELS.find((m) => m.id === value) ?? AI_MODELS[0];

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white hover:border-[#4F8CFF]/40 transition-colors cursor-pointer disabled:opacity-50"
      >
        <span className="font-semibold">{selected.label}</span>
        <span className="text-[10px] text-[#A0A6B1] font-mono hidden sm:inline">{selected.badge}</span>
        <ChevronDown size={14} className="text-[#A0A6B1]" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              className="absolute right-0 top-full mt-1 w-56 py-1 rounded-xl bg-[#14171C] border border-white/[0.10] shadow-xl z-50"
            >
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onChange(model.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-semibold text-white block">{model.label}</span>
                    <span className="text-[10px] text-[#A0A6B1]">{model.provider}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-[#4F8CFF] bg-[#4F8CFF]/10 px-1.5 py-0.5 rounded">{model.badge}</span>
                    {value === model.id && <Check size={14} className="text-[#4F8CFF]" />}
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
