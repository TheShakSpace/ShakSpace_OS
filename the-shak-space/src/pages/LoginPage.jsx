import React from "react";
import { Mail, Lock, ArrowRight, CheckSquare, Square, Github } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1115] relative overflow-hidden px-4">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#4F8CFF]/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/[0.10] bg-white/[0.03] backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
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
                  Forgot Password?
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
                <Github size={16} />
                Continue with Google
                <ArrowRight size={14} className="opacity-70" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-[12px] text-[#A0A6B1]">Don&apos;t have an account? </span>
              <button
                type="button"
                className="text-[12px] text-[#4F8CFF] hover:underline cursor-pointer font-bold"
              >
                Register
              </button>
            </div>
          </div>
        </div>

        {/* Bottom ambient guard for visual consistency */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-white/30 font-mono tracking-tight">
            SECURE CONNECTION • ENCRYPTED SESSION
          </p>
        </div>
      </div>
    </div>
  );
}

