import { motion } from "motion/react";
import { Bot, Sparkles, Zap } from "lucide-react";

const SUGGESTIONS = [
  "Summarize my active workspaces and suggest priorities for today.",
  "Draft a product requirements outline for a new dashboard widget.",
  "Explain how Zustand stores work with async API calls in React.",
  "Suggest an automation pipeline to sync knowledge notes to GitHub.",
];

export default function EmptyState({ onSelectPrompt }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 flex flex-col items-center justify-center text-center px-4 py-10 min-h-[320px]"
    >
      <div className="relative mb-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-3xl bg-[#4F8CFF]/20 blur-2xl scale-150"
        />
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#4F8CFF]/30 to-indigo-600/20 border border-[#4F8CFF]/30 flex items-center justify-center shadow-xl shadow-[#4F8CFF]/20 backdrop-blur-sm"
        >
          <Bot size={36} className="text-[#4F8CFF]" />
        </motion.div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-[#4F8CFF] font-semibold tracking-widest uppercase mb-3">
        <Sparkles size={12} />
        <span>Shak Space AI</span>
        <Zap size={12} className="text-amber-400" />
      </div>

      <h2 className="text-2xl font-black text-white mb-2 tracking-tight">How can I help you today?</h2>
      <p className="text-sm text-[#A0A6B1] max-w-md mb-8 leading-relaxed">
        Ask about workspaces, draft documents, explain code, or plan automations — powered by Gemini.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
        {SUGGESTIONS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt?.(prompt)}
            className="text-left p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-[#4F8CFF]/30 text-xs text-[#C8CDD6] transition-all cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
