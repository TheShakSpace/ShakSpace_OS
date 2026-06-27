import { Sliders, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../stores/useAuthStore";

export default function SettingsPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  
  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">

      <div className="border-b border-white/[0.08] pb-5">
        <h1 className="text-2xl font-black text-white">System Settings</h1>
        <p className="text-xs text-[#A0A6B1] mt-1">
          Configure system configurations, custom key mappings, brand guidelines, and UI customization parameters.
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-sm border border-white/[0.10] text-[#A0A6B1] hover:text-white hover:border-white/[0.20] transition-colors cursor-pointer flex items-center gap-2"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders size={16} className="text-[#4F8CFF]" /> Custom V-OS Preferences
          </h3>
          <p className="text-xs text-[#A0A6B1]">Establish workspace default scopes easily</p>
        </div>

        <div className="border-t border-white/[0.04] pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Glassmorphic Background Translucency</p>
              <p className="text-[10px] text-[#A0A6B1]">Regulate intensity profile of glass layers</p>
            </div>
            <span className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold text-white font-mono rounded">
              85% (Optimized)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Haptic Workspace Reloads</p>
              <p className="text-[10px] text-[#A0A6B1]">Trigger spring physical feedback coordinates on index shifts</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 font-mono rounded">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Automated Spotlight Indexes</p>
              <p className="text-[10px] text-[#A0A6B1]">Auto-index files on creation for instant searches</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 font-mono rounded">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
