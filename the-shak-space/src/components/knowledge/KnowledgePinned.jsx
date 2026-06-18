import { motion } from "motion/react";
import { Pin } from "lucide-react";
import KnowledgeCard from "./KnowledgeCard";

export default function KnowledgePinned({ notes, makeHandlers }) {
  if (notes.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Pin size={16} className="text-[#4F8CFF]" />
        <h2 className="text-sm font-black text-white">Pinned Notes</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {notes.map((note, i) => (
          <KnowledgeCard key={note.id} note={note} index={i} handlers={makeHandlers(note)} />
        ))}
      </div>
    </motion.section>
  );
}
