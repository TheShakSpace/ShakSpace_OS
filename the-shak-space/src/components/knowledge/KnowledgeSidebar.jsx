import { motion } from "motion/react";
import { BookOpen, Star, Pin, Clock, Archive } from "lucide-react";
import { SIDEBAR_VIEWS } from "../../utils/knowledgeHelpers";

const NAV_ITEMS = [
  { id: SIDEBAR_VIEWS.ALL, label: "All Notes", icon: BookOpen },
  { id: SIDEBAR_VIEWS.FAVORITES, label: "Favorites", icon: Star },
  { id: SIDEBAR_VIEWS.PINNED, label: "Pinned", icon: Pin },
  { id: SIDEBAR_VIEWS.RECENT, label: "Recent", icon: Clock },
  { id: SIDEBAR_VIEWS.ARCHIVED, label: "Archived", icon: Archive },
];

export default function KnowledgeSidebar({ activeView, noteCounts, onViewChange }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full lg:w-[220px] xl:w-60 shrink-0"
    >
      <nav className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          const count = noteCounts[item.id] ?? 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-150 cursor-pointer ${
                active
                  ? "bg-purple-500/15 text-white border border-purple-500/30 shadow-sm shadow-purple-500/10"
                  : "text-[#A0A6B1] hover:text-white hover:bg-white/[0.05] border border-transparent"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon size={14} className={`shrink-0 ${active ? "text-purple-400" : ""}`} />
                <span className="truncate">{item.label}</span>
              </span>
              {count > 0 && (
                <span className="text-[10px] font-mono text-[#A0A6B1] shrink-0 tabular-nums">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </motion.aside>
  );
}
