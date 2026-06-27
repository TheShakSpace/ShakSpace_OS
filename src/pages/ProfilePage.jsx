import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  User,
  Mail,
  BadgeCheck,
  Lock,
  History,
  CircleDot,
  Save,
  X,
} from "lucide-react";

import { useAuthStore } from "../stores/useAuthStore";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Keep local edit state in sync when user changes.
  const initial = useMemo(() => ({ name: user?.name || "", email: user?.email || "" }), [user?.name, user?.email]);

  const [isSaved, setIsSaved] = useState(false);

  const memberSince = "Jun 2026";
  const roleLabel = "Workspace Host";

  const passwordMasked = "••••••••••••";
  const lastLogin = "2026-06-14 09:12 UTC";
  const accountStatus = "Active";

  const handleCancel = () => {
    setName(initial.name);
    setEmail(initial.email);
    setIsSaved(false);
  };

  const handleSave = () => {
    // No backend yet.
    // Keep behavior as a front-end-only demo.
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1800);
  };

  const avatarInitial = (name || "").charAt(0)?.toUpperCase() || "G";

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-2"
      >
        <h1 className="text-[26px] md:text-[30px] font-semibold tracking-tight text-white">My Profile</h1>
        <p className="text-sm text-[#A0A6B1]">Manage your account information and preferences.</p>
      </motion.div>

      {/* Profile header card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.04 }}
        className="bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-3xl backdrop-blur-md shadow-xl shadow-black/30 p-5 md:p-7"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-tr from-[#4F8CFF] to-[#80AAFF] flex items-center justify-center font-bold text-lg text-white shadow-md shadow-[#4F8CFF]/20" aria-hidden>
              {avatarInitial}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-[18px] md:text-[20px] font-semibold text-white">{user?.name || "—"}</div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F8CFF]/10 border border-[#4F8CFF]/25 text-[#4F8CFF] text-[11px] font-semibold">
                  <BadgeCheck size={14} />
                  {roleLabel}
                </span>
              </div>
              <div className="mt-1 text-[12px] text-[#A0A6B1]">Member Since: {memberSince}</div>
              <div className="mt-1 text-[12px] text-white/70">{user?.email || "—"}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Editable + Security */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Account details */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="lg:col-span-3"
        >
          <div className="bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-3xl backdrop-blur-md shadow-xl shadow-black/30 p-5 md:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] md:text-[15px] font-semibold text-white">Account Information</h2>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[12px] text-[#A0A6B1] mb-2">Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                    <User size={16} />
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-2xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[#4F8CFF]/25 focus:border-[#4F8CFF] transition-all"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-[#A0A6B1] mb-2">Email</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                    <Mail size={16} />
                  </div>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-2xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[#4F8CFF]/25 focus:border-[#4F8CFF] transition-all"
                    placeholder="you@domain.com"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-[11px] text-[#A0A6B1]">
                  Changes are not saved to a backend yet.
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-2xl border border-[rgba(255,255,255,0.10)] bg-transparent text-white/80 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 rounded-2xl bg-[#4F8CFF]/15 border border-[#4F8CFF]/25 text-[#4F8CFF] font-semibold hover:bg-[#4F8CFF]/25 transition-all flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isSaved && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[12px] font-semibold"
                    role="status"
                  >
                    <CircleDot size={16} />
                    Saved (demo)
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* Security */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.12 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-3xl backdrop-blur-md shadow-xl shadow-black/30 p-5 md:p-7">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#4F8CFF]">
                <Shield size={18} />
              </div>
              <h2 className="text-[14px] md:text-[15px] font-semibold text-white">Security</h2>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-white/40">
                    <Lock size={18} />
                  </div>
                  <div>
                    <div className="text-[12px] text-[#A0A6B1]">Password</div>
                    <div className="text-[13px] text-white/90 font-semibold">{passwordMasked}</div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[rgba(255,255,255,0.06)]" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-white/40">
                    <History size={18} />
                  </div>
                  <div>
                    <div className="text-[12px] text-[#A0A6B1]">Last Login</div>
                    <div className="text-[13px] text-white/90 font-semibold">{lastLogin}</div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[rgba(255,255,255,0.06)]" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-white/40">
                    <CircleDot size={18} />
                  </div>
                  <div>
                    <div className="text-[12px] text-[#A0A6B1]">Account Status</div>
                    <div className="text-[13px] text-white/90 font-semibold">{accountStatus}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-2 rounded-2xl border border-[rgba(255,255,255,0.10)] bg-transparent text-white/80 hover:text-white hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2"
                onClick={() => {}}
              >
                <X size={16} />
                Deactivate
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

