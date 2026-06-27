import { motion } from "motion/react";
import { Pin, Star, Sparkles } from "lucide-react";
import { getModelById } from "../../utils/aiHelpers";
import ModelSelector from "./ModelSelector";
import ConversationSettings from "./ConversationSettings";

export default function ConversationHeader({
  conversation,
  model,
  onModelChange,
  onRename,
  onTogglePin,
  onToggleFavorite,
  onArchive,
  onDelete,
  isGenerating,
}) {
  if (!conversation) {
    return (
      <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-md rounded-t-2xl shrink-0">
        <p className="text-sm text-[#A0A6B1]">Select or start a conversation</p>
      </div>
    );
  }

  const modelInfo = getModelById(model);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.03] backdrop-blur-xl shrink-0 rounded-t-2xl">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          {conversation.pinned && (
            <Pin size={12} className="text-[#4F8CFF] shrink-0" />
          )}
          {conversation.favorite && (
            <Star size={12} className="text-amber-400 shrink-0 fill-amber-400/20" />
          )}
          <h2 className="text-sm font-bold text-white truncate tracking-tight">{conversation.title}</h2>
          {isGenerating && (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4F8CFF]/15 border border-[#4F8CFF]/25 text-[9px] font-semibold text-[#4F8CFF] shrink-0"
            >
              <Sparkles size={9} />
              Live
            </motion.span>
          )}
        </div>
        <p className="text-[10px] text-[#A0A6B1] flex items-center gap-2 flex-wrap">
          <span>{conversation.messages?.length ?? 0} messages</span>
          <span className="text-white/20">·</span>
          <span className="font-mono">{conversation.tokenCount ?? 0} tokens</span>
          <span className="text-white/20">·</span>
          <span className="text-[#4F8CFF]/80">{modelInfo.badge}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <ModelSelector value={model} onChange={onModelChange} disabled={isGenerating} />
        <ConversationSettings
          conversation={conversation}
          onRename={onRename}
          onTogglePin={onTogglePin}
          onToggleFavorite={onToggleFavorite}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
