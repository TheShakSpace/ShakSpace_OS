import { motion } from "motion/react";
import {
  BookOpen,
  Pin,
  Star,
  Archive,
  Tag,
  Clock,
  Type,
} from "lucide-react";

const STAT_CONFIG = [
  { key: "total", label: "Notes", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "favorites", label: "Favorites", icon: Star, color: "text-rose-400", bg: "bg-rose-500/10" },
  { key: "pinned", label: "Pinned", icon: Pin, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "archived", label: "Archived", icon: Archive, color: "text-[#A0A6B1]", bg: "bg-white/[0.06]" },
  { key: "wordCount", label: "Words", icon: Type, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "readingTime", label: "Reading Time", icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/10", suffix: "m" },
  { key: "tags", label: "Tags", icon: Tag, color: "text-[#4F8CFF]", bg: "bg-[#4F8CFF]/10" },
];

export default function KnowledgeHero({ stats }) {
  return (
    <div className="border-b border-white/[0.08] pb-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <p className="text-xs text-purple-400 font-medium tracking-wide mb-1 flex items-center gap-1.5">
          <BookOpen size={12} />
          KNOWLEDGE HUB
        </p>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Knowledge Hub</h1>
        <p className="text-xs text-[#A0A6B1] mt-1 max-w-2xl leading-relaxed">
          Workspace-scoped notes with markdown, search, and filters — your Notion-like knowledge base.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.06 }}
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 mt-4"
      >
        {STAT_CONFIG.map((stat, i) => {
          const Icon = stat.icon;
          const raw = stats[stat.key] ?? 0;
          const value = stat.suffix ? `${raw}${stat.suffix}` : raw;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="min-h-[88px] p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon size={14} className={stat.color} />
                </div>
                <span className="text-lg font-black text-white font-mono tabular-nums">{value}</span>
              </div>
              <span className="text-[9px] font-bold text-[#A0A6B1] uppercase tracking-wide">{stat.label}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
