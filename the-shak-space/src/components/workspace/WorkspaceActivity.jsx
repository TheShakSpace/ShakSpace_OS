import { motion } from "motion/react";
import {
  FolderPlus,
  Pencil,
  Pin,
  PinOff,
  FolderOpen,
  FileText,
  BookOpen,
  Cpu,
  Bot,
  Archive,
  RotateCcw,
} from "lucide-react";
import { formatRelativeTime } from "../../utils/workspaceHelpers";

const ACTIVITY_ICONS = {
  created: FolderPlus,
  edited: Pencil,
  pinned: Pin,
  unpinned: PinOff,
  opened: FolderOpen,
  document: FileText,
  knowledge: BookOpen,
  automation: Cpu,
  ai: Bot,
  archived: Archive,
  restored: RotateCcw,
};

const ACTIVITY_COLORS = {
  created: "text-emerald-400 bg-emerald-500/10",
  edited: "text-[#4F8CFF] bg-[#4F8CFF]/10",
  pinned: "text-amber-400 bg-amber-500/10",
  unpinned: "text-[#A0A6B1] bg-white/[0.06]",
  opened: "text-orange-400 bg-orange-500/10",
  document: "text-purple-400 bg-purple-500/10",
  knowledge: "text-emerald-400 bg-emerald-500/10",
  automation: "text-cyan-400 bg-cyan-500/10",
  ai: "text-pink-400 bg-pink-500/10",
  archived: "text-[#A0A6B1] bg-white/[0.06]",
  restored: "text-emerald-400 bg-emerald-500/10",
};

export default function WorkspaceActivity({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-[#A0A6B1] py-8 text-center">No activity recorded yet.</p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.08]" />

      <div className="space-y-4">
        {activities.map((entry, i) => {
          const Icon = ACTIVITY_ICONS[entry.type] ?? FolderOpen;
          const colorClass = ACTIVITY_COLORS[entry.type] ?? ACTIVITY_COLORS.opened;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="flex items-start gap-4 pl-1"
            >
              <div
                className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}
              >
                <Icon size={14} />
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm text-white font-medium">{entry.label}</p>
                <p className="text-[11px] text-[#A0A6B1] mt-0.5">
                  {formatRelativeTime(entry.timestamp)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
