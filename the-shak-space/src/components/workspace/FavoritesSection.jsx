import { motion } from "motion/react";
import { Star } from "lucide-react";
import WorkspaceCard from "./WorkspaceCard";

export default function FavoritesSection({ workspaces, cardProps }) {
  if (workspaces.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Star size={18} className="text-amber-400" />
        <div>
          <h2 className="text-lg font-black text-white">Favorites</h2>
          <p className="text-xs text-[#A0A6B1]">Quick access to starred workspaces.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace, i) => (
          <WorkspaceCard key={workspace.id} workspace={workspace} index={i} {...cardProps(workspace)} />
        ))}
      </div>
    </motion.section>
  );
}
