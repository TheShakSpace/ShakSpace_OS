import { motion } from "motion/react";
import {
  FolderGit2,
  Pin,
  Archive,
  FileText,
  BookOpen,
  Bot,
  Cpu,
  HardDrive,
} from "lucide-react";
import { formatStorage } from "../../utils/workspaceHelpers";

const STAT_CONFIG = [
  { key: "total", label: "Workspaces", icon: FolderGit2, color: "text-[#4F8CFF]", bg: "bg-[#4F8CFF]/10" },
  { key: "pinned", label: "Pinned", icon: Pin, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "archived", label: "Archived", icon: Archive, color: "text-[#A0A6B1]", bg: "bg-white/[0.06]" },
  { key: "documents", label: "Documents", icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "knowledge", label: "Knowledge", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "aiChats", label: "AI Sessions", icon: Bot, color: "text-orange-400", bg: "bg-orange-500/10" },
  { key: "automations", label: "Automations", icon: Cpu, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { key: "storage", label: "Storage", icon: HardDrive, color: "text-pink-400", bg: "bg-pink-500/10", format: formatStorage },
];

export default function WorkspaceHero({ stats }) {
  return (
    <div className="border-b border-white/[0.08] pb-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="text-xs text-[#4F8CFF] font-medium tracking-wide mb-1 flex items-center gap-1.5">
          <FolderGit2 size={12} />
          WORKSPACE DIRECTORY
        </p>
        <h1 className="text-2xl md:text-3xl font-black text-white">Workspaces</h1>
        <p className="text-xs text-[#A0A6B1] mt-1.5 max-w-2xl">
          Manage isolated directories, project contexts, and external asset pipelines under sandboxed boundaries.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6"
      >
        {STAT_CONFIG.map((stat, i) => {
          const Icon = stat.icon;
          const raw = stats[stat.key] ?? 0;
          const value = stat.format ? stat.format(raw) : raw;

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
      </motion.div>
    </div>
  );
}
