import { motion } from "motion/react";
import {
  BookOpen,
  Star,
  Pin,
  Clock,
  Archive,
  Trash2,
  Plus,
} from "lucide-react";
import { SIDEBAR_VIEWS } from "../../utils/knowledgeHelpers";

const NAV_ITEMS = [
  { id: SIDEBAR_VIEWS.ALL, label: "All Notes", icon: BookOpen },
  { id: SIDEBAR_VIEWS.FAVORITES, label: "Favorites", icon: Star },
  { id: SIDEBAR_VIEWS.PINNED, label: "Pinned", icon: Pin },
  { id: SIDEBAR_VIEWS.RECENT, label: "Recent", icon: Clock },
  { id: SIDEBAR_VIEWS.ARCHIVED, label: "Archived", icon: Archive },
  { id: SIDEBAR_VIEWS.TRASH, label: "Trash", icon: Trash2 },
];

export default function KnowledgeSidebar({
  activeView,
  activeCollectionId,
  collections,
  noteCounts,
  onViewChange,
  onCollectionSelect,
  onNewCollection,
  onEmptyTrash,
  trashCount = 0,
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full lg:w-[220px] xl:w-60 shrink-0 space-y-3"
    >
      <nav className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id && !activeCollectionId;
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

      <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2 px-2 py-0.5">
          <span className="text-[10px] font-bold text-[#A0A6B1] uppercase tracking-wider">
            Collections
          </span>
          <button
            type="button"
            onClick={onNewCollection}
            className="p-1.5 rounded-lg text-[#A0A6B1] hover:text-purple-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="New collection"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-0.5 max-h-44 overflow-y-auto">
          {collections.map((col) => {
            const active = activeCollectionId === col.id;
            const count = noteCounts[`col-${col.id}`] ?? 0;

            return (
              <button
                key={col.id}
                type="button"
                onClick={() => onCollectionSelect(col.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-xs transition-all duration-150 cursor-pointer ${
                  active
                    ? "bg-[#4F8CFF]/15 text-white border border-[#4F8CFF]/25"
                    : "text-[#A0A6B1] hover:text-white hover:bg-white/[0.05] border border-transparent"
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm shrink-0 leading-none" role="img" aria-hidden>
                    {col.icon ?? "📂"}
                  </span>
                  <span className="truncate">{col.name}</span>
                </span>
                <span className="text-[10px] font-mono shrink-0 tabular-nums">{count}</span>
              </button>
            );
          })}

          {collections.length === 0 && (
            <p className="text-[10px] text-[#A0A6B1] px-2 py-3 text-center">
              No collections yet
            </p>
          )}
        </div>
      </div>

      {trashCount > 0 && activeView === SIDEBAR_VIEWS.TRASH && (
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          onClick={onEmptyTrash}
          className="w-full h-10 px-3 rounded-xl text-xs font-semibold text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Trash2 size={12} />
          Empty Trash
        </motion.button>
      )}
    </motion.aside>
  );
}
