import { motion } from "motion/react";
import { FolderOpen } from "lucide-react";

export default function KnowledgeCollections({ collections, noteCounts, onSelect, activeId }) {
  if (collections.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2.5"
    >
      <h2 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
        <FolderOpen size={15} className="text-[#4F8CFF] shrink-0" />
        Collections
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 auto-rows-fr">
        {collections.map((col, i) => {
          const count = noteCounts[`col-${col.id}`] ?? 0;
          const active = activeId === col.id;

          return (
            <motion.button
              key={col.id}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(col.id)}
              className={`h-full min-h-[96px] p-3.5 rounded-xl border text-left transition-all cursor-pointer backdrop-blur-sm flex flex-col justify-between gap-2 ${
                active
                  ? "bg-[#4F8CFF]/15 border-[#4F8CFF]/40 shadow-md shadow-[#4F8CFF]/10"
                  : "bg-white/[0.03] border-white/[0.08] hover:border-purple-500/30 hover:shadow-md hover:shadow-black/20"
              }`}
            >
              <span className="text-xl leading-none" role="img" aria-hidden>
                {col.icon ?? "📂"}
              </span>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate leading-tight">{col.name}</span>
                <span className="text-[10px] text-[#A0A6B1] mt-0.5 block">{count} notes</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
