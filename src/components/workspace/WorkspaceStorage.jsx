import { motion } from "motion/react";
import { HardDrive } from "lucide-react";
import { formatStorage } from "../../utils/workspaceHelpers";

export default function WorkspaceStorage({ used = 0, limit = 1024 }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive size={16} className="text-pink-400" />
          <span className="text-sm font-bold text-white">Storage</span>
        </div>
        <span className="text-xs text-[#A0A6B1] font-mono">
          {formatStorage(used)} / {formatStorage(limit)}
        </span>
      </div>

      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-[#4F8CFF]"
        />
      </div>
      <p className="text-[10px] text-[#A0A6B1] mt-2">{pct}% of quota used</p>
    </div>
  );
}
