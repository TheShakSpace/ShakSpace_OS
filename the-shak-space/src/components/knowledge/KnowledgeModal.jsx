import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { estimateReadTime } from "../../utils/knowledgeHelpers";

export default function KnowledgeModal({
  isOpen,
  mode,
  type = "note",
  form,
  onFormChange,
  collections = [],
  onClose,
  onSubmit,
}) {
  const titleRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => titleRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [isOpen, type]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose, onSubmit]);

  const isNote = type === "note";
  const isValid = isNote
    ? form.title?.trim().length > 0
    : form.name?.trim().length > 0;

  const readTime = isNote ? estimateReadTime(form.description ?? "") : 0;

  const titles = {
    "note-create": "Create Note",
    "note-edit": "Edit Note",
    "collection-create": "New Collection",
    "collection-edit": "Edit Collection",
  };
  const modalKey = `${type}-${mode}`;
  const title = titles[modalKey] ?? "Knowledge";

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
            aria-labelledby="knowledge-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.10] bg-[#14171C]/95 backdrop-blur-xl p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 id="knowledge-modal-title" className="text-lg font-black text-white">
                  {title}
                </h2>
                <p className="text-xs text-[#A0A6B1] mt-1">
                  {isNote
                    ? "Capture ideas, docs, and references in your knowledge base."
                    : "Organize notes into themed collections."}
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

            {isNote ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="note-title" className="block text-xs font-bold text-white mb-1">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="note-title"
                    ref={titleRef}
                    value={form.title}
                    onChange={(e) => onFormChange({ ...form, title: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isValid) {
                        e.preventDefault();
                        onSubmit();
                      }
                    }}
                    className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                    placeholder="Note title"
                  />
                </div>

                <div>
                  <label htmlFor="note-desc" className="block text-xs font-bold text-white mb-1">
                    Description
                  </label>
                  <textarea
                    id="note-desc"
                    value={form.description}
                    onChange={(e) => onFormChange({ ...form, description: e.target.value })}
                    rows={5}
                    className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60 resize-none font-mono text-[13px] leading-relaxed"
                    placeholder="Start writing..."
                  />
                  <p className="text-[10px] text-[#A0A6B1] mt-1">~{readTime} min read</p>
                </div>

                <div>
                  <label htmlFor="note-collection" className="block text-xs font-bold text-white mb-1">
                    Collection
                  </label>
                  <select
                    id="note-collection"
                    value={form.collectionId}
                    onChange={(e) => onFormChange({ ...form, collectionId: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60 cursor-pointer"
                  >
                    <option value="" className="bg-[#14171C]">No collection</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id} className="bg-[#14171C]">
                        {col.icon} {col.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="note-tags" className="block text-xs font-bold text-white mb-1">
                    Tags
                  </label>
                  <input
                    id="note-tags"
                    value={form.tags}
                    onChange={(e) => onFormChange({ ...form, tags: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                    placeholder="comma-separated tags"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="col-name" className="block text-xs font-bold text-white mb-1">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="col-name"
                    ref={titleRef}
                    value={form.name}
                    onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                    placeholder="Collection name"
                  />
                </div>
                <div>
                  <label htmlFor="col-desc" className="block text-xs font-bold text-white mb-1">
                    Description
                  </label>
                  <textarea
                    id="col-desc"
                    value={form.description}
                    onChange={(e) => onFormChange({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="col-icon" className="block text-xs font-bold text-white mb-1">
                      Icon
                    </label>
                    <input
                      id="col-icon"
                      value={form.icon}
                      onChange={(e) => onFormChange({ ...form, icon: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <label htmlFor="col-color" className="block text-xs font-bold text-white mb-1">
                      Accent
                    </label>
                    <select
                      id="col-color"
                      value={form.color}
                      onChange={(e) => onFormChange({ ...form, color: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/60 cursor-pointer"
                    >
                      <option value="from-purple-500/20 to-pink-500/10" className="bg-[#14171C]">Purple</option>
                      <option value="from-blue-500/20 to-indigo-500/10" className="bg-[#14171C]">Blue</option>
                      <option value="from-emerald-500/20 to-teal-500/10" className="bg-[#14171C]">Green</option>
                      <option value="from-orange-500/20 to-amber-500/10" className="bg-[#14171C]">Orange</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
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
                disabled={!isValid}
                className="px-4 py-2 rounded-xl text-sm bg-purple-500 text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mode === "edit" ? "Save" : "Create"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
