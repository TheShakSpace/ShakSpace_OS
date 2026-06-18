import { motion } from "motion/react";
import { Bot, MessageSquare, Pin, Star, Zap } from "lucide-react";

const STAT_CONFIG = [
  { key: "total", label: "Total Chats", icon: MessageSquare, color: "text-[#4F8CFF]", bg: "bg-[#4F8CFF]/10" },
  { key: "messages", label: "Messages", icon: Bot, color: "text-orange-400", bg: "bg-orange-500/10" },
  { key: "pinned", label: "Pinned", icon: Pin, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "favorites", label: "Favorites", icon: Star, color: "text-rose-400", bg: "bg-rose-500/10" },
  { key: "tokens", label: "Tokens", icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10" },
];

function formatTokens(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function AIHero({ stats, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {STAT_CONFIG.slice(0, 3).map((s) => (
          <span key={s.key} className="text-[10px] font-mono text-[#A0A6B1] bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
            {s.key === "tokens" ? formatTokens(stats[s.key] ?? 0) : stats[s.key] ?? 0} {s.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="border-b border-white/[0.08] pb-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <p className="text-xs text-[#4F8CFF] font-medium tracking-wide mb-1 flex items-center gap-1.5">
          <Bot size={12} />
          AI ASSISTANT
        </p>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">AI Assistant</h1>
        <p className="text-xs text-[#A0A6B1] mt-1 max-w-2xl leading-relaxed">
          Your intelligent synthesizer — chat, research, code, and automate across your Shak Space.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-4"
      >
        {STAT_CONFIG.map((stat, i) => {
          const Icon = stat.icon;
          const raw = stats[stat.key] ?? 0;
          const value = stat.key === "tokens" ? formatTokens(raw) : raw;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="min-h-[80px] p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon size={14} className={stat.color} />
                </div>
                <span className="text-lg font-black text-white font-mono tabular-nums">{value}</span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-[#A0A6B1] uppercase tracking-wide leading-snug line-clamp-2">
                {stat.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export { STAT_CONFIG };
