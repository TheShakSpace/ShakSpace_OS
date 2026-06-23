import { motion } from "motion/react";
import {
  FileText,
  BookOpen,
  Bot,
  Cpu,
  Users,
  Settings,
  Activity,
  LayoutGrid,
} from "lucide-react";
import WorkspaceStats from "./WorkspaceStats";
import WorkspaceActivity from "./WorkspaceActivity";
import WorkspaceStorage from "./WorkspaceStorage";
import WorkspaceActions from "./WorkspaceActions";
import WorkspaceKnowledgeList from "./WorkspaceKnowledgeList";
import { formatDate, formatCategoryLabel } from "../../utils/workspaceHelpers";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "ai", label: "AI Sessions", icon: Bot },
  { id: "automations", label: "Automations", icon: Cpu },
  { id: "members", label: "Members", icon: Users },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
];

function PlaceholderPanel({ title, count, icon: Icon }) {
  return (
    <div className="p-8 rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.02] text-center">
      <Icon size={32} className="text-[#4F8CFF] mx-auto mb-3 opacity-60" />
      <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-[#A0A6B1]">
        {count > 0 ? `${count} items indexed in this workspace.` : "No items yet. Content will appear here as you build."}
      </p>
    </div>
  );
}

export default function WorkspaceDetails({
  workspace,
  activeTab,
  onTabChange,
  onBack,
  actionHandlers,
}) {
  if (!workspace) return null;

  const accentHex = workspace.accentColor ?? "#4F8CFF";

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] overflow-hidden"
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 blur-3xl opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle at top right, ${accentHex}55, transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-[#A0A6B1] hover:text-white mb-4 cursor-pointer transition-colors"
          >
            ← Back to Workspaces
          </button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl" role="img" aria-hidden>
                {workspace.icon ?? "📁"}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-black text-white">
                    {workspace.name}
                  </h1>
                  <span className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.10] text-[9px] font-bold uppercase text-[#4F8CFF] rounded-full">
                    {formatCategoryLabel(workspace.category)}
                  </span>
                </div>
                <p className="text-sm text-[#A0A6B1] max-w-xl">
                  {workspace.description || "No description."}
                </p>
                <p className="text-[11px] text-[#A0A6B1] mt-2">
                  Created {formatDate(workspace.createdAt)}
                  {workspace.tags?.length > 0 && (
                    <span className="ml-2">
                      · {(workspace.tags ?? []).map((t) => `#${t}`).join(" ")}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <WorkspaceActions workspace={workspace} {...actionHandlers} />
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold transition-colors cursor-pointer ${
                active
                  ? "text-white bg-white/[0.06] border border-white/[0.10] border-b-transparent -mb-px"
                  : "text-[#A0A6B1] hover:text-white"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "overview" && (
          <div className="space-y-6">
            <WorkspaceStats workspace={workspace} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-orange-400" />
                  Recent Activity
                </h3>
                <WorkspaceActivity activities={(workspace.activity ?? []).slice(0, 5)} />
              </div>
              <WorkspaceStorage used={workspace.storage ?? 0} />
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <PlaceholderPanel title="Documents" count={workspace.documents ?? 0} icon={FileText} />
        )}
        {activeTab === "knowledge" && (
          <WorkspaceKnowledgeList workspaceId={workspace.id} />
        )}
        {activeTab === "ai" && (
          <PlaceholderPanel title="AI Sessions" count={workspace.aiChats ?? 0} icon={Bot} />
        )}
        {activeTab === "automations" && (
          <PlaceholderPanel title="Automations" count={workspace.automations ?? 0} icon={Cpu} />
        )}
        {activeTab === "members" && (
          <PlaceholderPanel title="Members" count={1} icon={Users} />
        )}
        {activeTab === "activity" && (
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <WorkspaceActivity activities={workspace.activity ?? []} />
          </div>
        )}
        {activeTab === "settings" && (
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <h3 className="text-sm font-bold text-white">Workspace Settings</h3>
            <p className="text-xs text-[#A0A6B1]">
              Status: <span className="text-white font-medium">{workspace.status ?? "active"}</span>
            </p>
            <p className="text-xs text-[#A0A6B1]">
              Pinned: <span className="text-white font-medium">{workspace.pinned ? "Yes" : "No"}</span>
            </p>
            <p className="text-xs text-[#A0A6B1]">
              Favorite: <span className="text-white font-medium">{workspace.favorite ? "Yes" : "No"}</span>
            </p>
            <p className="text-xs text-[#A0A6B1]">
              Archived: <span className="text-white font-medium">{workspace.archived ? "Yes" : "No"}</span>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
