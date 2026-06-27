import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useAIStore } from "../stores/useAIStore";
import {
  searchConversations,
  getConversationStats,
  generateMockResponse,
  generateId,
} from "../utils/aiHelpers";

import AIHero from "../components/ai/AIHero";
import ConversationSidebar from "../components/ai/ConversationSidebar";
import ConversationHeader from "../components/ai/ConversationHeader";
import ChatWindow from "../components/ai/ChatWindow";
import ChatInput from "../components/ai/ChatInput";

export default function AIAssistantPage() {
  const conversations = useAIStore((s) => s.conversations);
  const activeConversationId = useAIStore((s) => s.activeConversationId);
  const isGenerating = useAIStore((s) => s.isGenerating);

  const createConversation = useAIStore((s) => s.createConversation);
  const setActiveConversation = useAIStore((s) => s.setActiveConversation);
  const renameConversation = useAIStore((s) => s.renameConversation);
  const deleteConversation = useAIStore((s) => s.deleteConversation);
  const togglePinConversation = useAIStore((s) => s.togglePinConversation);
  const toggleFavoriteConversation = useAIStore((s) => s.toggleFavoriteConversation);
  const archiveConversation = useAIStore((s) => s.archiveConversation);
  const restoreConversation = useAIStore((s) => s.restoreConversation);
  const setConversationModel = useAIStore((s) => s.setConversationModel);
  const addMessage = useAIStore((s) => s.addMessage);
  const updateMessage = useAIStore((s) => s.updateMessage);
  const deleteMessage = useAIStore((s) => s.deleteMessage);
  const appendToMessage = useAIStore((s) => s.appendToMessage);
  const setIsGenerating = useAIStore((s) => s.setIsGenerating);

  const [search, setSearch] = useState("");
  const [sidebarFilter, setSidebarFilter] = useState("all");
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);

  const abortRef = useRef(false);
  const streamTimerRef = useRef(null);

  const stats = useMemo(() => getConversationStats(conversations), [conversations]);

  const filteredConversations = useMemo(() => {
    let list = searchConversations(conversations, search);
    if (sidebarFilter === "archived") list = list.filter((c) => c.archived);
    else list = list.filter((c) => !c.archived);
    return list;
  }, [conversations, search, sidebarFilter]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current = true;
    if (streamTimerRef.current) clearTimeout(streamTimerRef.current);
    setIsGenerating(false);
    setIsThinking(false);
    setStreamingMessageId(null);
  }, [setIsGenerating]);

  const streamResponse = useCallback(
    (conversationId, assistantMsgId, fullText) => {
      setIsGenerating(true);
      setStreamingMessageId(assistantMsgId);
      abortRef.current = false;

      let index = 0;

      const tick = () => {
        if (abortRef.current) {
          setIsGenerating(false);
          setStreamingMessageId(null);
          return;
        }

        if (index >= fullText.length) {
          setIsGenerating(false);
          setStreamingMessageId(null);
          return;
        }

        const char = fullText[index];
        const chunkSize =
          char === "\n" ? 1 : char === " " ? 2 : /[.!?]/.test(char) ? 3 : Math.random() > 0.7 ? 2 : 1;
        const chunk = fullText.slice(index, index + chunkSize);
        index += chunkSize;
        appendToMessage(conversationId, assistantMsgId, chunk);

        const delay = /[.!?\n]/.test(char) ? 28 : char === " " ? 8 : 12 + Math.random() * 8;
        streamTimerRef.current = setTimeout(tick, delay);
      };

      streamTimerRef.current = setTimeout(tick, 40);
    },
    [appendToMessage, setIsGenerating]
  );

  const sendMessage = useCallback(
    async (text) => {
      const content = (text ?? input).trim();
      if (!content && !attachments.length) return;

      let convId = activeConversationId;
      if (!convId) {
        convId = createConversation();
      }

      if (editingMessage) {
        updateMessage(convId, editingMessage.id, {
          content,
          attachments: [...attachments],
        });
        setEditingMessage(null);
        setInput("");
        setAttachments([]);
        return;
      }

      addMessage(convId, {
        role: "user",
        content,
        attachments: [...attachments],
      });

      setInput("");
      setAttachments([]);

      setIsThinking(true);
      setIsGenerating(true);

      await new Promise((r) => setTimeout(r, 600));
      if (abortRef.current) return;

      setIsThinking(false);

      const model = activeConversation?.model ?? "gpt";
      const response = generateMockResponse(content, model);
      const assistantId = generateId();

      addMessage(convId, { id: assistantId, role: "assistant", content: "" });
      streamResponse(convId, assistantId, response);
    },
    [
      input,
      attachments,
      activeConversationId,
      activeConversation,
      editingMessage,
      createConversation,
      addMessage,
      updateMessage,
      streamResponse,
      setIsGenerating,
    ]
  );

  const handleRegenerate = useCallback(
    (assistantMsgId) => {
      if (!activeConversationId || !activeConversation) return;
      const idx = activeConversation.messages.findIndex((m) => m.id === assistantMsgId);
      if (idx <= 0) return;

      const userMsg = activeConversation.messages[idx - 1];
      if (userMsg?.role !== "user") return;

      deleteMessage(activeConversationId, assistantMsgId);

      setIsThinking(true);
      setTimeout(() => {
        setIsThinking(false);
        const response = generateMockResponse(userMsg.content, activeConversation.model);
        const assistantId = generateId();
        addMessage(activeConversationId, { id: assistantId, role: "assistant", content: "" });
        streamResponse(activeConversationId, assistantId, response);
      }, 500);
    },
    [activeConversationId, activeConversation, deleteMessage, addMessage, streamResponse]
  );

  const handleRenameHeader = useCallback(() => {
    if (!activeConversation) return;
    const title = window.prompt("Rename conversation", activeConversation.title);
    if (title) renameConversation(activeConversation.id, title);
  }, [activeConversation, renameConversation]);

  const handleDeleteConv = useCallback(() => {
    if (!activeConversation) return;
    const ok = window.confirm("Delete this conversation?");
    if (!ok) return;
    deleteConversation(activeConversation.id);
  }, [activeConversation, deleteConversation]);

  return (
    <div className="flex flex-col gap-3 max-w-7xl mx-auto h-[calc(100vh-120px)] min-h-[520px]">
      <AIHero stats={stats} />

      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 flex-1 min-h-0">
        <ConversationSidebar
          conversations={filteredConversations}
          activeId={activeConversationId}
          search={search}
          onSearchChange={setSearch}
          filter={sidebarFilter}
          onFilterChange={setSidebarFilter}
          onSelect={setActiveConversation}
          onNewChat={() => {
            stopGeneration();
            createConversation();
            setInput("");
            setAttachments([]);
            setEditingMessage(null);
          }}
          onRename={renameConversation}
          onDelete={(id) => {
            const ok = window.confirm("Delete this conversation?");
            if (ok) deleteConversation(id);
          }}
          onTogglePin={togglePinConversation}
          onToggleFavorite={toggleFavoriteConversation}
          onArchive={archiveConversation}
          onRestore={restoreConversation}
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col min-w-0 min-h-0 gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm overflow-hidden p-2.5 sm:p-3"
        >
          <ConversationHeader
            conversation={activeConversation}
            model={activeConversation?.model ?? "gpt"}
            onModelChange={(m) => activeConversationId && setConversationModel(activeConversationId, m)}
            onRename={handleRenameHeader}
            onTogglePin={() => activeConversationId && togglePinConversation(activeConversationId)}
            onToggleFavorite={() => activeConversationId && toggleFavoriteConversation(activeConversationId)}
            onArchive={() => activeConversationId && archiveConversation(activeConversationId)}
            onDelete={handleDeleteConv}
            isGenerating={isGenerating}
          />

          <ChatWindow
            conversation={activeConversation}
            isGenerating={isGenerating}
            isThinking={isThinking}
            streamingMessageId={streamingMessageId}
            onSelectPrompt={(prompt) => {
              setInput(prompt);
              sendMessage(prompt);
            }}
            onEditMessage={(msg) => {
              setEditingMessage(msg);
              setInput(msg.content);
            }}
            onDeleteMessage={(msgId) => activeConversationId && deleteMessage(activeConversationId, msgId)}
            onRegenerate={handleRegenerate}
          />

          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => sendMessage()}
            onStop={stopGeneration}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            isGenerating={isGenerating}
            editingMessage={editingMessage}
            onCancelEdit={() => {
              setEditingMessage(null);
              setInput("");
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
