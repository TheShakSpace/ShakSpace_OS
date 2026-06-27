import { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Paperclip, Mic, Send, Square, Pencil } from "lucide-react";
import AttachmentPanel from "./AttachmentPanel";

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  attachments,
  onAttachmentsChange,
  isGenerating = false,
  disabled = false,
  editingMessage = null,
  onCancelEdit,
}) {
  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && (value.trim() || attachments?.length)) onSend();
    }
    if (e.key === "Escape" && editingMessage) onCancelEdit?.();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const mapped = files.map((f) => ({
      id: `${Date.now()}-${f.name}`,
      name: f.name,
      type: f.type,
      size: f.size,
      kind: f.type.startsWith("image/") ? "image" : f.name.split(".").pop(),
    }));
    onAttachmentsChange([...(attachments ?? []), ...mapped]);
    e.target.value = "";
  };

  return (
    <div className="shrink-0 space-y-2.5">
      {editingMessage && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300"
        >
          <span className="flex items-center gap-2 font-medium">
            <Pencil size={12} />
            Editing message — press Enter to save
          </span>
          <button type="button" onClick={onCancelEdit} className="hover:underline cursor-pointer text-amber-400">
            Cancel
          </button>
        </motion.div>
      )}

      {(attachments ?? []).length > 0 && (
        <AttachmentPanel
          attachments={attachments}
          onRemove={(id) => onAttachmentsChange(attachments.filter((a) => a.id !== id))}
        />
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isGenerating) onSend();
        }}
        className="relative flex items-end gap-1.5 p-2 pl-2.5 bg-[#14171C]/60 border border-white/[0.10] rounded-2xl backdrop-blur-xl shadow-lg shadow-black/20 focus-within:border-[#4F8CFF]/45 focus-within:shadow-[#4F8CFF]/10 transition-all duration-200"
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,.pdf,.md,.txt,.js,.ts,.jsx,.tsx,.py,.json"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || isGenerating}
          className="p-2.5 rounded-xl text-[#A0A6B1] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          aria-label="Attach files"
        >
          <Paperclip size={17} />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={editingMessage ? "Edit your message…" : "Message Shak AI…"}
          className="flex-1 bg-transparent px-1 py-2.5 text-[13px] leading-relaxed text-white outline-none placeholder:text-white/30 resize-none max-h-[180px] min-h-[44px]"
        />

        <button
          type="button"
          disabled={disabled}
          className="p-2.5 rounded-xl text-[#A0A6B1] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          aria-label="Voice input (UI only)"
          title="Voice input coming soon"
        >
          <Mic size={17} />
        </button>

        {isGenerating ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onStop}
            className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer shrink-0"
            aria-label="Stop generation"
          >
            <Square size={15} fill="currentColor" />
          </motion.button>
        ) : (
          <motion.button
            type="submit"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            disabled={!value.trim() && !(attachments ?? []).length}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#6BA3FF] text-white cursor-pointer shrink-0 disabled:opacity-35 disabled:cursor-not-allowed shadow-md shadow-[#4F8CFF]/25"
            aria-label="Send message"
          >
            <Send size={15} />
          </motion.button>
        )}
      </form>

      <p className="text-[9px] text-[#A0A6B1]/70 text-center hidden sm:block">
        <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] font-mono text-[8px]">↵</kbd>
        {" "}send{" "}
        <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] font-mono text-[8px]">⇧↵</kbd>
        {" "}newline{" "}
        <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] font-mono text-[8px]">Esc</kbd>
        {" "}cancel
      </p>
    </div>
  );
}
