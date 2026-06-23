import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import WorkspaceTemplates from "./WorkspaceTemplates";

import { BACKEND_CATEGORIES } from "../../utils/workspaceHelpers";

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "general",
  icon: "📁",
  color: "from-blue-500/20 to-indigo-500/10",
  accentColor: "#4F8CFF",
  tags: "",
};

export default function WorkspaceModal({
  isOpen,
  mode,
  form,
  onFormChange,
  onClose,
  onSubmit,
  onSelectTemplate,
  selectedTemplateId,
  submitting = false,
}) {
  const nameRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => nameRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose, onSubmit]);

  const isValid = form.name.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="workspace-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.10] bg-[#14171C]/95 backdrop-blur-xl p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 id="workspace-modal-title" className="text-lg font-black text-white">
                  {mode === "edit" ? "Edit Workspace" : "Create Workspace"}
                </h2>
                <p className="text-xs text-[#A0A6B1] mt-1">
                  {mode === "edit"
                    ? "Update workspace metadata and settings."
                    : "Choose a template or build a custom sandboxed space."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#A0A6B1] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {mode === "create" && (
              <WorkspaceTemplates
                selectedId={selectedTemplateId}
                onSelect={onSelectTemplate}
              />
            )}

            <div className="space-y-4 mt-5">
              <div>
                <label htmlFor="ws-name" className="block text-xs font-bold text-white mb-1">
                  Workspace Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="ws-name"
                  ref={nameRef}
                  value={form.name}
                  onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValid) {
                      e.preventDefault();
                      onSubmit();
                    }
                  }}
                  className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#4F8CFF]/60"
                  placeholder="e.g. Research Hub"
                />
              </div>

              <div>
                <label htmlFor="ws-desc" className="block text-xs font-bold text-white mb-1">
                  Description
                </label>
                <textarea
                  id="ws-desc"
                  value={form.description}
                  onChange={(e) => onFormChange({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#4F8CFF]/60 resize-none"
                  placeholder="What will this workspace contain?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ws-category" className="block text-xs font-bold text-white mb-1">
                    Category
                  </label>
                  <select
                    id="ws-category"
                    value={form.category || "general"}
                    onChange={(e) => onFormChange({ ...form, category: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#4F8CFF]/60 cursor-pointer"
                  >
                    {BACKEND_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#14171C]">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ws-icon" className="block text-xs font-bold text-white mb-1">
                    Icon
                  </label>
                  <input
                    id="ws-icon"
                    value={form.icon}
                    onChange={(e) => onFormChange({ ...form, icon: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#4F8CFF]/60"
                    placeholder="📁"
                    maxLength={4}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ws-tags" className="block text-xs font-bold text-white mb-1">
                  Tags
                </label>
                <input
                  id="ws-tags"
                  value={form.tags}
                  onChange={(e) => onFormChange({ ...form, tags: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#4F8CFF]/60"
                  placeholder="comma-separated tags"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-[10px] text-[#A0A6B1] hidden sm:block">
                Press <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.10] font-mono">Esc</kbd> to close ·{" "}
                <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.10] font-mono">⌘↵</kbd> to submit
              </p>
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm border border-white/[0.10] text-[#A0A6B1] hover:text-white hover:border-white/[0.20] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSubmit}
                  disabled={!isValid || submitting}
                  className="px-4 py-2 rounded-xl text-sm bg-[#4F8CFF] text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Saving..."
                    : mode === "edit"
                      ? "Save Changes"
                      : "Create Workspace"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export { EMPTY_FORM };
