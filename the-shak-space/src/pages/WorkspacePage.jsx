import React from "react";
import { motion } from "motion/react";
import { Plus, ArrowUpRight } from "lucide-react";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = React.useState([
    { id: "1", name: "Acme Client space", items: 12, category: "Design", updated: "2m ago", color: "from-blue-500/20 to-indigo-500/10" },
    { id: "2", name: "Product Design Hub", items: 8, category: "Product", updated: "45m ago", color: "from-purple-500/20 to-pink-500/10" },
    { id: "3", name: "Marketing Collateral", items: 15, category: "Marketing", updated: "1d ago", color: "from-amber-500/20 to-orange-500/10" },
    { id: "4", name: "Engineering Monorepo", items: 34, category: "Development", updated: "3d ago", color: "from-emerald-500/20 to-teal-500/10" },
  ]);

  const handleAddNewWorkspace = () => {
    const names = ["Aperture Science Hub", "Vector Sync Platform", "Black Mesa Portal", "Oasis Sandbox"];
    const cats = ["Research", "Platform", "Engineering", "Design"];
    const colors = [
      "from-rose-500/20 to-red-500/10",
      "from-cyan-500/20 to-blue-500/10",
      "from-indigo-500/20 to-purple-500/10",
      "from-violet-500/20 to-fuchsia-500/10",
    ];
    const index = Math.floor(Math.random() * names.length);
    const newWs = {
      id: String(Date.now()),
      name: names[index],
      items: Math.floor(Math.random() * 20) + 1,
      category: cats[index],
      updated: "Just now",
      color: colors[index],
    };
    setWorkspaces([newWs, ...workspaces]);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-white/[0.08] pb-5">
        <h1 className="text-2xl font-black text-white">Workspaces</h1>
        <p className="text-xs text-[#A0A6B1] mt-1">
          Manage your isolated directories, project contexts, and external assets pipelines under sandboxed boundaries.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <motion.div 
            whileHover={{ y: -4 }}
            key={ws.id} 
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between h-44 relative group overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr ${ws.color} blur-2xl opacity-30`} />
            <div className="z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.08] text-[9px] font-bold uppercase text-[#4F8CFF] rounded-full">
                  {ws.category}
                </span>
                <span className="text-[10px] text-[#A0A6B1]">{ws.updated}</span>
              </div>
              <h3 className="text-sm font-bold text-white block truncate">{ws.name}</h3>
              <p className="text-xs text-[#A0A6B1] mt-1 line-clamp-2">Contains dynamic code representations, metadata guidelines, and live assets sync.</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-4 z-10">
              <span className="text-[11px] text-[#A0A6B1]">{ws.items} items indexed</span>
              <button className="text-[11px] text-[#4F8CFF] hover:underline flex items-center gap-1 cursor-pointer">
                Enter Space <ArrowUpRight size={12} />
              </button>
            </div>
          </motion.div>
        ))}

        {/* New workspace trigger card */}
        <button 
          onClick={handleAddNewWorkspace}
          className="p-5 rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-[#4F8CFF]/50 hover:bg-white/[0.02] flex flex-col items-center justify-center text-center gap-2.5 h-44 transition-all cursor-pointer group"
        >
          <div className="p-3 rounded-full bg-white/[0.04] text-[#A0A6B1] group-hover:text-white group-hover:scale-115 transition-all">
            <Plus size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-white">Create New Workspace</span>
            <p className="text-[10px] text-[#A0A6B1] mt-0.5">Partition system directory</p>
          </div>
        </button>
      </div>
    </div>
  );
}
