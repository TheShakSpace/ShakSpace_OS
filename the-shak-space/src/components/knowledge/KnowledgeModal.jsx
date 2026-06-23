import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { KNOWLEDGE_CATEGORIES } from "../../utils/knowledgeHelpers";

export default function KnowledgeModal({
  isOpen,
  mode,
  form,
  onFormChange,
  workspaces = [],
  onClose,
  onSubmit,
  submitting = false,
}) {
  const titleRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => titleRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const isValid = form.title?.trim().length > 0 && form.workspaceId;

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
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.10] bg-[#14171C]/95 backdrop-blur-xl p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <h2 className="text-lg font-black text-white">
                {mode === "edit" ? "Edit Note" : "Create Note"}
              </h2>
              <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-[#A0A6B1] hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1">Title *</label>
                <input
                  ref={titleRef}
                  value={form.title}
                  onChange={(e) => onFormChange({ ...form, title: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Workspace *</label>
                <select
                  value={form.workspaceId}
                  onChange={(e) => onFormChange({ ...form, workspaceId: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#14171C]">Select workspace</option>
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id} className="bg-[#14171C]">
                      {ws.icon} {ws.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Category</label>
                  <select
                    value={form.category || "general"}
                    onChange={(e) => onFormChange({ ...form, category: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
                  >
                    {KNOWLEDGE_CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-[#14171C]">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Icon</label>
                  <input
                    value={form.icon}
                    onChange={(e) => onFormChange({ ...form, icon: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none"
                    maxLength={4}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Summary</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => onFormChange({ ...form, summary: e.target.value })}
                  rows={2}
                  className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none resize-none"
                />
              </div>

              {mode === "create" && (
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Initial content</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => onFormChange({ ...form, content: e.target.value })}
                    rows={4}
                    className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none resize-none font-mono"
                    placeholder="Markdown supported..."
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-white mb-1">Tags</label>
                <input
                  value={form.tags}
                  onChange={(e) => onFormChange({ ...form, tags: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none"
                  placeholder="comma-separated"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border border-white/10 text-[#A0A6B1] cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={!isValid || submitting}
                className="px-4 py-2 rounded-xl text-sm bg-purple-500 text-white cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Saving..." : mode === "edit" ? "Save" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
