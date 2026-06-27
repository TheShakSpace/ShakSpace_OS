import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Plus,
  ArrowUpRight,
  FileText,
  Bot,
  Cpu,
  Clock,
  Grid,
  Activity,
  Workflow,
  Briefcase,
  ExternalLink,
  Zap,
} from "lucide-react";
import { useKnowledgeStore } from "../stores/useKnowledgeStore";
import { useAuthStore } from "../stores/useAuthStore";
import { formatDate } from "../utils/knowledgeHelpers";

const LOG_ICON_BY_ACTION = {
  "modified workspace description": Briefcase,
  "optimized prompt performance": Sparkles,
  "triggered workflow": Workflow,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, authLoading } = useAuthStore();
  const initialLoadRef = useRef(false);
  const knowledgeNotes = useKnowledgeStore((s) => s.knowledge);
  const fetchKnowledge = useKnowledgeStore((s) => s.fetchKnowledge);
  const fetchStats = useKnowledgeStore((s) => s.fetchStats);
  const knowledgeStats = useKnowledgeStore((s) => s.stats);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      initialLoadRef.current = false;
      return;
    }
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    fetchKnowledge({ limit: 10, sortBy: "lastEdited" }).catch(() => {});
    fetchStats().catch(() => {});
  }, [authLoading, isAuthenticated, fetchKnowledge, fetchStats]);

  const recentNotes = [...knowledgeNotes]
    .filter((n) => !n.archived)
    .sort((a, b) => new Date(b.lastEdited ?? b.updatedAt) - new Date(a.lastEdited ?? a.updatedAt))
    .slice(0, 3);

  const notes = recentNotes.length
    ? recentNotes
    : [];

  const [workspaces, setWorkspaces] = React.useState([
    { id: "1", name: "Acme Client space", items: 12, category: "Design", updated: "2m ago", color: "from-blue-500/20 to-indigo-500/10" },
    { id: "2", name: "Product Design Hub", items: 8, category: "Product", updated: "45m ago", color: "from-purple-500/20 to-pink-500/10" },
    { id: "3", name: "Marketing Collateral", items: 15, category: "Marketing", updated: "1d ago", color: "from-amber-500/20 to-orange-500/10" },
    { id: "4", name: "Engineering Monorepo", items: 34, category: "Development", updated: "3d ago", color: "from-emerald-500/20 to-teal-500/10" },
  ]);

  const displayNotes = notes.map((n) => ({
    id: n.id,
    title: n.title,
    date: formatDate(n.updatedAt),
    duration: `${n.readingTime ?? 1} min read`,
  }));

  const automations = [
    { id: 1, name: "Auto-sort Incoming Slack Files", trigger: "Slack File Uploaded", action: "Move to Knowledge Hub", active: true },
    { id: 2, name: "Weekly Workspace Summary PDF", trigger: "Every Friday at 5 PM", action: "Generate Document & Email", active: true },
    { id: 3, name: "Sync Notes to GitHub Gist", trigger: "On Note Created", action: "Trigger REST Endpoint", active: false },
  ];

  const [logs, setLogs] = React.useState([
    { id: 1, user: "Shak", action: "modified workspace description", target: "Acme Client Space", time: "10 min ago", iconAction: "modified workspace description" },
    { id: 2, user: "Shak Space Assistant", action: "optimized prompt performance", target: "Knowledge Synthesizer", time: "30 min ago", iconAction: "optimized prompt performance" },
    { id: 3, user: "Agent Runner", action: "triggered workflow", target: "Sync Notes -> Slack", time: "2 hrs ago", iconAction: "triggered workflow" },
  ]);

  const addNewLog = (user, action, target, iconAction) => {
    setLogs((prev) => [{ id: Date.now(), user, action, target, time: "Just now", iconAction }, ...prev.slice(0, 5)]);
  };

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
    addNewLog("Shak", "created new workspace", newWs.name, "modified workspace description");
  };

  const handleAddNewNote = () => {
    navigate("/knowledge");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* SECTION 1: Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-white/[0.04] to-transparent border border-[rgba(255,255,255,0.08)] rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#4F8CFF]/10 to-transparent pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 text-xs text-[#4F8CFF] font-medium tracking-wide mb-1">
            <Sparkles size={14} className="animate-pulse" />
            <span>INTERNET OPERATING SYSTEM ONLINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Welcome to The Shak Space</h1>
          <p className="text-sm text-[#A0A6B1] mt-1.5 max-w-xl">
            An ecosystem designed to integrate workflows, automate pipelines, and centralize key knowledge in an beautiful desktop dashboard.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto">
          <span className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] text-xs rounded-xl text-[#A0A6B1]">v1.0.4 Hotfix</span>
          <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-xs rounded-xl text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Host Live
          </span>
        </div>
      </div>

      {/* SECTION 2: Quick Actions */}
      <div>
        <h2 className="text-xs font-bold text-[#A0A6B1] tracking-widest uppercase mb-3">Quick System Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            id="action-new-workspace"
            onClick={handleAddNewWorkspace}
            className="p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-[rgba(255,255,255,0.08)] hover:border-white/20 rounded-2xl transition-all duration-250 cursor-pointer flex flex-col items-start gap-4 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-[#4F8CFF]/15 text-[#4F8CFF] group-hover:scale-110 transition-transform">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-[#4F8CFF] transition-colors flex items-center gap-1">
                New Workspace <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-[11px] text-[#A0A6B1] mt-0.5">Spin up a folder partition</p>
            </div>
          </button>

          <button
            id="action-new-note"
            onClick={handleAddNewNote}
            className="p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-[rgba(255,255,255,0.08)] hover:border-white/20 rounded-2xl transition-all duration-250 cursor-pointer flex flex-col items-start gap-4 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 group-hover:scale-110 transition-transform">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors flex items-center gap-1">
                New Document <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-[11px] text-[#A0A6B1] mt-0.5">Add premium research state</p>
            </div>
          </button>

          <button
            id="action-ask-ai"
            onClick={() => navigate("/ai")}
            className="p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-[rgba(255,255,255,0.08)] hover:border-white/20 rounded-2xl transition-all duration-250 cursor-pointer flex flex-col items-start gap-4 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400 group-hover:scale-110 transition-transform">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-1">
                Ask AI Synthesizer <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-[11px] text-[#A0A6B1] mt-0.5">Interrogate local indexes</p>
            </div>
          </button>

          <button
            id="action-automation"
            onClick={() => navigate("/automation")}
            className="p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-[rgba(255,255,255,0.08)] hover:border-white/20 rounded-2xl transition-all duration-250 cursor-pointer flex flex-col items-start gap-4 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
              <Cpu size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                Create Automation <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-[11px] text-[#A0A6B1] mt-0.5">Trigger pipelines real-time</p>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 6: Productivity Widgets (Stats) */}
      <div>
        <h2 className="text-xs font-bold text-[#A0A6B1] tracking-widest uppercase mb-3 text-left">Active Analytics & Widgets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#A0A6B1] uppercase tracking-wider block">Deep Focus timer</span>
              <span className="text-2xl font-black font-mono tracking-tight text-white mt-1 block">
                45m <span className="text-[#4F8CFF] text-xs">/ 60m</span>
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#4F8CFF]/40 flex items-center justify-center animate-spin" style={{ animationDuration: "12s" }}>
              <Clock size={16} className="text-[#4F8CFF]" />
            </div>
          </div>

          <div className="p-5 bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#A0A6B1] uppercase tracking-wider block">Documents Index</span>
              <span className="text-2xl font-black font-mono tracking-tight text-white mt-1 block">{knowledgeStats?.total ?? displayNotes.length} Active</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FileText size={18} className="text-purple-400" />
            </div>
          </div>

          <div className="p-5 bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#A0A6B1] uppercase tracking-wider block">Active Automation Pipelines</span>
              <span className="text-2xl font-black font-mono tracking-tight text-white mt-1 block">{automations.filter((a) => a.active).length} Running</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Zap size={18} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid layout for major content blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 3: Recent Workspaces Grid */}
          <div className="p-6 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Grid size={16} className="text-[#4F8CFF]" />
                  Index Workspaces Directory
                </h3>
                <p className="text-[11px] text-[#A0A6B1]">Browse interactive partitions initialized inside metadata.</p>
              </div>
              <button
                onClick={handleAddNewWorkspace}
                className="px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-[rgba(255,255,255,0.08)] text-white text-[11px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.12] transition-all relative overflow-hidden group flex flex-col justify-between h-28"
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-tr ${ws.color} blur-xl opacity-40 group-hover:opacity-75 transition-opacity`} />
                  <div className="flex justify-between items-start z-10">
                    <span className="text-[10px] font-bold text-[#A0A6B1] bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                      {ws.category}
                    </span>
                    <span className="text-[10px] text-[#A0A6B1]">{ws.updated}</span>
                  </div>
                  <div className="z-10">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#4F8CFF] transition-colors">{ws.name}</h4>
                    <p className="text-[10px] text-[#A0A6B1] mt-0.5">{ws.items} Indexed Documents</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: Activity Feed */}
          <div className="p-6 bg-[#14171C] border border-[rgba(255,255,255,0.08)] rounded-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Activity size={16} className="text-orange-400 animate-pulse" />
              Live V-OS Audit Logs
            </h3>
            <p className="text-[11px] text-[#A0A6B1] mb-4">Chronological operational trails and changes occurring in real-time.</p>

            <div className="space-y-4">
              {logs.map((log) => {
                const LogIcon = LOG_ICON_BY_ACTION[log.iconAction] || Activity;
                return (
                  <div key={log.id} className="flex items-start gap-3 text-xs border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                    <div className="p-1.5 rounded-lg bg-white/[0.04] text-white/60">
                      <LogIcon size={12} />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-white">{log.user}</span>
                      <span className="text-[#A0A6B1]"> {log.action}</span>
                      {log.target && (
                        <span className="font-mono text-[11px] text-[#4F8CFF] bg-[#4F8CFF]/5 px-1.5 py-0.5 rounded ml-1.5">{log.target}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#A0A6B1] shrink-0 font-mono">{log.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: AI Insights and Documents Widget */}
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
            <div className="flex items-center gap-2 text-xs text-orange-400 font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} />
              <span>AI Operating Agent Insight</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-2">System Design Recommendation</h3>
            <p className="text-xs text-[#A0A6B1] leading-relaxed mb-4">
              "We observed you drafted {knowledgeStats?.total ?? displayNotes.length} documents in your knowledge base. I suggest binding a direct GitHub Webhook trigger to automatically push builds on commit logs."
            </p>
            <div className="p-3 bg-[#4F8CFF]/5 border border-[#4F8CFF]/10 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-white">Recommended Action</p>
                <p className="text-[9px] text-[#A0A6B1]">Publish metadata build on Git</p>
              </div>
              <button
                onClick={() => {
                  addNewLog("AI Synthesizer", "activated pipeline", "GitHub Gist Sync", "triggered workflow");
                  alert("Recommendation activated! Synced seamlessly.");
                }}
                className="px-2 py-1 bg-[#4F8CFF] hover:bg-blue-600 text-[10px] text-white font-bold rounded-lg transition-transform cursor-pointer"
              >
                Activate
              </button>
            </div>
          </div>

          <div className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Indexed Documents</h3>
              <span className="text-[10px] font-mono text-[#A0A6B1]">{displayNotes.length} Files</span>
            </div>
            <div className="space-y-3">
              {displayNotes.length === 0 ? (
                <p className="text-xs text-[#A0A6B1] text-center py-4">No notes yet. Create one in Knowledge Hub.</p>
              ) : (
                displayNotes.slice(0, 3).map((note) => (
                <div
                  key={note.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/knowledge/${note.id}`)}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/knowledge/${note.id}`)}
                  className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText size={14} className="text-purple-400 shrink-0" />
                    <span className="text-xs font-medium text-white truncate">{note.title}</span>
                  </div>
                  <span className="text-[10px] text-[#A0A6B1] shrink-0">{note.duration}</span>
                </div>
              ))
              )}
            </div>
            <button
              onClick={() => navigate("/knowledge")}
              className="w-full text-center text-[11px] text-[#4F8CFF] hover:underline mt-4 cursor-pointer flex items-center justify-center gap-1.5 font-semibold"
            >
              Expand Knowledge Hub <ExternalLink size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

