import { motion } from "motion/react";
import {
  ArrowUpRight,
  Pin,
  Star,
  FileText,
  BookOpen,
  Bot,
  Cpu,
  HardDrive,
} from "lucide-react";
import { formatDate, formatRelativeTime, formatStorage } from "../../utils/workspaceHelpers";
import WorkspaceActions from "./WorkspaceActions";

const STATUS_STYLES = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  idle: "bg-white/[0.06] text-[#A0A6B1] border-white/[0.10]",
  syncing: "bg-[#4F8CFF]/15 text-[#4F8CFF] border-[#4F8CFF]/30",
};

export default function WorkspaceCard({
  workspace,
  onEnter,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleFavorite,
  onArchive,
  onRestore,
  onDuplicate,
  index = 0,
}) {
  const statusClass = STATUS_STYLES[workspace.status] ?? STATUS_STYLES.active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm flex flex-col relative group overflow-hidden min-h-[280px] hover:border-[#4F8CFF]/30 hover:shadow-lg hover:shadow-[#4F8CFF]/5 transition-shadow"
    >
      <div
        className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-tr ${
          workspace.color ?? "from-blue-500/20 to-indigo-500/10"
        } blur-2xl opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none`}
      />

      <div className="z-10 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl shrink-0" role="img" aria-hidden>
              {workspace.icon ?? "📁"}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{workspace.name}</h3>
              <div className="flex flex-wrap items-center gap-1 mt-1">
                {workspace.pinned && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 text-[8px] font-bold uppercase text-[#4F8CFF] rounded-full">
                    <Pin size={8} /> Pinned
                  </span>
                )}
                {workspace.favorite && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-[8px] font-bold uppercase text-amber-400 rounded-full">
                    <Star size={8} /> Favorite
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className={`shrink-0 px-2 py-0.5 text-[8px] font-bold uppercase rounded-full border ${statusClass}`}>
            {workspace.status ?? "active"}
          </span>
        </div>

        <span className="self-start px-2 py-0.5 bg-white/[0.05] border border-white/[0.08] text-[9px] font-bold uppercase text-[#4F8CFF] rounded-full mb-2">
          {workspace.category ?? "Development"}
        </span>

        <p className="text-xs text-[#A0A6B1] line-clamp-2 mb-3 flex-1">
          {workspace.description || "No description provided."}
        </p>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] text-[#A0A6B1] mb-3">
          <span>Created: {formatDate(workspace.createdAt)}</span>
          <span>Opened: {formatRelativeTime(workspace.lastOpened)}</span>
          <span className="flex items-center gap-1">
            <FileText size={10} className="text-purple-400" />
            {workspace.documents ?? 0} docs
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={10} className="text-emerald-400" />
            {workspace.knowledge ?? 0} knowledge
          </span>
          <span className="flex items-center gap-1">
            <Bot size={10} className="text-orange-400" />
            {workspace.aiChats ?? 0} AI
          </span>
          <span className="flex items-center gap-1">
            <Cpu size={10} className="text-cyan-400" />
            {workspace.automations ?? 0} auto
          </span>
          <span className="flex items-center gap-1 col-span-2">
            <HardDrive size={10} className="text-pink-400" />
            {formatStorage(workspace.storage ?? 0)} used
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] z-10 mt-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEnter();
          }}
          className="text-[11px] font-semibold text-[#4F8CFF] hover:underline flex items-center gap-1 cursor-pointer"
        >
          Enter Workspace <ArrowUpRight size={12} />
        </button>

        <WorkspaceActions
          workspace={workspace}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          onToggleFavorite={onToggleFavorite}
          onArchive={onArchive}
          onRestore={onRestore}
          onDuplicate={onDuplicate}
          compact
        />
      </div>
    </motion.div>
  );
}
