import { motion } from "motion/react";
import { BookOpen, Plus } from "lucide-react";

export default function KnowledgeEmptyState({ onCreate, isFiltered = false, viewLabel = "notes" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="col-span-full py-12 px-6 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.02] flex flex-col items-center text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/20 flex items-center justify-center mb-5"
      >
        <BookOpen size={36} className="text-purple-400" />
      </motion.div>

      <h3 className="text-lg font-black text-white mb-2">
        {isFiltered ? `No ${viewLabel} match your filters` : `No ${viewLabel} yet`}
      </h3>
      <p className="text-sm text-[#A0A6B1] max-w-md mb-6">
        {isFiltered
          ? "Try adjusting your search, tags, or filter settings."
          : "Create your first note to start building your knowledge base."}
      </p>

      {!isFiltered && onCreate && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCreate}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-500 text-white hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} />
          New Note
        </motion.button>
      )}
    </motion.div>
  );
}
