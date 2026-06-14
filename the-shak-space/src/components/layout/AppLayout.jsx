import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  FolderGit2,
  BookOpen,
  Bot,
  Cpu,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sparkles,
  Clock,
  Briefcase,
  Grid,
  Plus,
  ArrowUpRight,
  FileText,
  Activity,
  Workflow,
  ExternalLink,
  Sliders,
  Send,
  Zap,
} from "lucide-react";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "workspaces", label: "Workspaces", icon: FolderGit2 },
  { id: "knowledge-hub", label: "Knowledge Hub", icon: BookOpen },
  { id: "ai-assistant", label: "AI Assistant", icon: Bot },
  { id: "automation", label: "Automation", icon: Cpu },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "System optimized successfully", time: "10m ago", read: false },
    { id: 2, text: "New workspace 'Acme project' created", time: "1h ago", read: true },
    { id: 3, text: "Automation 'Backup Sync' triggered", time: "3h ago", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [workspaces, setWorkspaces] = useState([
    { id: "1", name: "Acme Client space", items: 12, category: "Design", updated: "2m ago", color: "from-blue-500/20 to-indigo-500/10" },
    { id: "2", name: "Product Design Hub", items: 8, category: "Product", updated: "45m ago", color: "from-purple-500/20 to-pink-500/10" },
    { id: "3", name: "Marketing Collateral", items: 15, category: "Marketing", updated: "1d ago", color: "from-amber-500/20 to-orange-500/10" },
    { id: "4", name: "Engineering Monorepo", items: 34, category: "Development", updated: "3d ago", color: "from-emerald-500/20 to-teal-500/10" },
  ]);

  const [notes, setNotes] = useState([
    { id: 1, title: "Product Requirements Doc (PRD)", date: "Jun 14, 2026", duration: "5 min read" },
    { id: 2, title: "Vibe and Aesthetic Guidelines", date: "Jun 12, 2026", duration: "12 min read" },
    { id: 3, title: "Next.js 16 Server Components Plan", date: "Jun 10, 2026", duration: "3 min read" },
  ]);

  const [logs, setLogs] = useState([
    { id: 1, user: "Shak", action: "modified workspace description", target: "Acme Client Space", time: "10 min ago", icon: Briefcase },
    { id: 2, user: "Shak Space Assistant", action: "optimized prompt performance", target: "Knowledge Synthesizer", time: "30 min ago", icon: Sparkles },
    { id: 3, user: "Agent Runner", action: "triggered workflow", target: "Sync Notes -> Slack", time: "2 hrs ago", icon: Workflow },
  ]);

  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { id: 1, role: "assistant", content: "Greetings! I'm your Shak Space AI Assistant. I have indexed your current workspaces, notes, and local automation rules. Ask me anything to generate, summarize, or trigger actions." },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const [automations, setAutomations] = useState([
    { id: 1, name: "Auto-sort Incoming Slack Files", trigger: "Slack File Uploaded", action: "Move to Knowledge Hub", active: true },
    { id: 2, name: "Weekly Workspace Summary PDF", trigger: "Every Friday at 5 PM", action: "Generate Document & Email", active: true },
    { id: 3, name: "Sync Notes to GitHub Gist", trigger: "On Note Created", action: "Trigger REST Endpoint", active: false },
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
    addNewLog("Shak", "created new workspace", newWs.name, Briefcase);
  };

  const handleAddNewNote = () => {
    const defaultTitles = ["Weekly Standup Minutes", "Brainstorming Session Notes", "System Design Architecture", "Marketing Outlines"];
    const title = defaultTitles[Math.floor(Math.random() * defaultTitles.length)];
    const newNote = {
      id: Date.now(),
      title,
      date: "Jun 14, 2026",
      duration: `${Math.floor(Math.random() * 8) + 2} min read`,
    };
    setNotes([newNote, ...notes]);
    addNewLog("Shak", "drafted high-fidelity note", title, FileText);
  };

  const askAiSimulation = (queryText) => {
    const prompt = queryText || aiInput;
    if (!prompt.trim()) return;

    const userMsg = { id: Date.now(), role: "user", content: prompt };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      let reply =
        "I took a look at the system logs. Everything is configured correctly. Let me know if you would like me to build a dashboard widget or start an automation flow.";
      if (prompt.toLowerCase().includes("workspace")) {
        reply = `I registered ${workspaces.length} active workspaces. The latest is '${workspaces[0].name}'. Would you like me to map interactive nodes for them?`;
      } else if (prompt.toLowerCase().includes("note") || prompt.toLowerCase().includes("doc")) {
        reply = `I am analyzing your ${notes.length} saved documents in the Knowledge Hub. Based on 'Product Requirements Doc (PRD)', I suggest forming an automation card to sync checklist progress.`;
      } else if (prompt.toLowerCase().includes("automation") || prompt.toLowerCase().includes("sync")) {
        reply = "Automations are online and healthy. The 'Weekly Workspace Summary PDF' is set to send on Friday. I can add custom Webhooks upon request.";
      }

      setAiMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: reply }]);
      setIsAiTyping(false);
    }, 1000);
  };

  const addNewLog = (user, action, target, icon) => {
    setLogs((prev) => [{ id: Date.now(), user, action, target, time: "Just now", icon }, ...prev.slice(0, 5)]);
  };

  const triggerAskAiTab = () => {
    setActiveTab("ai-assistant");
    setTimeout(() => {
      setAiInput("How can I optimize my current layouts?");
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#FFFFFF] font-sans antialiased flex selection:bg-[#4F8CFF]/30 selection:text-white">
      {/* SIDEBAR */}
      <aside
        className="shrink-0 relative border-r border-[rgba(255,255,255,0.08)] bg-[#14171C] flex flex-col transition-all duration-300 z-30"
        style={{ width: isCollapsed ? "80px" : "260px" }}
      >
        {/* Header */}
        <div className="h-[64px] border-b border-[rgba(255,255,255,0.08)] flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] opacity-90 block hover:scale-105 transition-transform" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] opacity-90 block hover:scale-105 transition-transform" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] opacity-90 block hover:scale-105 transition-transform" />
            </div>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 ml-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#4F8CFF] to-[#80AAFF] flex items-center justify-center text-[11px] font-black tracking-wide text-white shadow-lg shadow-blue-500/20">
                  S
                </div>
                <span className="font-semibold text-sm tracking-tight text-[#FFFFFF]">The Shak Space</span>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 px-1.5 rounded-md hover:bg-white/5 border border-transparent hover:border-white/5 text-[#A0A6B1] hover:text-white transition-all cursor-pointer"
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* User Info */}
        {!isCollapsed ? (
          <div className="px-4 py-4">
            <div className="p-3 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs shadow-md shadow-purple-500/10">
                SH
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">Shak Space Premium</p>
                <p className="text-[10px] text-[#A0A6B1] truncate">Workspace Host</p>
              </div>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="py-4 flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs ring-4 ring-white/5 hover:scale-105 transition-transform cursor-pointer">
              S
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 cursor-pointer group relative ${
                  isActive ? "bg-[#4F8CFF] text-white shadow-lg shadow-[#4F8CFF]/15" : "text-[#A0A6B1] hover:text-white hover:bg-white/5"
                }`}
              >
                <IconComponent
                  size={18}
                  className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? "text-white" : "text-[#A0A6B1] group-hover:text-[#4F8CFF]"
                  }`}
                />
                {!isCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">
                    {item.label}
                  </motion.span>
                )}
                {isActive && !isCollapsed && (
                  <motion.div layoutId="activeIndicator" className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="p-4 m-3 bg-[#4F8CFF]/5 border border-[#4F8CFF]/10 rounded-xl">
            <div className="flex items-center gap-2 mb-1.5 text-[#4F8CFF]">
              <Sparkles size={14} />
              <span className="text-[11px] font-bold tracking-wider uppercase">V-System Engine</span>
            </div>
            <p className="text-[11px] text-[#A0A6B1] leading-relaxed">
              Fully customized UI components, running locally. System health is optimal.
            </p>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* TOPBAR */}
        <header className="h-[64px] border-b border-[rgba(255,255,255,0.08)] bg-[#0F1115]/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/40">
                <Search size={16} className={`${isSearchFocused ? "text-[#4F8CFF]" : "text-white/40"} transition-colors`} />
              </div>
              <input
                type="text"
                placeholder="Search anything via Spotlight... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full bg-[rgba(255,255,255,0.04)] border ${
                  isSearchFocused ? "border-[#4F8CFF] bg-[#14171C] ring-1 ring-[#4F8CFF]/20" : "border-[rgba(255,255,255,0.08)]"
                } rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-white/30 outline-none transition-all duration-200`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[11px] text-[#A0A6B1]">
              <Clock size={12} className="text-[#4F8CFF]" />
              <span className="font-mono">UTC: 2026-06-14</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-[#A0A6B1] hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer relative"
              >
                <Bell size={16} />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-[#0F1115]" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-[#14171C] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-xl shadow-black/50 z-50 p-4"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(255,255,255,0.06)]">
                      <h4 className="text-xs font-semibold text-white">Notifications</h4>
                      <button
                        onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                        className="text-[10px] text-[#4F8CFF] hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="space-y-2">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.03] flex flex-col gap-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-white font-medium">{notif.text}</span>
                            {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                          </div>
                          <span className="text-[9px] text-[#A0A6B1]">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-xl">
              <span className="text-xs font-semibold font-mono text-white">shak_space</span>
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#4F8CFF] to-[#80AAFF] text-[10px] text-white flex items-center justify-center font-bold shadow-md">
                SK
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {activeTab === "dashboard" && renderDashboard()}
              {activeTab === "workspaces" && renderWorkspaces()}
              {activeTab === "knowledge-hub" && renderKnowledgeHub()}
              {activeTab === "ai-assistant" && renderAIAssistant()}
              {activeTab === "automation" && renderAutomations()}
              {activeTab === "settings" && renderSettings()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );

  function renderDashboard() {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-white/[0.04] to-transparent border border-[rgba(255,255,255,0.08)] rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#4F8CFF]/10 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 text-xs text-[#4F8CFF] font-medium tracking-wide mb-1">
              <Sparkles size={14} className="animate-pulse" />
              <span>INTERNET OPERATING SYSTEM ONLINE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Welcome to The Shak Space</h1>
            <p className="text-sm text-[#A0A6B1] mt-1.5 max-w-xl">
              An ecosystem designed to integrate workflows, automate pipelines, and centralize key knowledge in a beautiful desktop dashboard.
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

        {/* Quick Actions */}
        <div>
          <h2 className="text-xs font-bold text-[#A0A6B1] tracking-widest uppercase mb-3">Quick System Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "New Workspace", sub: "Spin up a folder partition", color: "bg-[#4F8CFF]/15 text-[#4F8CFF]", hover: "group-hover:text-[#4F8CFF]", icon: Plus, action: handleAddNewWorkspace },
              { label: "New Document", sub: "Add premium research state", color: "bg-purple-500/15 text-purple-400", hover: "group-hover:text-purple-400", icon: FileText, action: handleAddNewNote },
              { label: "Ask AI Synthesizer", sub: "Interrogate local indexes", color: "bg-orange-500/15 text-orange-400", hover: "group-hover:text-orange-400", icon: Bot, action: triggerAskAiTab },
              { label: "Create Automation", sub: "Trigger pipelines real-time", color: "bg-emerald-500/15 text-emerald-400", hover: "group-hover:text-emerald-400", icon: Cpu, action: () => setActiveTab("automation") },
            ].map(({ label, sub, color, hover, icon: Icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-[rgba(255,255,255,0.08)] hover:border-white/20 rounded-2xl transition-all duration-250 cursor-pointer flex flex-col items-start gap-4 text-left group"
              >
                <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className={`text-xs font-bold text-white ${hover} transition-colors flex items-center gap-1`}>
                    {label} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-[11px] text-[#A0A6B1] mt-0.5">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-xs font-bold text-[#A0A6B1] tracking-widest uppercase mb-3">Active Analytics & Widgets</h2>
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
                <span className="text-2xl font-black font-mono tracking-tight text-white mt-1 block">{notes.length} Active</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <FileText size={18} className="text-purple-400" />
              </div>
            </div>
            <div className="p-5 bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#A0A6B1] uppercase tracking-wider block">Active Automation Pipelines</span>
                <span className="text-2xl font-black font-mono tracking-tight text-white mt-1 block">
                  {automations.filter((a) => a.active).length} Running
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Zap size={18} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Workspaces */}
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
                  className="px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-[rgba(255,255,255,0.08)] text-white text-[11px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
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
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-[#A0A6B1] bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                        {ws.category}
                      </span>
                      <span className="text-[10px] text-[#A0A6B1]">{ws.updated}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#4F8CFF] transition-colors">{ws.name}</h4>
                      <p className="text-[10px] text-[#A0A6B1] mt-0.5">{ws.items} Indexed Documents</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="p-6 bg-[#14171C] border border-[rgba(255,255,255,0.08)] rounded-2xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <Activity size={16} className="text-orange-400 animate-pulse" />
                Live V-OS Audit Logs
              </h3>
              <p className="text-[11px] text-[#A0A6B1] mb-4">Chronological operational trails and changes occurring in real-time.</p>
              <div className="space-y-4">
                {logs.map((log) => {
                  const LogIcon = log.icon;
                  return (
                    <div key={log.id} className="flex items-start gap-3 text-xs border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                      <div className="p-1.5 rounded-lg bg-white/[0.04] text-white/60">
                        <LogIcon size={12} />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-white">{log.user}</span>
                        <span className="text-[#A0A6B1]"> {log.action}</span>
                        {log.target && (
                          <span className="font-mono text-[11px] text-[#4F8CFF] bg-[#4F8CFF]/5 px-1.5 py-0.5 rounded ml-1.5">
                            {log.target}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#A0A6B1] shrink-0 font-mono">{log.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
              <div className="flex items-center gap-2 text-xs text-orange-400 font-bold uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                <span>AI Operating Agent Insight</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">System Design Recommendation</h3>
              <p className="text-xs text-[#A0A6B1] leading-relaxed mb-4">
                "We observed you drafted {notes.length} documents matching Product Requirements. I suggest binding a direct GitHub Webhook trigger to automatically push builds on commit logs."
              </p>
              <div className="p-3 bg-[#4F8CFF]/5 border border-[#4F8CFF]/10 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white">Recommended Action</p>
                  <p className="text-[9px] text-[#A0A6B1]">Publish metadata build on Git</p>
                </div>
                <button
                  onClick={() => {
                    addNewLog("AI Synthesizer", "activated pipeline", "GitHub Gist Sync", Workflow);
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
                <span className="text-[10px] font-mono text-[#A0A6B1]">{notes.length} Files</span>
              </div>
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText size={14} className="text-purple-400 shrink-0" />
                      <span className="text-xs font-medium text-white truncate">{note.title}</span>
                    </div>
                    <span className="text-[10px] text-[#A0A6B1] shrink-0">{note.duration}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab("knowledge-hub")}
                className="w-full text-center text-[11px] text-[#4F8CFF] hover:underline mt-4 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Expand Knowledge Hub <ExternalLink size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderWorkspaces() {
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
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.08] text-[9px] font-bold uppercase text-[#4F8CFF] rounded-full">
                    {ws.category}
                  </span>
                  <span className="text-[10px] text-[#A0A6B1]">{ws.updated}</span>
                </div>
                <h3 className="text-sm font-bold text-white block truncate">{ws.name}</h3>
                <p className="text-xs text-[#A0A6B1] mt-1 line-clamp-2">
                  Contains dynamic code representations, metadata guidelines, and live assets sync.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-4">
                <span className="text-[11px] text-[#A0A6B1]">{ws.items} items indexed</span>
                <button className="text-[11px] text-[#4F8CFF] hover:underline flex items-center gap-1">
                  Enter Space <ArrowUpRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
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

  function renderKnowledgeHub() {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <h1 className="text-2xl font-black text-white">Knowledge Hub</h1>
            <p className="text-xs text-[#A0A6B1] mt-1">
              Store notes, reference metadata, specifications, and internal assets safely in optimized storage.
            </p>
          </div>
          <button
            onClick={handleAddNewNote}
            className="px-4 py-2 bg-[#4F8CFF] hover:bg-blue-600 font-bold text-xs text-white rounded-xl flex items-center gap-2 cursor-pointer transition-transform duration-150"
          >
            <Plus size={14} /> New Document
          </button>
        </div>
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{note.title}</h3>
                  <p className="text-[10px] text-[#A0A6B1] mt-0.5">Updated on {note.date} • Shared publicly</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#A0A6B1] bg-white/[0.04] px-2 py-1 rounded-md border border-white/[0.06] font-mono">
                  {note.duration}
                </span>
                <button
                  onClick={() => alert(`Reviewing document: ${note.title}`)}
                  className="p-1 px-2.5 rounded hover:bg-white/5 text-[11px] text-[#4F8CFF] font-semibold border border-transparent hover:border-white/[0.06]"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderAIAssistant() {
    return (
      <div className="space-y-6 max-w-3xl mx-auto h-[550px] flex flex-col justify-between">
        <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Bot size={20} className="text-[#4F8CFF]" />
              AI Intelligent Synthesizer
            </h1>
            <p className="text-[11px] text-[#A0A6B1]">Instruct your local space agent to trigger actions and index logs</p>
          </div>
          <span className="text-[10px] font-mono bg-[#4F8CFF]/10 text-[#4F8CFF] px-2 py-0.5 rounded border border-[#4F8CFF]/20">
            Gemini 2.5 Flash Online
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          {aiMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-[10px] ${
                  msg.role === "user" ? "bg-indigo-600 text-white" : "bg-[#4F8CFF] text-white"
                }`}
              >
                {msg.role === "user" ? "SH" : "AI"}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "user" ? "bg-[#4F8CFF] text-white" : "bg-[#14171C] text-white/90 border border-white/[0.04]"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isAiTyping && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-7 h-7 rounded-lg bg-[#4F8CFF] text-white shrink-0 flex items-center justify-center font-bold text-[10px]">
                AI
              </div>
              <div className="p-3 bg-[#14171C] text-[#A0A6B1] border border-white/[0.04] rounded-2xl text-[11px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A0A6B1] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#A0A6B1] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#A0A6B1] animate-bounce" style={{ animationDelay: "300ms" }} />
                <span>Indexing workspaces filesystem...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
          <input
            type="text"
            placeholder="Type your instruction or try: 'index my recent workspaces'..."
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askAiSimulation()}
            className="flex-1 bg-transparent px-3 text-xs outline-none text-white placeholder-white/30"
          />
          <button
            onClick={() => askAiSimulation()}
            className="p-2 rounded-xl bg-[#4F8CFF] hover:bg-blue-600 text-white cursor-pointer transition-transform shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    );
  }

  function renderAutomations() {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="border-b border-white/[0.08] pb-5">
          <h1 className="text-2xl font-black text-white">Automation Rules</h1>
          <p className="text-xs text-[#A0A6B1] mt-1">
            Build active cron timers, file triggers, and webhooks to synchronize files across indices.
          </p>
        </div>
        <div className="space-y-4">
          {automations.map((rule) => (
            <div key={rule.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-lg ${rule.active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.04] text-white/40"}`}>
                  <Workflow size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white">{rule.name}</h3>
                    {rule.active ? (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 rounded-full font-bold">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[9px] bg-white/[0.04] text-[#A0A6B1] border border-white/[0.06] px-1.5 rounded-full font-bold">
                        PAUSED
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#A0A6B1] mt-1 font-mono">
                    Trigger: <span className="text-white">{rule.trigger}</span> • Action: <span className="text-[#4F8CFF]">{rule.action}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAutomations((prev) => prev.map((a) => (a.id === rule.id ? { ...a, active: !a.active } : a)));
                  addNewLog("System Trigger", rule.active ? "paused pipeline" : "re-activated pipeline", rule.name, Cpu);
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                  rule.active
                    ? "border-orange-500/20 hover:border-orange-500/40 text-orange-400 hover:bg-orange-500/5"
                    : "border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/5"
                }`}
              >
                {rule.active ? "Pause" : "Resume"}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderSettings() {
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="border-b border-white/[0.08] pb-5">
          <h1 className="text-2xl font-black text-white">System Settings</h1>
          <p className="text-xs text-[#A0A6B1] mt-1">
            Configure system configurations, custom key mappings, brand guidelines, and UI customization parameters.
          </p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders size={16} className="text-[#4F8CFF]" /> Custom V-OS Preferences
            </h3>
            <p className="text-xs text-[#A0A6B1]">Establish workspace default scopes easily</p>
          </div>
          <div className="border-t border-white/[0.04] pt-4 space-y-4">
            {[
              {
                label: "Glassmorphic Background Translucency",
                sub: "Regulate intensity profile of glass layers",
                value: "85% (Optimized)",
                valueClass: "bg-white/[0.04] border-white/[0.08] text-white",
              },
              {
                label: "Haptic Workspace Reloads",
                sub: "Trigger spring physical feedback coordinates on index shifts",
                value: "Enabled",
                valueClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
              },
              {
                label: "Developer Command Palette Hotkey",
                sub: "Configure spotlight global panel entry",
                value: "⌘ K",
                valueClass: "bg-white/[0.04] border-white/[0.08] text-white",
              },
            ].map(({ label, sub, value, valueClass }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">{label}</p>
                  <p className="text-[10px] text-[#A0A6B1]">{sub}</p>
                </div>
                <span className={`px-2.5 py-1 border text-[10px] font-bold font-mono rounded ${valueClass}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}