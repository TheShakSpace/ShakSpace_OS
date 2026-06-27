import React from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Layers, Sparkles } from "lucide-react";

import { useAuthStore } from "../stores/useAuthStore";

export default function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const register = useAuthStore((state) => state.register);
  const demoLogin = useAuthStore((state) => state.demoLogin);
  const authLoading = useAuthStore((state) => state.authLoading);
  const validationError = useAuthStore((state) => state.validationError);

  const handleSignup = async () => {
    try {
      await register({ name, email, password });
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
      <div className="absolute -top-28 -left-24 w-96 h-96 rounded-full bg-[#4F8CFF]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(79,140,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(79,140,255,0.18) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F8CFF] to-[#80AAFF] flex items-center justify-center text-sm font-black text-white shadow-lg shadow-blue-500/20">
                S
              </div>
              <span className="font-semibold text-sm tracking-tight text-white">The Shak Space</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl p-7 overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-28 -right-24 w-72 h-72 rounded-full bg-[#4F8CFF]/20 blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F8CFF] via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/10 ring-1 ring-white/10">
                  <Layers size={18} />
                </div>
                <h1 className="mt-4 text-2xl font-black text-white">Create your account</h1>
                <p className="mt-1 text-[11px] text-[#A0A6B1]">
                  Set up your Shak Space in a few seconds
                </p>
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignup();
                }}
              >
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Name</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.10]">
                    <User size={16} className="text-[#A0A6B1]" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder="Your name"
                      className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30"
                    />
                  </div>
                </div>

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
                      placeholder="At least 8 characters"
                      className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30"
                    />
                  </div>
                </div>

                {validationError ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[12px] text-red-200">
                    {Array.isArray(validationError)
                      ? validationError.map((m, idx) => <div key={idx}>{String(m)}</div>)
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
                  {authLoading ? "Creating account..." : "Create account"}
                </button>

                <button
                  type="button"
                  onClick={handleTryDemo}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-white/[0.10] text-[#A0A6B1] hover:text-white hover:border-white/[0.20] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} className="text-[#4F8CFF]" />
                  Skip — try the demo instead
                </button>
              </form>

              <p className="mt-5 text-center text-[12px] text-[#A0A6B1]">
                Already have an account?{" "}
                <Link to="/login" className="text-[#4F8CFF] hover:underline inline-flex items-center gap-1">
                  Log in <ArrowRight size={12} />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
