import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot } from "lucide-react";
import MessageBubble from "./MessageBubble";
import EmptyChatState from "./EmptyChatState";
import TypingIndicator from "./TypingIndicator";
import ThinkingAnimation from "./ThinkingAnimation";

function AssistantAvatar() {
  return (
    <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-[#4F8CFF] to-[#6BA3FF] text-white shadow-lg shadow-[#4F8CFF]/25">
      <Bot size={16} />
    </div>
  );
}

export default function ChatWindow({
  conversation,
  isGenerating,
  isThinking,
  streamingMessageId,
  onSelectPrompt,
  onEditMessage,
  onDeleteMessage,
  onRegenerate,
}) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const messages = conversation?.messages ?? [];
  const messageCount = messages.length;
  const isEmpty = messageCount === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount, isGenerating, isThinking, streamingMessageId]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-inner shadow-black/10 relative">
      {/* Top fade */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#0F1115]/80 to-transparent z-10" />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6 scroll-smooth">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <EmptyChatState key="empty" onSelectPrompt={onSelectPrompt} />
          ) : (
            <motion.div key={conversation?.id ?? "messages"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl mx-auto w-full">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isStreaming={streamingMessageId === msg.id}
                  onEdit={onEditMessage}
                  onDelete={() => onDeleteMessage(msg.id)}
                  onRegenerate={
                    msg.role === "assistant" ? () => onRegenerate(msg.id) : undefined
                  }
                />
              ))}

              {isThinking && (
                <div className="flex gap-3 max-w-3xl mx-auto w-full">
                  <AssistantAvatar />
                  <ThinkingAnimation />
                </div>
              )}

              {isGenerating && !streamingMessageId && !isThinking && (
                <div className="flex gap-3 max-w-3xl mx-auto w-full">
                  <AssistantAvatar />
                  <TypingIndicator />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0F1115]/60 to-transparent" />
    </div>
  );
}
