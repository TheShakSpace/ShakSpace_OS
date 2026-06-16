import { useState } from "react";
import { NavLink } from "react-router-dom";
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

export default function AppLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "System optimized successfully", time: "10m ago", read: false },
    { id: 2, text: "New workspace 'Acme project' created", time: "1h ago", read: true },
    { id: 3, text: "Automation 'Backup Sync' triggered", time: "3h ago", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Local state kept to preserve sidebar/topbar UI behavior & animations exactly as before.
  // Page content now comes from {children}.
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
    {
      id: 1,
      role: "assistant",
      content:
        "Greetings! I'm your Shak Space AI Assistant. I have indexed your current workspaces, notes, and local automation rules. Ask me anything to generate, summarize, or trigger actions.",
    },
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
    setLogs((prev) => [{ id: Date.now(), user: "Shak", action: "created new workspace", target: newWs.name, time: "Just now", icon: Briefcase }, ...prev.slice(0, 5)]);
  };

  const handleAddNewNote = () => {
    const defaultTitles = [
      "Weekly Standup Minutes",
      "Brainstorming Session Notes",
      "System Design Architecture",
      "Marketing Outlines",
    ];
    const title = defaultTitles[Math.floor(Math.random() * defaultTitles.length)];
    const newNote = {
      id: Date.now(),
      title,
      date: "Jun 14, 2026",
      duration: `${Math.floor(Math.random() * 8) + 2} min read`,
    };
    setNotes([newNote, ...notes]);
    setLogs((prev) => [{ id: Date.now(), user: "Shak", action: "drafted high-fidelity note", target: title, time: "Just now", icon: FileText }, ...prev.slice(0, 5)]);
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

            const routeById = {
              dashboard: "/",
              workspaces: "/workspaces",
              "knowledge-hub": "/knowledge",
              "ai-assistant": "/ai",
              automation: "/automation",
              settings: "/settings",
            };

            const to = routeById[item.id] || "/";

            return (
              <NavLink
                key={item.id}
                to={to}
                end={item.id === "dashboard"}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 cursor-pointer group relative ${
                    isActive
                      ? "bg-[#4F8CFF] text-white shadow-lg shadow-[#4F8CFF]/15"
                      : "text-[#A0A6B1] hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
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
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="p-4 m-3 bg-[#4F8CFF]/5 border border-[#4F8CFF]/10 rounded-xl">
            <div className="flex items-center gap-2 mb-1.5 text-[#4F8CFF]">
              <Sparkles size={14} />
              <span className="text-[11px] font-bold tracking-wider uppercase">V-System Engine</span>
            </div>
            <p className="text-[11px] text-[#A0A6B1] leading-relaxed">Fully customized UI components, running locally. System health is optimal.</p>
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
                {notifications.some((n) => !n.read) && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-[#0F1115]" />}
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
                      <button onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))} className="text-[10px] text-[#4F8CFF] hover:underline">
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
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#4F8CFF] to-[#80AAFF] text-[10px] text-white flex items-center justify-center font-bold shadow-md">SK</div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={typeof children?.key !== "undefined" ? children.key : "route"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

