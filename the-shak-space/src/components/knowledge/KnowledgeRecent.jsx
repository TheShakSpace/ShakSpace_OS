import { motion } from "motion/react";
import { Clock } from "lucide-react";
import KnowledgeCard from "./KnowledgeCard";

export default function KnowledgeRecent({ notes, makeHandlers }) {
  if (notes.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2.5"
    >
      <div className="flex items-center gap-2">
        <Clock size={15} className="text-orange-400 shrink-0" />
        <h2 className="text-sm font-black text-white tracking-tight">Recent Notes</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr">
        {notes.map((note, i) => (
          <KnowledgeCard key={note.id} note={note} index={i} handlers={makeHandlers(note)} />
        ))}
      </div>
    </motion.section>
  );
}
