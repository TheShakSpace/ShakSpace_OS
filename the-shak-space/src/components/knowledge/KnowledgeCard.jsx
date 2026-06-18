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

  const hasBadges = (note.pinned && !note.trashed) || (note.favorite && !note.trashed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.025 }}
      whileHover={{ y: -3, scale: 1.008 }}
      className="h-full p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm relative group overflow-hidden hover:border-purple-500/25 hover:shadow-lg hover:shadow-purple-500/[0.06] transition-all duration-200 flex flex-col"
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr ${
          note.collectionColor ?? "from-purple-500/20 to-pink-500/10"
        } blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none`}
      />

      <div className="z-10 flex-1 min-w-0 flex flex-col gap-2">
        {/* Header row: icon + title + badges */}
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
            <FileText size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 flex-1 min-w-0">
                {note.title}
              </h3>
              {hasBadges && (
                <div className="flex items-center gap-1 shrink-0">
                  {note.pinned && !note.trashed && (
                    <span className="inline-flex items-center p-1 rounded-md bg-[#4F8CFF]/15 border border-[#4F8CFF]/25 text-[#4F8CFF]" title="Pinned">
                      <Pin size={10} />
                    </span>
                  )}
                  {note.favorite && !note.trashed && (
                    <span className="inline-flex items-center p-1 rounded-md bg-amber-500/15 border border-amber-500/25 text-amber-400" title="Favorite">
                      <Star size={10} />
                    </span>
                  )}
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#A0A6B1] leading-relaxed line-clamp-2 mt-1">
              {note.description || "No description."}
            </p>
          </div>
        </div>

        {/* Collection + tags row */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-[22px]">
          {note.collectionName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/[0.05] border border-white/[0.08] text-[9px] font-semibold text-purple-400 rounded-full shrink-0">
              {note.collectionIcon && <span role="img" aria-hidden className="text-[10px]">{note.collectionIcon}</span>}
              {note.collectionName}
            </span>
          )}
          {(note.tags ?? []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[9px] font-mono text-[#A0A6B1] bg-white/[0.04] border border-white/[0.06] rounded-md shrink-0"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Metadata */}
        <p className="text-[10px] text-[#A0A6B1] leading-none mt-auto">
          <span>{formatDate(note.createdAt)}</span>
          <span className="mx-1.5 text-white/20">·</span>
          <span>{formatRelativeTime(note.updatedAt)}</span>
          <span className="mx-1.5 text-white/20">·</span>
          <span className="font-mono">{note.readTime ?? 1}m</span>
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/[0.06] z-10 shrink-0">
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
