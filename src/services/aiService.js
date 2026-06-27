import { api } from "./api";

export const aiService = {
  getConversations: ({ page = 1, limit = 50 } = {}) =>
    api.get("/ai/conversations", { params: { page, limit } }),

  createConversation: (payload) => api.post("/ai/conversations", payload),

  updateConversation: (id, payload) => api.patch(`/ai/conversations/${id}`, payload),

  deleteConversation: (id) => api.delete(`/ai/conversations/${id}`),

  getMessages: (conversationId) => api.get(`/ai/messages/${conversationId}`),

  chat: (payload) => api.post("/ai/chat", payload),
};
