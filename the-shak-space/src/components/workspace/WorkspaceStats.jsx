import { motion } from "motion/react";
import {
  FileText,
  BookOpen,
  Bot,
  Cpu,
  HardDrive,
  Activity,
  Calendar,
  Clock,
} from "lucide-react";
import { formatDate, formatRelativeTime, formatStorage } from "../../utils/workspaceHelpers";

const ANALYTICS = [
  { key: "documents", label: "Documents", icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "knowledge", label: "Knowledge", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "aiChats", label: "AI Chats", icon: Bot, color: "text-orange-400", bg: "bg-orange-500/10" },
  { key: "automations", label: "Automations", icon: Cpu, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { key: "storage", label: "Storage", icon: HardDrive, color: "text-pink-400", bg: "bg-pink-500/10", format: formatStorage },
  { key: "activity", label: "Activity", icon: Activity, color: "text-[#4F8CFF]", bg: "bg-[#4F8CFF]/10", getValue: (w) => (w.activity ?? []).length },
  { key: "createdAt", label: "Created", icon: Calendar, color: "text-amber-400", bg: "bg-amber-500/10", format: formatDate },
  { key: "lastOpened", label: "Last Opened", icon: Clock, color: "text-rose-400", bg: "bg-rose-500/10", format: formatRelativeTime },
];

export default function WorkspaceStats({ workspace }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {ANALYTICS.map((stat, i) => {
        const Icon = stat.icon;
        const raw = stat.getValue ? stat.getValue(workspace) : workspace[stat.key];
        const value = stat.format ? stat.format(raw) : (raw ?? 0);

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]"
          >
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <Icon size={16} className={stat.color} />
            </div>
            <span className="text-xl font-black text-white font-mono block">{value}</span>
            <span className="text-[10px] font-bold text-[#A0A6B1] uppercase tracking-wider">
              {stat.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
