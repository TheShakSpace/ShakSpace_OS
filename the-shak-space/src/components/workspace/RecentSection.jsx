import { motion } from "motion/react";
import { Clock } from "lucide-react";
import WorkspaceCard from "./WorkspaceCard";

export default function RecentSection({ workspaces, cardProps }) {
  if (workspaces.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Clock size={18} className="text-orange-400" />
        <div>
          <h2 className="text-lg font-black text-white">Recent Workspaces</h2>
          <p className="text-xs text-[#A0A6B1]">Last 5 spaces you opened.</p>
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
