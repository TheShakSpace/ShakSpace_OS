import {
  Pin,
  PinOff,
  Pencil,
  Trash2,
  Star,
  Archive,
  ArchiveRestore,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function WorkspaceActions({
  workspace,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleFavorite,
  onArchive,
  onRestore,
  onDuplicate,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const actions = workspace.archived
    ? [
        { label: "Restore", icon: ArchiveRestore, onClick: onRestore },
        { label: "Delete", icon: Trash2, onClick: onDelete, danger: true },
      ]
    : [
        {
          label: workspace.pinned ? "Unpin" : "Pin",
          icon: workspace.pinned ? PinOff : Pin,
          onClick: onTogglePin,
        },
        {
          label: workspace.favorite ? "Unfavorite" : "Favorite",
          icon: Star,
          onClick: onToggleFavorite,
        },
        { label: "Edit", icon: Pencil, onClick: onEdit },
        { label: "Duplicate", icon: Copy, onClick: onDuplicate },
        { label: "Archive", icon: Archive, onClick: onArchive },
        { label: "Delete", icon: Trash2, onClick: onDelete, danger: true },
      ];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" ref={ref}>
        {!workspace.archived && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className="p-1.5 rounded-lg text-[#A0A6B1] hover:text-[#4F8CFF] hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label={workspace.pinned ? "Unpin workspace" : "Pin workspace"}
          >
            {workspace.pinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 rounded-lg text-[#A0A6B1] hover:text-[#4F8CFF] hover:bg-white/[0.06] transition-colors cursor-pointer"
          aria-label="Edit workspace"
        >
          <Pencil size={14} />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className="p-1.5 rounded-lg text-[#A0A6B1] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="More actions"
          >
            <MoreHorizontal size={14} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 bottom-full mb-1 w-40 py-1 rounded-xl bg-[#14171C] border border-white/[0.10] shadow-xl z-50"
              >
                {actions
                  .filter((a) => a.label !== "Edit" && !a.label.includes("Pin"))
                  .map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(false);
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
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2" ref={ref}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className={`text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
              action.danger
                ? "text-[#A0A6B1] hover:text-red-400"
                : "text-[#4F8CFF] hover:underline"
            }`}
          >
            <Icon size={13} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
