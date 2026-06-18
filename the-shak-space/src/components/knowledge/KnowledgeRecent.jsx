import { motion } from "motion/react";
import { Clock } from "lucide-react";
import KnowledgeCard from "./KnowledgeCard";

export default function KnowledgeRecent({ notes, makeHandlers }) {
  if (notes.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-orange-400" />
        <h2 className="text-sm font-black text-white">Recent Notes</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {notes.map((note, i) => (
          <KnowledgeCard key={note.id} note={note} index={i} handlers={makeHandlers(note)} />
        ))}
      </div>
    </motion.section>
  );
}
