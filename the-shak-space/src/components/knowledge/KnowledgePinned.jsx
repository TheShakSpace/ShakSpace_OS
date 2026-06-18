import { motion } from "motion/react";
import { Pin } from "lucide-react";
import KnowledgeCard from "./KnowledgeCard";

export default function KnowledgePinned({ notes, makeHandlers }) {
  if (notes.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2.5"
    >
      <div className="flex items-center gap-2">
        <Pin size={15} className="text-[#4F8CFF] shrink-0" />
        <h2 className="text-sm font-black text-white tracking-tight">Pinned Notes</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr">
        {notes.map((note, i) => (
          <KnowledgeCard key={note.id} note={note} index={i} handlers={makeHandlers(note)} />
        ))}
      </div>
    </motion.section>
  );
}
