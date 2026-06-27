import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";

import { useAuthStore } from "../../stores/useAuthStore";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "workspaces", label: "Workspaces", icon: FolderGit2 },
  { id: "knowledge-hub", label: "Knowledge Hub", icon: BookOpen },
  { id: "ai-assistant", label: "AI Assistant", icon: Bot },
  { id: "automation", label: "Automation", icon: Cpu },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function AppLayout({ children }) {
  const user = useAuthStore((state) => state.user);
  const isDemo = useAuthStore((state) => state.isDemo);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "System optimized successfully", time: "10m ago", read: false },
    { id: 2, text: "New workspace 'Acme project' created", time: "1h ago", read: true },
    { id: 3, text: "Automation 'Backup Sync' triggered", time: "3h ago", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const userDisplayName = useMemo(() => user?.name || "Guest", [user?.name]);
  const userDisplayEmail = useMemo(() => user?.email || "guest@example.com", [user?.email]);
  const userInitial = useMemo(() => user?.name?.charAt(0)?.toUpperCase() || "G", [user?.name]);

  useEffect(() => {
    if (!isProfileOpen) return;

    const onPointerDown = (e) => {
      const el = profileRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setIsProfileOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsProfileOpen(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isProfileOpen]);

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
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
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] opacity-90 block" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] opacity-90 block" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] opacity-90 block" />
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs ring-4 ring-white/5 cursor-pointer">
              S
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const IconComponent = item.icon;

            const routeById = {
              dashboard: "/dashboard",
              workspaces: "/workspaces",
              "knowledge-hub": "/knowledge",
              "ai-assistant": "/ai",
              automation: "/automation",
              settings: "/settings",
            };

            const to = routeById[item.id] || "/dashboard";

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
            {isDemo && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#4F8CFF]/10 border border-[#4F8CFF]/25 rounded-lg text-[11px] text-[#4F8CFF] font-semibold">
                <Sparkles size={12} />
                <span>Demo Mode</span>
              </div>
            )}

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
                      <button
                        onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))) }
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

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen((v) => !v)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-xl cursor-pointer hover:bg-white/[0.07] transition-all"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
              >
                <span className="text-xs font-semibold font-mono text-white truncate max-w-[120px]">{userDisplayName}</span>
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#4F8CFF] to-[#80AAFF] text-[10px] text-white flex items-center justify-center font-bold shadow-md">
                  {userInitial}
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 mt-2 w-[332px] rounded-3xl border border-[rgba(255,255,255,0.10)] bg-[#14171C]/55 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden z-50"
                    role="menu"
                  >
                    {/* Top / identity */}
                    <div className="px-5 pt-5 pb-4">
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F8CFF] to-[#80AAFF] flex items-center justify-center text-[12px] text-white font-bold shadow-md shadow-[#4F8CFF]/20">
                          {userInitial}
                        </div>
                        <div className="leading-tight">
                          <div className="text-[15px] font-semibold text-white">{userDisplayName}</div>
                          <div className="text-[11px] text-[#A0A6B1] mt-1">{userDisplayEmail}</div>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-[rgba(255,255,255,0.07)]" />

                    {/* Rows */}
                    <div className="p-2.5">
                      <NavLink
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 hover:bg-white/5 hover:scale-[1.01] ${
                            isActive ? "bg-white/5" : ""
                          }`
                        }
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Lucide icon */}
                          <span className="w-[18px] h-[18px] inline-flex items-center justify-center text-[#A0A6B1] group-hover:text-[#4F8CFF]">
                            👤
                          </span>
                          <span className="text-[13px] font-medium text-white">My Profile</span>
                        </div>
                        <ChevronRight size={18} className="text-[#A0A6B1] group-hover:text-white transition-colors" />
                      </NavLink>

                      <NavLink
                        to="/workspaces"
                        onClick={() => setIsProfileOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 hover:bg-white/5 hover:scale-[1.01] ${
                            isActive ? "bg-white/5" : ""
                          }`
                        }
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-[18px] h-[18px] inline-flex items-center justify-center text-[#A0A6B1] group-hover:text-[#4F8CFF]">
                            📂
                          </span>
                          <span className="text-[13px] font-medium text-white">My Workspaces</span>
                        </div>
                        <ChevronRight size={18} className="text-[#A0A6B1] group-hover:text-white transition-colors" />
                      </NavLink>

                      <NavLink
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 hover:bg-white/5 hover:scale-[1.01] ${
                            isActive ? "bg-white/5" : ""
                          }`
                        }
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-[18px] h-[18px] inline-flex items-center justify-center text-[#A0A6B1] group-hover:text-[#4F8CFF]">
                            ⚙
                          </span>
                          <span className="text-[13px] font-medium text-white">Settings</span>
                        </div>
                        <ChevronRight size={18} className="text-[#A0A6B1] group-hover:text-white transition-colors" />
                      </NavLink>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                        }}
                        className="group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 hover:bg-white/5 hover:scale-[1.01] w-full"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-[18px] h-[18px] inline-flex items-center justify-center text-[#A0A6B1] group-hover:text-[#4F8CFF]">
                            🌙
                          </span>
                          <span className="text-[13px] font-medium text-white">Appearance</span>
                        </div>
                        <ChevronRight size={18} className="text-[#A0A6B1] group-hover:text-white transition-colors" />
                      </button>
                    </div>

                    <div className="h-px bg-[rgba(255,255,255,0.07)]" />

                    {/* Logout */}
                    <div className="p-2.5">
                      <button
                        type="button"
                        onClick={onLogout}
                        className="w-full flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 bg-transparent hover:bg-red-500/10 hover:scale-[1.01]"
                        role="menuitem"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-[18px] h-[18px] inline-flex items-center justify-center text-red-400 group-hover:text-red-300">
                            🚪
                          </span>
                          <span className="text-[13px] font-medium text-red-300">Logout</span>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

