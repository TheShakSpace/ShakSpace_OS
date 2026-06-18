import { useState } from "react";
import { motion } from "motion/react";
import { Copy, Check, Pencil, Trash2, RotateCcw, Bot, User } from "lucide-react";
import { formatRelativeTime } from "../../utils/aiHelpers";
import MarkdownRenderer from "./MarkdownRenderer";

function ActionButton({ icon: Icon, label, onClick, variant = "default" }) {
  const styles = {
    default: "text-[#A0A6B1] hover:text-white hover:bg-white/[0.08]",
    danger: "text-[#A0A6B1] hover:text-red-400 hover:bg-red-500/10",
    accent: "text-[#A0A6B1] hover:text-[#4F8CFF] hover:bg-[#4F8CFF]/10",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${styles[variant]}`}
    >
      <Icon size={11} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function MessageBubble({
  message,
  onEdit,
  onDelete,
  onRegenerate,
  isStreaming = false,
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 w-full group ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 text-white shadow-purple-500/20"
            : "bg-gradient-to-br from-[#4F8CFF] to-[#6BA3FF] text-white shadow-[#4F8CFF]/25"
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={`flex flex-col min-w-0 max-w-[min(100%,720px)] ${isUser ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div
          className={`relative rounded-2xl backdrop-blur-md ${
            isUser
              ? "bg-gradient-to-br from-[#4F8CFF] to-[#3B7AE8] text-white rounded-tr-sm shadow-lg shadow-[#4F8CFF]/15 px-4 py-3"
              : "bg-[#14171C]/80 text-white/90 border border-white/[0.08] rounded-tl-sm shadow-lg shadow-black/20 px-4 py-3.5"
          }`}
        >
          {!isUser && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#4F8CFF]/10 to-transparent rounded-2xl pointer-events-none" />
          )}

          {isUser ? (
            <p className="text-[13px] leading-[1.65] whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="relative z-10">
              <MarkdownRenderer content={message.content ?? ""} isStreaming={isStreaming} />
            </div>
          )}

          {(message.attachments ?? []).length > 0 && (
            <div className={`flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t ${isUser ? "border-white/20" : "border-white/[0.08]"}`}>
              {message.attachments.map((a) => (
                <span
                  key={a.id}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                    isUser ? "bg-white/15" : "bg-white/[0.06] border border-white/[0.08]"
                  }`}
                >
                  {a.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Meta + actions */}
        <div className={`flex items-center gap-1 mt-1.5 px-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="text-[9px] text-[#A0A6B1] font-mono mr-1">
            {formatRelativeTime(message.createdAt)}
          </span>

          <div
            className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 ${
              isUser ? "flex-row-reverse" : ""
            }`}
          >
            <ActionButton
              icon={copied ? Check : Copy}
              label={copied ? "Copied" : "Copy"}
              onClick={handleCopy}
            />
            {isUser && onEdit && (
              <ActionButton icon={Pencil} label="Edit" onClick={() => onEdit(message)} variant="accent" />
            )}
            {onDelete && (
              <ActionButton icon={Trash2} label="Delete" onClick={() => onDelete(message)} variant="danger" />
            )}
            {!isUser && onRegenerate && !isStreaming && (
              <ActionButton icon={RotateCcw} label="Regenerate" onClick={() => onRegenerate(message)} variant="accent" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
