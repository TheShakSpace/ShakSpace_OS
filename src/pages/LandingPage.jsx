import { Navigate, Link, useNavigate } from "react-router-dom";
import {
  Layers,
  Sparkles,
  ArrowRight,
  FolderGit2,
  BookOpen,
  Bot,
  Cpu,
} from "lucide-react";

import { useAuthStore } from "../stores/useAuthStore";

const FEATURES = [
  {
    icon: FolderGit2,
    title: "Workspace Management",
    description: "Organize every client, project, and team space in one place.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Hub",
    description: "Write, search, and pin documentation alongside your work.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description: "Chat with an assistant that understands your workspace context.",
  },
  {
    icon: Cpu,
    title: "Automation Engine",
    description: "Wire up triggers and actions to keep busywork off your plate.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const demoLogin = useAuthStore((state) => state.demoLogin);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleTryDemo = () => {
    demoLogin();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#050816] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-28 -left-24 w-96 h-96 rounded-full bg-[#4F8CFF]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(79,140,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(79,140,255,0.18) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10">
        {/* Top bar */}
        <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4F8CFF] to-[#80AAFF] flex items-center justify-center text-sm font-black text-white shadow-lg shadow-blue-500/20">
              S
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">The Shak Space</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-[#A0A6B1] hover:text-white transition-colors px-3 py-2"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-xs font-semibold text-white bg-[#4F8CFF] hover:brightness-110 transition-all px-4 py-2 rounded-xl"
            >
              Sign Up
            </Link>
          </div>
        </header>

        {/* Hero */}
        <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#4F8CFF]/30 bg-[#4F8CFF]/10">
            <Sparkles size={14} className="text-[#4F8CFF]" />
            <span className="text-xs font-mono tracking-widest uppercase text-[#A0A6B1]">
              Internet Operating System
            </span>
          </span>

          <h1 className="mt-6 text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            One workspace for
            <br />
            everything you build.
          </h1>

          <p className="mt-5 max-w-xl mx-auto text-sm text-[#A0A6B1] leading-relaxed">
            The Shak Space brings your workspaces, knowledge base, AI assistant, and
            automations together — organized like an operating system, not a spreadsheet.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4F8CFF] text-white hover:brightness-110 transition-all"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={handleTryDemo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.12] text-white hover:bg-white/[0.05] transition-colors"
            >
              <Layers size={16} className="text-[#4F8CFF]" />
              Try the Demo
            </button>
          </div>
          <p className="mt-3 text-[11px] text-[#A0A6B1]">
            No account needed — demo mode works without any setup.
          </p>

          {/* Feature grid */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-5"
              >
                <div className="w-9 h-9 rounded-xl bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 flex items-center justify-center mb-4">
                  <Icon size={16} className="text-[#4F8CFF]" />
                </div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="mt-1.5 text-xs text-[#A0A6B1] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
