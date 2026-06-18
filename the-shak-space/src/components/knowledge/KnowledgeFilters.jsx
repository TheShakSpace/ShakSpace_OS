import { motion } from "motion/react";
import { NOTE_SORT_OPTIONS, NOTE_FILTER_OPTIONS } from "../../utils/knowledgeHelpers";

const selectClass = (height) =>
  `appearance-none ${height} min-w-[108px] bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 text-xs text-white outline-none focus:border-purple-500/60 cursor-pointer shrink-0`;

export default function KnowledgeFilters({
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  selectedTag,
  onTagChange,
  tags = [],
  controlHeight = "h-10",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto md:shrink-0"
    >
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className={selectClass(controlHeight)}
      >
        {NOTE_FILTER_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id} className="bg-[#14171C]">
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className={selectClass(controlHeight)}
      >
        {NOTE_SORT_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id} className="bg-[#14171C]">
            {opt.label}
          </option>
        ))}
      </select>

      {tags.length > 0 && (
        <select
          value={selectedTag}
          onChange={(e) => onTagChange(e.target.value)}
          className={`${selectClass(controlHeight)} min-w-[96px] max-w-[140px]`}
        >
          <option value="" className="bg-[#14171C]">All Tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag} className="bg-[#14171C]">
              #{tag}
            </option>
          ))}
        </select>
      )}
    </motion.div>
  );
}
