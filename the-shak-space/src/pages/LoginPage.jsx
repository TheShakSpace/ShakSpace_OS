import React from "react";
import { motion } from "motion/react";
import { Navigate, useNavigate } from "react-router-dom";

import ParticleField from "../components/splash/ParticleField";

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
  const authLoading = useAuthStore((state) => state.authLoading);
  const validationError = useAuthStore((state) => state.validationError);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const [typedLine, setTypedLine] = React.useState("");
  const [lineIndex, setLineIndex] = React.useState(0);

  const handleLogin = async () => {
    try {
      await login({ email, password });
      navigate("/");
    } catch {
      // backend validation errors are already stored in Zustand
    }
  };


  const lines = [
    "SYSTEM STATUS: ONLINE",
    "SECURE CONNECTION ESTABLISHED",
    "AUTH NODE READY",
  ];

  React.useEffect(() => {
    const current = lines[lineIndex] ?? "";
    setTypedLine("");

    // Stop typing/advancing after the final line
    const isLastLine = lineIndex >= lines.length - 1;

    const t1 = window.setTimeout(() => {
      let i = 0;
      const interval = window.setInterval(() => {
        i += 1;
        setTypedLine(current.slice(0, i));

        if (i >= current.length) {
          window.clearInterval(interval);

          if (!isLastLine) {
            window.setTimeout(() => {
              setLineIndex((prev) => prev + 1);
            }, 550);
          }
        }
      }, 14);

      return () => window.clearInterval(interval);
    }, 180);

    return () => window.clearTimeout(t1);
  }, [lineIndex, lines.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#050816] relative overflow-hidden px-4"
    >
      {/* Particle background (splash-like) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <ParticleField />
      </div>

      {/* Floating blue ambient glows */}
      <motion.div
        className="absolute -top-28 -left-24 w-96 h-96 rounded-full bg-[#4F8CFF]/20 blur-3xl"
        animate={{ y: [0, 16, 0], x: [0, 10, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-indigo-500/20 blur-3xl"
        animate={{ y: [0, -18, 0], x: [0, -12, 0] }}
        transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.22]"
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
                {/* Animated THE SHAK SPACE OS heading + boot status typing */}
                <motion.div
                  initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-6"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#4F8CFF]/30 bg-[#4F8CFF]/10"
                    >
                      <span className="text-xs font-mono tracking-widest uppercase text-[#A0A6B1]">
                        THE SHAK SPACE OS
                      </span>
                    </motion.div>

                    <div className="mt-5">
                      <div className="text-[11px] font-mono text-white/60">
                        {typedLine || " "}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Glassmorphism login card */}
                <div className="rounded-2xl border border-[#4F8CFF]/25 bg-white/[0.02] p-6 hover:shadow-[0_0_0_1px_rgba(79,140,255,0.35)] transition-shadow">
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
                      console.log("[LoginPage] form submit");
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
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-white/[0.10] text-[#A0A6B1] hover:text-white hover:border-white/[0.20] transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#4F8CFF]">
                        <ArrowRight size={14} />
                      </span>
                      Continue with Google
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden">
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-28 -right-24 w-72 h-72 rounded-full bg-[#4F8CFF]/20 blur-3xl" />
              </div>

              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#4F8CFF]/30 bg-[#4F8CFF]/10"
                >
                  <span className="text-xs font-mono tracking-widest uppercase text-[#A0A6B1]">
                    THE SHAK SPACE OS
                  </span>
                </motion.div>

                <div className="mt-4 text-[11px] font-mono text-white/60">
                  {typedLine || " "}
                </div>

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
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#4F8CFF] text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
                    >
                      Login
                    </button>

                    <button
                      type="button"
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-white/[0.10] text-[#A0A6B1] hover:text-white hover:border-white/[0.20] transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#4F8CFF]">
                        <ArrowRight size={14} />
                      </span>
                      Continue with Google
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

