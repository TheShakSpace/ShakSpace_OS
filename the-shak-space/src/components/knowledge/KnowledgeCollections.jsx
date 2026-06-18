import { motion } from "motion/react";
import { FolderOpen } from "lucide-react";

export default function KnowledgeCollections({ collections, noteCounts, onSelect, activeId }) {
  if (collections.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h2 className="text-sm font-black text-white flex items-center gap-2">
        <FolderOpen size={16} className="text-[#4F8CFF]" />
        Collections
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {collections.map((col, i) => {
          const count = noteCounts[`col-${col.id}`] ?? 0;
          const active = activeId === col.id;

          return (
            <motion.button
              key={col.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.03, y: -2 }}
              onClick={() => onSelect(col.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                active
                  ? "bg-[#4F8CFF]/15 border-[#4F8CFF]/40"
                  : "bg-white/[0.03] border-white/[0.08] hover:border-purple-500/30"
              }`}
            >
              <span className="text-2xl block mb-2" role="img" aria-hidden>
                {col.icon ?? "📂"}
              </span>
              <span className="text-xs font-bold text-white block truncate">{col.name}</span>
              <span className="text-[10px] text-[#A0A6B1] mt-0.5 block">{count} notes</span>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
