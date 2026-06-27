import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, Pin, Star, Archive, Trash2, Pencil } from "lucide-react";

export default function ConversationSettings({
  conversation,
  onRename,
  onTogglePin,
  onToggleFavorite,
  onArchive,
  onDelete,
}) {
  const [open, setOpen] = useState(false);

  const items = [
    { label: "Rename", icon: Pencil, onClick: onRename },
    { label: conversation.pinned ? "Unpin" : "Pin", icon: Pin, onClick: onTogglePin },
    { label: conversation.favorite ? "Unfavorite" : "Favorite", icon: Star, onClick: onToggleFavorite },
    { label: "Archive", icon: Archive, onClick: onArchive },
    { label: "Delete", icon: Trash2, onClick: onDelete, danger: true },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-xl text-[#A0A6B1] hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-colors cursor-pointer"
        aria-label="Conversation settings"
      >
        <Settings size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              className="absolute right-0 top-full mt-1 w-44 py-1 rounded-xl bg-[#14171C] border border-white/[0.10] shadow-xl z-50"
            >
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      item.onClick();
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] cursor-pointer ${
                      item.danger
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-[#A0A6B1] hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    <Icon size={12} />
                    {item.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
