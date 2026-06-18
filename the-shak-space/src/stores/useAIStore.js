import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createDefaultConversation,
  createDefaultMessage,
  migrateConversation,
  normalizeId,
  deriveTitleFromMessage,
  estimateTokens,
} from "../utils/aiHelpers";

const initialConversations = [
  createDefaultConversation({
    id: "conv-welcome",
    title: "Shak Space Overview",
    model: "gpt",
    pinned: true,
    favorite: true,
    messages: [
      createDefaultMessage({
        id: "msg-w1",
        role: "assistant",
        content:
          "Welcome to **The Shak Space AI Assistant**. I have indexed your workspaces, knowledge notes, and automation rules.\n\nAsk me anything — summarize docs, draft content, explain code, or plan workflows.",
      }),
    ],
    tokenCount: 120,
  }),
];

function mapConversation(state, id, updater) {
  const targetId = normalizeId(id);
  return {
    conversations: state.conversations.map((c) =>
      normalizeId(c.id) === targetId ? updater(c) : c
    ),
  };
}

export const useAIStore = create(
  persist(
    (set, get) => ({
      conversations: initialConversations,
      activeConversationId: "conv-welcome",
      isGenerating: false,

      createConversation: (overrides = {}) => {
        const conv = createDefaultConversation(overrides);
        set((state) => ({
          conversations: [conv, ...state.conversations],
          activeConversationId: conv.id,
        }));
        return conv.id;
      },

      setActiveConversation: (id) => {
        set((state) => ({
          ...mapConversation(state, id, (c) => ({
            ...c,
            lastOpened: new Date().toISOString(),
          })),
          activeConversationId: normalizeId(id),
        }));
      },

      renameConversation: (id, title) =>
        set((state) =>
          mapConversation(state, id, (c) => ({
            ...c,
            title: title.trim() || c.title,
            updatedAt: new Date().toISOString(),
          }))
        ),

      deleteConversation: (id) =>
        set((state) => {
          const remaining = state.conversations.filter(
            (c) => normalizeId(c.id) !== normalizeId(id)
          );
          const activeId =
            normalizeId(state.activeConversationId) === normalizeId(id)
              ? remaining[0]?.id ?? null
              : state.activeConversationId;
          return { conversations: remaining, activeConversationId: activeId };
        }),

      togglePinConversation: (id) =>
        set((state) =>
          mapConversation(state, id, (c) => ({
            ...c,
            pinned: !c.pinned,
            updatedAt: new Date().toISOString(),
          }))
        ),

      toggleFavoriteConversation: (id) =>
        set((state) =>
          mapConversation(state, id, (c) => ({
            ...c,
            favorite: !c.favorite,
            updatedAt: new Date().toISOString(),
          }))
        ),

      archiveConversation: (id) =>
        set((state) =>
          mapConversation(state, id, (c) => ({
            ...c,
            archived: true,
            pinned: false,
            updatedAt: new Date().toISOString(),
          }))
        ),

      restoreConversation: (id) =>
        set((state) =>
          mapConversation(state, id, (c) => ({
            ...c,
            archived: false,
            updatedAt: new Date().toISOString(),
          }))
        ),

      setConversationModel: (id, model) =>
        set((state) =>
          mapConversation(state, id, (c) => ({ ...c, model, updatedAt: new Date().toISOString() }))
        ),

      addMessage: (conversationId, message) =>
        set((state) =>
          mapConversation(state, conversationId, (c) => {
            const msg = createDefaultMessage(message);
            const tokens = estimateTokens(msg.content);
            return {
              ...c,
              messages: [...c.messages, msg],
              tokenCount: (c.tokenCount ?? 0) + tokens,
              updatedAt: new Date().toISOString(),
              title:
                c.messages.length === 0 && msg.role === "user"
                  ? deriveTitleFromMessage(msg.content)
                  : c.title,
            };
          })
        ),

      updateMessage: (conversationId, messageId, data) =>
        set((state) =>
          mapConversation(state, conversationId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              normalizeId(m.id) === normalizeId(messageId) ? { ...m, ...data } : m
            ),
            updatedAt: new Date().toISOString(),
          }))
        ),

      deleteMessage: (conversationId, messageId) =>
        set((state) =>
          mapConversation(state, conversationId, (c) => ({
            ...c,
            messages: c.messages.filter(
              (m) => normalizeId(m.id) !== normalizeId(messageId)
            ),
            updatedAt: new Date().toISOString(),
          }))
        ),

      appendToMessage: (conversationId, messageId, chunk) =>
        set((state) =>
          mapConversation(state, conversationId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              normalizeId(m.id) === normalizeId(messageId)
                ? { ...m, content: (m.content ?? "") + chunk }
                : m
            ),
          }))
        ),

      setIsGenerating: (isGenerating) => set({ isGenerating }),

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find(
          (c) => normalizeId(c.id) === normalizeId(activeConversationId)
        );
      },

      getConversationById: (id) =>
        get().conversations.find((c) => normalizeId(c.id) === normalizeId(id)),
    }),
    {
      name: "shak-space-ai",
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState ?? {};
        const raw = Array.isArray(state.conversations) ? state.conversations : [];
        return {
          ...state,
          conversations:
            raw.length > 0 ? raw.map(migrateConversation) : initialConversations,
          activeConversationId: state.activeConversationId ?? "conv-welcome",
          isGenerating: false,
        };
      },
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);
