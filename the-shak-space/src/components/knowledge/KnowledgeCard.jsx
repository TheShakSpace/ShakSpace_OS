import { motion } from "motion/react";
import {
  FileText,
  Pin,
  Star,
  ArrowUpRight,
  MoreHorizontal,
  Pencil,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  RotateCcw,
  PinOff,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { formatDate, formatRelativeTime } from "../../utils/knowledgeHelpers";

function NoteActionsMenu({ note, handlers, onClose }) {
  const isTrashed = note.trashed;
  const isArchived = note.archived;

  const actions = isTrashed
    ? [
        { label: "Restore", icon: RotateCcw, onClick: handlers.onRestoreFromTrash },
        { label: "Delete Forever", icon: Trash2, onClick: handlers.onPermanentDelete, danger: true },
      ]
    : isArchived
      ? [
          { label: "Restore", icon: ArchiveRestore, onClick: handlers.onRestore },
          { label: "Delete", icon: Trash2, onClick: handlers.onTrash, danger: true },
        ]
      : [
          { label: note.pinned ? "Unpin" : "Pin", icon: note.pinned ? PinOff : Pin, onClick: handlers.onTogglePin },
          { label: note.favorite ? "Unfavorite" : "Favorite", icon: Star, onClick: handlers.onToggleFavorite },
          { label: "Edit", icon: Pencil, onClick: handlers.onEdit },
          { label: "Duplicate", icon: Copy, onClick: handlers.onDuplicate },
          { label: "Archive", icon: Archive, onClick: handlers.onArchive },
          { label: "Move to Trash", icon: Trash2, onClick: handlers.onTrash, danger: true },
        ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.15 }}
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
            className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] transition-colors cursor-pointer ${
              action.danger
                ? "text-red-400 hover:bg-red-500/10"
                : "text-[#A0A6B1] hover:text-white hover:bg-white/[0.05]"
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

export default function KnowledgeCard({ note, handlers, index = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.03 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm relative group overflow-hidden hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-shadow flex flex-col min-h-[200px]"
    >
      <div
        className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-tr ${
          note.collectionColor ?? "from-purple-500/20 to-pink-500/10"
        } blur-2xl opacity-25 group-hover:opacity-45 transition-opacity pointer-events-none`}
      />

      <div className="z-10 flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
            <FileText size={16} />
          </div>
          <div className="flex flex-wrap items-center gap-1 justify-end">
            {note.pinned && !note.trashed && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 text-[8px] font-bold uppercase text-[#4F8CFF] rounded-full">
                <Pin size={8} /> Pinned
              </span>
            )}
            {note.favorite && !note.trashed && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-[8px] font-bold uppercase text-amber-400 rounded-full">
                <Star size={8} /> Favorite
              </span>
            )}
          </div>
        </div>

        <h3 className="text-sm font-bold text-white truncate mb-1">{note.title}</h3>
        <p className="text-xs text-[#A0A6B1] line-clamp-2 mb-3">
          {note.description || "No description."}
        </p>

        {note.collectionName && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/[0.05] border border-white/[0.08] text-[9px] font-bold text-purple-400 rounded-full mb-2">
            {note.collectionIcon && <span role="img" aria-hidden>{note.collectionIcon}</span>}
            {note.collectionName}
          </span>
        )}

        {(note.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(note.tags ?? []).slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-[9px] font-mono text-[#A0A6B1] bg-white/[0.04] border border-white/[0.06] rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#A0A6B1]">
          <span>Created {formatDate(note.createdAt)}</span>
          <span>Updated {formatRelativeTime(note.updatedAt)}</span>
          <span className="font-mono">{note.readTime ?? 1} min read</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06] z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlers.onOpen();
          }}
          className="text-[11px] font-semibold text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          Open <ArrowUpRight size={12} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="p-1.5 rounded-lg text-[#A0A6B1] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Note actions"
          >
            <MoreHorizontal size={14} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <NoteActionsMenu
                note={note}
                handlers={handlers}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
