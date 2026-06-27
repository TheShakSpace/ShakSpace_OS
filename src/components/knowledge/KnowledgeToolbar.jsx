import { motion } from "motion/react";
import { Plus } from "lucide-react";
import KnowledgeSearch from "./KnowledgeSearch";
import KnowledgeFilters from "./KnowledgeFilters";

const CONTROL_HEIGHT = "h-10";

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
  workspaceFilter,
  onWorkspaceFilterChange,
  workspaces = [],
  selectedCategory,
  onCategoryChange,
  categories = [],
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.05 }}
      className="space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">{viewTitle}</h2>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewNote}
          className={`${CONTROL_HEIGHT} px-4 bg-purple-500 hover:brightness-110 font-bold text-xs text-white rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer`}
        >
          <Plus size={14} /> New Note
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2.5">
        <KnowledgeSearch value={search} onChange={onSearchChange} className={CONTROL_HEIGHT} />
        <KnowledgeFilters
          sortBy={sortBy}
          onSortChange={onSortChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          selectedTag={selectedTag}
          onTagChange={onTagChange}
          tags={tags}
          controlHeight={CONTROL_HEIGHT}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <select
          value={workspaceFilter}
          onChange={(e) => onWorkspaceFilterChange(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white outline-none cursor-pointer"
        >
          <option value="" className="bg-[#14171C]">All workspaces</option>
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id} className="bg-[#14171C]">
              {ws.name}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onCategoryChange(c.value)}
              className={`px-3 py-1 rounded-full text-xs border cursor-pointer ${
                selectedCategory === c.value
                  ? "bg-purple-500/20 border-purple-500/50 text-white"
                  : "bg-white/[0.03] border-white/10 text-[#A0A6B1]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
