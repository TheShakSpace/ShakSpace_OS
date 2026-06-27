import { motion } from "motion/react";
import { WORKSPACE_TEMPLATES } from "./workspaceTemplateData";

export default function WorkspaceTemplates({ selectedId, onSelect }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#A0A6B1] uppercase tracking-wider mb-3">
        Start from a template
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {WORKSPACE_TEMPLATES.map((template, i) => (
          <motion.button
            key={template.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(template)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedId === template.id
                ? "bg-[#4F8CFF]/15 border-[#4F8CFF]/50"
                : "bg-white/[0.03] border-white/[0.08] hover:border-[#4F8CFF]/30"
            }`}
          >
            <span className="text-xl block mb-1" role="img" aria-hidden>
              {template.icon}
            </span>
            <span className="text-[11px] font-bold text-white block truncate">
              {template.name}
            </span>
            <span className="text-[9px] text-[#A0A6B1] line-clamp-2 mt-0.5">
              {template.category}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
