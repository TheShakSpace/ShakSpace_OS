import { motion } from "motion/react";
import {
  BookOpen,
  FolderOpen,
  Pin,
  Star,
  Archive,
  Trash2,
  Tag,
  Clock,
} from "lucide-react";

const STAT_CONFIG = [
  { key: "total", label: "Notes", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "collections", label: "Collections", icon: FolderOpen, color: "text-[#4F8CFF]", bg: "bg-[#4F8CFF]/10" },
  { key: "pinned", label: "Pinned", icon: Pin, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "favorites", label: "Favorites", icon: Star, color: "text-rose-400", bg: "bg-rose-500/10" },
  { key: "archived", label: "Archived", icon: Archive, color: "text-[#A0A6B1]", bg: "bg-white/[0.06]" },
  { key: "trash", label: "Trash", icon: Trash2, color: "text-red-400", bg: "bg-red-500/10" },
  { key: "tags", label: "Tags", icon: Tag, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "readTime", label: "Read Time", icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/10", suffix: "m" },
];

export default function KnowledgeHero({ stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="border-b border-white/[0.08] pb-5"
    >
      <p className="text-xs text-purple-400 font-medium tracking-wide mb-1 flex items-center gap-1.5">
        <BookOpen size={12} />
        KNOWLEDGE HUB
      </p>
      <h1 className="text-2xl md:text-3xl font-black text-white">Knowledge Hub</h1>
      <p className="text-xs text-[#A0A6B1] mt-1.5 max-w-2xl">
        Store notes, reference metadata, specifications, and internal assets — your Notion-meets-Obsidian knowledge base.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-5">
        {STAT_CONFIG.map((stat, i) => {
          const Icon = stat.icon;
          const raw = stats[stat.key] ?? 0;
          const value = stat.suffix ? `${raw}${stat.suffix}` : raw;

          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm"
            >
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <Icon size={14} className={stat.color} />
              </div>
              <span className="text-lg font-black text-white font-mono block leading-none">
                {value}
              </span>
              <span className="text-[9px] font-bold text-[#A0A6B1] uppercase tracking-wider mt-1 block">
                {stat.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
