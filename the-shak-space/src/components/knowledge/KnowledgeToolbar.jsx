import { motion } from "motion/react";
import { Plus } from "lucide-react";
import KnowledgeSearch from "./KnowledgeSearch";
import KnowledgeFilters from "./KnowledgeFilters";

export default function KnowledgeToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  selectedTag,
  onTagChange,
  tags,
  onNewNote,
  viewTitle,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.05 }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-black text-white">{viewTitle}</h2>
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewNote}
          className="px-4 py-2 bg-purple-500 hover:brightness-110 font-bold text-xs text-white rounded-xl flex items-center gap-2 cursor-pointer transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus size={14} /> New Note
        </motion.button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <KnowledgeSearch value={search} onChange={onSearchChange} />
        <KnowledgeFilters
          sortBy={sortBy}
          onSortChange={onSortChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          selectedTag={selectedTag}
          onTagChange={onTagChange}
          tags={tags}
        />
      </div>
    </motion.div>
  );
}
