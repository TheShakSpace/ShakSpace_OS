import { motion } from "motion/react";
import { Search, SlidersHorizontal } from "lucide-react";
import { WORKSPACE_CATEGORIES, SORT_OPTIONS, FILTER_OPTIONS } from "../../utils/workspaceHelpers";

export default function WorkspaceFilters({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.1 }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A6B1] pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white outline-none focus:border-[#4F8CFF]/60 transition-colors"
            placeholder="Search by name, description, category, or tags..."
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A6B1] pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="appearance-none bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-8 py-2.5 text-xs text-white outline-none focus:border-[#4F8CFF]/60 cursor-pointer"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#14171C]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#4F8CFF]/60 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#14171C]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {WORKSPACE_CATEGORIES.map((c) => (
          <motion.button
            key={c}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onCategoryChange(c)}
            className={`px-3 py-1 rounded-full text-xs border transition-all cursor-pointer ${
              selectedCategory === c
                ? "bg-[#4F8CFF]/20 border-[#4F8CFF]/60 text-white"
                : "bg-white/[0.03] border-white/[0.10] text-[#A0A6B1] hover:text-white hover:border-[#4F8CFF]/40"
            }`}
          >
            {c}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
