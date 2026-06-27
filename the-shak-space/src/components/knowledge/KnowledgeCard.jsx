import { motion } from "motion/react";
import {
  Pin,
  Star,
  ArrowUpRight,
  MoreHorizontal,
  Pencil,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  PinOff,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { formatDate, formatRelativeTime, formatCategoryLabel } from "../../utils/knowledgeHelpers";

function NoteActionsMenu({ note, handlers, onClose }) {
  const isArchived = note.archived;

  const actions = isArchived
    ? [
        { label: "Restore", icon: ArchiveRestore, onClick: handlers.onRestore },
        { label: "Delete", icon: Trash2, onClick: handlers.onDelete, danger: true },
      ]
    : [
        { label: note.pinned ? "Unpin" : "Pin", icon: note.pinned ? PinOff : Pin, onClick: handlers.onTogglePin },
        { label: note.favorite ? "Unfavorite" : "Favorite", icon: Star, onClick: handlers.onToggleFavorite },
        { label: "Edit", icon: Pencil, onClick: handlers.onEdit },
        { label: "Duplicate", icon: Copy, onClick: handlers.onDuplicate },
        { label: "Archive", icon: Archive, onClick: handlers.onArchive },
        { label: "Delete", icon: Trash2, onClick: handlers.onDelete, danger: true },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      className="absolute right-0 top-full mt-1 w-44 py-1 rounded-xl bg-[#14171C] border border-white/[0.10] shadow-xl z-50"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              action.onClick();
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] cursor-pointer ${
              action.danger ? "text-red-400 hover:bg-red-500/10" : "text-[#A0A6B1] hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Icon size={12} />
            {action.label}
          </button>
        );
      })}
    </motion.div>
  );
}

export default function KnowledgeCard({ note, handlers, index = 0, listView = false, workspaceName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const accentHex = note.accentColor ?? "#8B5CF6";

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.025 }}
      whileHover={{ y: -3, scale: 1.008 }}
      className={`h-full p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] relative group overflow-hidden hover:border-purple-500/25 flex ${
        listView ? "flex-row items-center gap-4 min-h-[80px]" : "flex-col min-h-[140px]"
      }`}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 blur-2xl opacity-20 group-hover:opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${accentHex}55, transparent 70%)` }}
      />

      <div className="z-10 flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-lg shrink-0" role="img" aria-hidden>
            {note.icon ?? "📝"}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-white line-clamp-2">{note.title}</h3>
              <div className="flex gap-1 shrink-0">
                {note.pinned && <Pin size={10} className="text-[#4F8CFF]" />}
                {note.favorite && <Star size={10} className="text-amber-400" />}
              </div>
            </div>
            <p className="text-[11px] text-[#A0A6B1] line-clamp-2 mt-1">
              {note.summary || note.description || "No summary."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {workspaceName && (
            <span className="px-2 py-0.5 text-[9px] font-semibold text-purple-400 bg-white/[0.05] border border-white/[0.08] rounded-full">
              {workspaceName}
            </span>
          )}
          <span className="px-2 py-0.5 text-[9px] font-semibold text-[#A0A6B1] bg-white/[0.05] border border-white/[0.08] rounded-full">
            {formatCategoryLabel(note.category)}
          </span>
          {(note.tags ?? []).slice(0, 2).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 text-[9px] font-mono text-[#A0A6B1] bg-white/[0.04] rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        <p className="text-[10px] text-[#A0A6B1] mt-auto">
          {formatDate(note.createdAt)} · {formatRelativeTime(note.lastEdited ?? note.updatedAt)} · {note.readingTime ?? 1}m
        </p>
      </div>

      <div className={`flex items-center justify-between z-10 shrink-0 ${listView ? "" : "pt-2.5 mt-2.5 border-t border-white/[0.06]"}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlers.onOpen();
          }}
          className="text-[11px] font-semibold text-purple-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          Open <ArrowUpRight size={11} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="p-1.5 rounded-lg text-[#A0A6B1] hover:text-white hover:bg-white/[0.06] cursor-pointer"
          >
            <MoreHorizontal size={14} />
          </button>
          <AnimatePresence>
            {menuOpen && <NoteActionsMenu note={note} handlers={handlers} onClose={() => setMenuOpen(false)} />}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
