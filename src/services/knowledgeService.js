import { api } from "./api";

export const knowledgeService = {
  getAllKnowledge: ({
    q,
    search,
    page = 1,
    limit = 100,
    sortBy,
    sortOrder,
    workspaceId,
    category,
    tags,
    pinned,
    favorite,
    archived,
  } = {}) => {
    const params = {};
    const term = search || q;
    if (term) params.search = term;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    if (workspaceId) params.workspaceId = workspaceId;
    if (category) params.category = category;
    if (tags) params.tags = Array.isArray(tags) ? tags.join(",") : tags;
    if (pinned !== undefined) params.pinned = pinned;
    if (favorite !== undefined) params.favorite = favorite;
    if (archived !== undefined) params.archived = archived;
    return api.get("/knowledge", { params });
  },

  getKnowledge: (id) => api.get(`/knowledge/${id}`),

  createKnowledge: (payload) => api.post("/knowledge", payload),

  updateKnowledge: (id, payload) => api.put(`/knowledge/${id}`, payload),

  deleteKnowledge: (id) => api.delete(`/knowledge/${id}`),

  pinKnowledge: (id, value) => api.patch(`/knowledge/${id}/pin`, { value }),

  favoriteKnowledge: (id, value) => api.patch(`/knowledge/${id}/favorite`, { value }),

  archiveKnowledge: (id, value) => api.patch(`/knowledge/${id}/archive`, { value }),

  restoreKnowledge: (id) => api.patch(`/knowledge/${id}/restore`),

  openKnowledge: (id) => api.patch(`/knowledge/${id}/open`),

  getKnowledgeStats: (workspaceId) =>
    api.get("/knowledge/stats", { params: workspaceId ? { workspaceId } : {} }),

  getKnowledgeTags: (workspaceId) =>
    api.get("/knowledge/tags", { params: workspaceId ? { workspaceId } : {} }),
};
