import React from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";

import {
  Mail,
  Lock,
  ArrowRight,
  CheckSquare,
  Square,
  HelpCircle,
  Layers,
  Cpu,
  Sparkles,
} from "lucide-react";

import { useAuthStore } from "../stores/useAuthStore";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const demoLogin = useAuthStore((state) => state.demoLogin);
  const authLoading = useAuthStore((state) => state.authLoading);
  const validationError = useAuthStore((state) => state.validationError);

  const handleLogin = async () => {
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch {
      // backend validation errors are already stored in Zustand
    }
  };

  const handleTryDemo = () => {
    demoLogin();
    navigate("/dashboard");
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#050816] relative overflow-hidden px-4">
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

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto">
          {/* Desktop layout */}
          <div className="hidden md:grid md:grid-cols-[1.05fr_0.95fr] gap-6 items-stretch">
            {/* Left side panel */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl p-7 overflow-hidden relative">
              <div className="absolute inset-0 pointer-events-none opacity-70">
                <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#4F8CFF]/20 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4F8CFF] via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/10 ring-1 ring-white/10">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-mono text-[#A0A6B1] tracking-widest uppercase">
                      THE SHAK SPACE
                    </div>
                    <div className="text-[13px] font-black text-white">
                      Internet Operating System
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Cpu size={16} className="text-[#4F8CFF]" />
                    <div className="text-xs text-[#A0A6B1]">
                      Index + Execute Workflows
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {[
                      "Workspace Management",
                      "Knowledge Hub",
                      "AI Assistant",
                      "Automation Engine",
                    ].map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 flex items-center justify-center">
                          <Sparkles size={14} className="text-[#4F8CFF]" />
                        </span>
                        <span className="text-xs font-semibold text-white/90">
                          ✓ {t}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] text-[#A0A6B1] leading-relaxed">
                    Secure session bootstrapped for your local operating spaces.
                  </p>
                </div>
              </div>
            </div>

            {/* Right card */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl p-8 overflow-hidden relative">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-28 -right-24 w-72 h-72 rounded-full bg-[#4F8CFF]/20 blur-3xl" />
              </div>

              <div className="relative z-10">
                <div className="mb-6 text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#4F8CFF]/30 bg-[#4F8CFF]/10">
                    <span className="text-xs font-mono tracking-widest uppercase text-[#A0A6B1]">
                      THE SHAK SPACE OS
                    </span>
                  </span>
                </div>

                {/* Glassmorphism login card */}
                <div className="rounded-2xl border border-[#4F8CFF]/25 bg-white/[0.02] p-6">
                  <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F8CFF] via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/10 ring-1 ring-white/10">
                      <span className="text-xl font-black tracking-widest">S</span>
                    </div>
                    <h1 className="mt-4 text-2xl font-black text-white">Welcome back</h1>
                    <p className="mt-1 text-[11px] text-[#A0A6B1]">
                      Sign in to The Shak Space
                    </p>
                  </div>

                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin();
                    }}
                  >
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Email</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.10]">
                        <Mail size={16} className="text-[#A0A6B1]" />
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          placeholder="you@example.com"
                          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Password</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.10]">
                        <Lock size={16} className="text-[#A0A6B1]" />
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type="password"
                          placeholder="••••••••"
                          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setRememberMe((v) => !v)}
                        className="flex items-center gap-2 cursor-pointer"
                        aria-pressed={rememberMe}
                      >
                        {rememberMe ? (
                          <CheckSquare size={16} className="text-[#4F8CFF]" />
                        ) : (
                          <Square size={16} className="text-[#A0A6B1]" />
                        )}
                        <span className="text-[12px] text-[#A0A6B1]">Remember Me</span>
                      </button>

                      <button
                        type="button"
                        className="text-[12px] text-[#4F8CFF] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <HelpCircle size={14} />
                        Forgot Password
                      </button>
                    </div>

                    {validationError ? (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[12px] text-red-200">
                        {Array.isArray(validationError)
                          ? validationError.map((m, idx) => (
                              <div key={idx}>{String(m)}</div>
                            ))
                          : typeof validationError === "object"
                          ? Object.values(validationError).map((v, idx) => (
                              <div key={idx}>{String(v)}</div>
                            ))
                          : String(validationError)}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#4F8CFF] text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {authLoading ? "Logging in..." : "Login"}
                    </button>

                    <button
                      type="button"
                      onClick={handleTryDemo}
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-white/[0.10] text-[#A0A6B1] hover:text-white hover:border-white/[0.20] transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} className="text-[#4F8CFF]" />
                      Try the Demo
                    </button>
                  </form>

                  <p className="mt-5 text-center text-[12px] text-[#A0A6B1]">
                    Don&apos;t have an account?{" "}
                    <Link to="/signup" className="text-[#4F8CFF] hover:underline inline-flex items-center gap-1">
                      Sign up <ArrowRight size={12} />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-28 -right-24 w-72 h-72 rounded-full bg-[#4F8CFF]/20 blur-3xl" />
              </div>

              <div className="relative z-10 text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#4F8CFF]/30 bg-[#4F8CFF]/10">
                  <span className="text-xs font-mono tracking-widest uppercase text-[#A0A6B1]">
                    THE SHAK SPACE OS
                  </span>
                </span>

                <div className="mt-6 rounded-2xl border border-[#4F8CFF]/25 bg-white/[0.02] p-5">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F8CFF] via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/10 ring-1 ring-white/10">
                    <span className="text-xl font-black tracking-widest">S</span>
                  </div>
                  <h1 className="mt-4 text-2xl font-black text-white">Welcome back</h1>
                  <p className="mt-1 text-[11px] text-[#A0A6B1]">Sign in to The Shak Space</p>

                  <form
                    className="mt-5 space-y-4 text-left"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin();
                    }}
                  >
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Email</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.10]">
                        <Mail size={16} className="text-[#A0A6B1]" />
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          placeholder="you@example.com"
                          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Password</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.10]">
                        <Lock size={16} className="text-[#A0A6B1]" />
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type="password"
                          placeholder="••••••••"
                          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setRememberMe((v) => !v)}
                        className="flex items-center gap-2 cursor-pointer"
                        aria-pressed={rememberMe}
                      >
                        {rememberMe ? (
                          <CheckSquare size={16} className="text-[#4F8CFF]" />
                        ) : (
                          <Square size={16} className="text-[#A0A6B1]" />
                        )}
                        <span className="text-[12px] text-[#A0A6B1]">Remember Me</span>
                      </button>

                      <button
                        type="button"
                        className="text-[12px] text-[#4F8CFF] hover:underline cursor-pointer"
                      >
                        Forgot Password
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#4F8CFF] text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {authLoading ? "Logging in..." : "Login"}
                    </button>

                    <button
                      type="button"
                      onClick={handleTryDemo}
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-white/[0.10] text-[#A0A6B1] hover:text-white hover:border-white/[0.20] transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} className="text-[#4F8CFF]" />
                      Try the Demo
                    </button>
                  </form>

                  <p className="mt-5 text-center text-[12px] text-[#A0A6B1]">
                    Don&apos;t have an account?{" "}
                    <Link to="/signup" className="text-[#4F8CFF] hover:underline inline-flex items-center gap-1">
                      Sign up <ArrowRight size={12} />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
