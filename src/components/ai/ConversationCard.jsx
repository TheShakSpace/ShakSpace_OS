import { motion } from "motion/react";
import { Pin, Star, MessageSquare, MoreHorizontal, Pencil, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { formatRelativeTime, getModelById } from "../../utils/aiHelpers";

export default function ConversationCard({
  conversation,
  active,
  onSelect,
  onRename,
  onDelete,
  onTogglePin,
  onToggleFavorite,
  onArchive,
  onRestore,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);
  const model = getModelById(conversation.model);
  const msgCount = conversation.messages?.length ?? 0;
  const preview =
    conversation.messages?.[conversation.messages.length - 1]?.content?.replace(/\n/g, " ").slice(0, 72) ||
    "Start a new conversation…";

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const actions = conversation.archived
    ? [
        { label: "Restore", icon: ArchiveRestore, onClick: onRestore },
        { label: "Delete", icon: Trash2, onClick: onDelete, danger: true },
      ]
    : [
        { label: conversation.pinned ? "Unpin" : "Pin", icon: Pin, onClick: onTogglePin },
        { label: conversation.favorite ? "Unfavorite" : "Favorite", icon: Star, onClick: onToggleFavorite },
        { label: "Rename", icon: Pencil, onClick: onRename },
        { label: "Archive", icon: Archive, onClick: onArchive },
        { label: "Delete", icon: Trash2, onClick: onDelete, danger: true },
      ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`w-full text-left p-3 rounded-xl transition-all duration-200 cursor-pointer group relative border ${
        active
          ? "bg-[#4F8CFF]/12 border-[#4F8CFF]/35 shadow-md shadow-[#4F8CFF]/10"
          : "bg-white/[0.02] border-transparent hover:bg-white/[0.05] hover:border-white/[0.08]"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold ${
            active ? "bg-[#4F8CFF]/20 text-[#4F8CFF]" : "bg-white/[0.06] text-[#A0A6B1]"
          }`}
        >
          {conversation.title?.charAt(0)?.toUpperCase() ?? "C"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            {conversation.pinned && <Pin size={9} className="text-[#4F8CFF] shrink-0" />}
            {conversation.favorite && <Star size={9} className="text-amber-400 shrink-0 fill-amber-400/30" />}
            <span className="text-xs font-semibold text-white truncate leading-tight">{conversation.title}</span>
          </div>

          <p className="text-[10px] text-[#A0A6B1] line-clamp-2 leading-relaxed">{preview}</p>

          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2">
            <span className="inline-flex items-center gap-1 text-[9px] text-[#A0A6B1]">
              <MessageSquare size={9} />
              {msgCount}
            </span>
            <span className="text-[9px] font-mono text-[#4F8CFF] bg-[#4F8CFF]/10 px-1.5 py-0.5 rounded border border-[#4F8CFF]/20">
              {model.badge}
            </span>
            <span className="text-[9px] text-[#A0A6B1]">{formatRelativeTime(conversation.updatedAt)}</span>
          </div>
        </div>

        <div className="relative shrink-0" ref={ref}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              menuOpen
                ? "opacity-100 bg-white/[0.08] text-white"
                : "opacity-0 group-hover:opacity-100 text-[#A0A6B1] hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            <MoreHorizontal size={14} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 w-44 py-1 rounded-xl bg-[#14171C]/95 backdrop-blur-xl border border-white/[0.10] shadow-2xl z-50"
              >
                {actions.map((a) => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.label}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        a.onClick();
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] cursor-pointer transition-colors ${
                        a.danger ? "text-red-400 hover:bg-red-500/10" : "text-[#A0A6B1] hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      <Icon size={12} />
                      {a.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
