import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Search, Pin, Star, Clock, MessageSquare } from "lucide-react";
import ConversationCard from "./ConversationCard";

export default function ConversationSidebar({
  conversations,
  activeId,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
  onTogglePin,
  onToggleFavorite,
  onArchive,
  onRestore,
}) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const pinned = conversations.filter((c) => c.pinned && !c.archived);
  const favorites = conversations.filter((c) => c.favorite && !c.archived && !c.pinned);
  const recent = conversations
    .filter((c) => !c.archived && !c.pinned && !c.favorite)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const archived = conversations.filter((c) => c.archived);

  const showList =
    filter === "archived"
      ? archived
      : filter === "pinned"
        ? pinned
        : filter === "favorites"
          ? favorites
          : [];

  const startRename = (conv) => {
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const submitRename = (id) => {
    onRename(id, renameValue);
    setRenamingId(null);
  };

  const renderSection = (title, icon, items) => {
    if (!items.length || filter !== "all") return null;
    const Icon = icon;
    return (
      <div className="space-y-1">
        <p className="px-2.5 py-1.5 text-[9px] font-bold text-[#A0A6B1] uppercase tracking-widest flex items-center gap-1.5">
          <Icon size={10} className="text-[#4F8CFF]/70" />
          {title}
          <span className="ml-auto font-mono text-[8px] opacity-60">{items.length}</span>
        </p>
        {items.map((c) => renderCard(c))}
      </div>
    );
  };

  const renderCard = (c) => {
    if (renamingId === c.id) {
      return (
        <div key={c.id} className="p-2" onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRename(c.id);
              if (e.key === "Escape") setRenamingId(null);
            }}
            onBlur={() => submitRename(c.id)}
            className="w-full px-3 py-2 text-xs bg-white/[0.06] border border-[#4F8CFF]/40 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#4F8CFF]/30"
          />
        </div>
      );
    }

    return (
      <ConversationCard
        key={c.id}
        conversation={c}
        active={activeId === c.id}
        onSelect={() => onSelect(c.id)}
        onRename={() => startRename(c)}
        onDelete={() => onDelete(c.id)}
        onTogglePin={() => onTogglePin(c.id)}
        onToggleFavorite={() => onToggleFavorite(c.id)}
        onArchive={() => onArchive(c.id)}
        onRestore={() => onRestore(c.id)}
      />
    );
  };

  const filters = [
    { id: "all", label: "All" },
    { id: "pinned", label: "Pinned" },
    { id: "favorites", label: "Stars" },
    { id: "archived", label: "Archive" },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full lg:w-[280px] xl:w-[300px] shrink-0 flex flex-col rounded-2xl border border-white/[0.08] bg-[#14171C]/40 backdrop-blur-xl overflow-hidden max-h-[calc(100vh-180px)] lg:max-h-[calc(100vh-140px)] shadow-xl shadow-black/20"
    >
      <div className="p-3.5 border-b border-white/[0.06] space-y-3 shrink-0 bg-white/[0.02]">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#6BA3FF] text-white text-xs font-bold cursor-pointer hover:brightness-110 transition-all shadow-lg shadow-[#4F8CFF]/20"
        >
          <Plus size={15} strokeWidth={2.5} />
          New Chat
        </motion.button>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A6B1]" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations…"
            className="w-full h-9 pl-9 pr-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-white outline-none focus:border-[#4F8CFF]/50 focus:bg-white/[0.06] transition-colors placeholder:text-white/25"
          />
        </div>

        <div className="flex gap-1 p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                filter === f.id
                  ? "bg-[#4F8CFF]/20 text-white shadow-sm"
                  : "text-[#A0A6B1] hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
        {filter === "all" ? (
          <>
            {renderSection("Pinned", Pin, pinned)}
            {renderSection("Favorites", Star, favorites)}
            {recent.length > 0 && (
              <div className="space-y-1">
                <p className="px-2.5 py-1.5 text-[9px] font-bold text-[#A0A6B1] uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={10} className="text-[#4F8CFF]/70" />
                  Recent
                  <span className="ml-auto font-mono text-[8px] opacity-60">{recent.length}</span>
                </p>
                {recent.map((c) => renderCard(c))}
              </div>
            )}
            {!pinned.length && !favorites.length && !recent.length && (
              <div className="text-center py-12 px-4">
                <MessageSquare size={24} className="text-[#A0A6B1]/40 mx-auto mb-2" />
                <p className="text-xs text-[#A0A6B1]">No conversations yet</p>
                <p className="text-[10px] text-[#A0A6B1]/60 mt-1">Start a new chat to begin</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-1">
            {showList.length === 0 ? (
              <p className="text-xs text-[#A0A6B1] text-center py-12">No conversations found</p>
            ) : (
              showList.map((c) => renderCard(c))
            )}
          </div>
        )}
      </div>
    </motion.aside>
  );
}
