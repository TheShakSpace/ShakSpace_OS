import { create } from "zustand";
import { aiService } from "../services/aiService";
import { normalizeConversation, normalizeMessage } from "../utils/aiHelpers";

function extractConversations(res) {
  const list = res?.data?.data?.items ?? res?.data?.items ?? [];
  return Array.isArray(list) ? list : [];
}

function extractConversation(res) {
  return res?.data?.data?.conversation ?? res?.data?.conversation ?? null;
}

function extractMessages(res) {
  const list = res?.data?.data?.messages ?? res?.data?.messages ?? [];
  return Array.isArray(list) ? list : [];
}

function extractChatResult(res) {
  return res?.data?.data ?? res?.data ?? {};
}

function extractApiError(err) {
  const data = err?.response?.data;
  return (
    data?.error?.message ??
    data?.message ??
    (typeof data?.error === "string" ? data.error : null) ??
    err?.message ??
    "Request failed"
  );
}

export const useAIStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  streaming: false,
  error: null,
  provider: "gemini",
  model: "gemini-2.0-flash",
  _conversationsRequestId: 0,
  _messagesRequestId: 0,

  setProvider: (provider) => set({ provider }),
  setModel: (model) => set({ model }),

  fetchConversations: async () => {
    const requestId = get()._conversationsRequestId + 1;
    set({ loading: true, error: null, _conversationsRequestId: requestId });
    try {
      const res = await aiService.getConversations();
      if (get()._conversationsRequestId !== requestId) return get().conversations;
      const conversations = extractConversations(res).map(normalizeConversation);
      set({ conversations, error: null });
      return conversations;
    } catch (e) {
      if (get()._conversationsRequestId === requestId) {
        set({ error: extractApiError(e) });
      }
      throw e;
    } finally {
      if (get()._conversationsRequestId === requestId) {
        set({ loading: false });
      }
    }
  },

  createConversation: async (payload = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await aiService.createConversation({
        title: payload.title || "New conversation",
        provider: payload.provider || get().provider,
        model: payload.model || get().model,
      });
      const conversation = normalizeConversation(extractConversation(res));
      if (!conversation) throw new Error("Failed to create conversation");
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        currentConversation: conversation,
        messages: [],
        error: null,
      }));
      return conversation;
    } catch (e) {
      set({ error: extractApiError(e) });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  renameConversation: async (id, title) => {
    const trimmed = String(title ?? "").trim();
    if (!trimmed) return null;
    set({ error: null });
    try {
      const res = await aiService.updateConversation(id, { title: trimmed });
      const conversation = normalizeConversation(extractConversation(res));
      set((state) => ({
        conversations: state.conversations.map((c) => (c.id === id ? conversation : c)),
        currentConversation:
          state.currentConversation?.id === id ? conversation : state.currentConversation,
        error: null,
      }));
      return conversation;
    } catch (e) {
      set({ error: extractApiError(e) });
      throw e;
    }
  },

  deleteConversation: async (id) => {
    set({ error: null });
    try {
      await aiService.deleteConversation(id);
      set((state) => {
        const conversations = state.conversations.filter((c) => c.id !== id);
        const isCurrent = state.currentConversation?.id === id;
        return {
          conversations,
          currentConversation: isCurrent ? null : state.currentConversation,
          messages: isCurrent ? [] : state.messages,
          error: null,
        };
      });
      return true;
    } catch (e) {
      set({ error: extractApiError(e) });
      throw e;
    }
  },

  fetchMessages: async (conversationId) => {
    if (!conversationId) return [];
    const requestId = get()._messagesRequestId + 1;
    set({ loading: true, error: null, _messagesRequestId: requestId });
    try {
      const res = await aiService.getMessages(conversationId);
      if (get()._messagesRequestId !== requestId) return get().messages;
      const messages = extractMessages(res).map(normalizeMessage);
      set({ messages, error: null });
      return messages;
    } catch (e) {
      if (get()._messagesRequestId === requestId) {
        set({ error: extractApiError(e) });
      }
      throw e;
    } finally {
      if (get()._messagesRequestId === requestId) {
        set({ loading: false });
      }
    }
  },

  sendMessage: async (message, { conversationId } = {}) => {
    const content = String(message ?? "").trim();
    if (!content) return null;

    set({ streaming: true, error: null });
    try {
      const res = await aiService.chat({
        conversationId: conversationId || get().currentConversation?.id,
        message: content,
        provider: get().provider,
        model: get().model,
      });

      const result = extractChatResult(res);
      const conversation = normalizeConversation(result.conversation);
      const userMessage = normalizeMessage(result.userMessage);
      const assistantMessage = normalizeMessage(result.assistantMessage);

      set((state) => {
        const exists = state.conversations.some((c) => c.id === conversation?.id);
        const conversations = exists
          ? state.conversations.map((c) => (c.id === conversation?.id ? conversation : c))
          : conversation
            ? [conversation, ...state.conversations]
            : state.conversations;

        return {
          conversations,
          currentConversation: conversation || state.currentConversation,
          messages: [...state.messages, userMessage, assistantMessage].filter(Boolean),
          streaming: false,
          error: null,
        };
      });

      return { conversation, userMessage, assistantMessage };
    } catch (e) {
      set({ streaming: false, error: extractApiError(e) });
      throw e;
    }
  },

  setCurrentConversation: (conversation) => {
    set({
      currentConversation: conversation ? normalizeConversation(conversation) : null,
      messages: [],
      error: null,
    });
  },

  clearConversation: () => {
    set({ currentConversation: null, messages: [], error: null });
  },
}));
