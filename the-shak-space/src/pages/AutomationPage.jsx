import React from "react";
import { Cpu, Workflow } from "lucide-react";

export default function AutomationPage() {
  const [automations, setAutomations] = React.useState([
    { id: 1, name: "Auto-sort Incoming Slack Files", trigger: "Slack File Uploaded", action: "Move to Knowledge Hub", active: true },
    { id: 2, name: "Weekly Workspace Summary PDF", trigger: "Every Friday at 5 PM", action: "Generate Document & Email", active: true },
    { id: 3, name: "Sync Notes to GitHub Gist", trigger: "On Note Created", action: "Trigger REST Endpoint", active: false },
  ]);

  const addNewLog = () => {};

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
          <div 
            key={rule.id}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className={`p-2.5 rounded-lg ${rule.active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.04] text-white/40"}`}>
                <Workflow size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white">{rule.name}</h3>
                  {rule.active ? (
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.25 rounded-full font-bold">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] bg-white/[0.04] text-[#A0A6B1] border border-white/[0.06] px-1.5 py-0.25 rounded-full font-bold">
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
                addNewLog();
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
