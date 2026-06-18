import { motion } from "motion/react";
import { FolderGit2, Plus } from "lucide-react";

export default function WorkspaceEmptyState({ onCreate, isFiltered = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="col-span-full py-16 px-6 rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.02] flex flex-col items-center text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4F8CFF]/20 to-indigo-500/10 border border-[#4F8CFF]/20 flex items-center justify-center mb-5"
      >
        <FolderGit2 size={36} className="text-[#4F8CFF]" />
      </motion.div>

      <h3 className="text-lg font-black text-white mb-2">
        {isFiltered ? "No workspaces match your filters" : "No workspaces yet"}
      </h3>
      <p className="text-sm text-[#A0A6B1] max-w-md mb-6">
        {isFiltered
          ? "Try adjusting your search, category, or filter settings to find what you're looking for."
          : "Create your first sandboxed workspace to organize documents, knowledge, AI sessions, and automations."}
      </p>

      {!isFiltered && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCreate}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4F8CFF] text-white hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} />
          Create Workspace
        </motion.button>
      )}
    </motion.div>
  );
}
