import { motion } from "motion/react";
import { Search } from "lucide-react";

export default function KnowledgeSearch({ value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative flex-1 min-w-[200px]"
    >
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A6B1] pointer-events-none"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/60 transition-colors"
        placeholder="Search title, description, tags, collection..."
      />
    </motion.div>
  );
}
