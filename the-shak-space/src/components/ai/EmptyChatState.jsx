import { motion } from "motion/react";
import { Bot, Sparkles, Zap } from "lucide-react";
import PromptSuggestions from "./PromptSuggestions";

export default function EmptyChatState({ onSelectPrompt }) {
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
      <p className="text-sm text-[#A0A6B1] max-w-md mb-10 leading-relaxed">
        Summarize workspaces, draft documents, explain code, or plan automations — powered by your local Shak Space index.
      </p>

      <PromptSuggestions onSelect={onSelectPrompt} />
    </motion.div>
  );
}
