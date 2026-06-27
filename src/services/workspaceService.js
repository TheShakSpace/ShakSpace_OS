import { api } from "./api";

export const workspaceService = {
  getAllWorkspaces: ({
    q,
    page = 1,
    limit = 100,
    sortBy,
    sortOrder,
    category,
    pinnedOnly,
    favoriteOnly,
    archivedOnly,
  } = {}) => {
    const params = {};
    if (q) params.q = q;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    if (category) params.category = category;
    if (pinnedOnly !== undefined) params.pinnedOnly = pinnedOnly;
    if (favoriteOnly !== undefined) params.favoriteOnly = favoriteOnly;
    if (archivedOnly !== undefined) params.archivedOnly = archivedOnly;

    return api.get("/workspaces", { params });
  },

  getWorkspace: (id) => api.get(`/workspaces/${id}`),

  createWorkspace: (payload) => api.post("/workspaces", payload),

  updateWorkspace: (id, payload) => api.put(`/workspaces/${id}`, payload),

  deleteWorkspace: (id) => api.delete(`/workspaces/${id}`),

  pinWorkspace: (id, value) =>
    api.patch(`/workspaces/${id}/pin`, { value }),

  favoriteWorkspace: (id, value) =>
    api.patch(`/workspaces/${id}/favorite`, { value }),

  archiveWorkspace: (id, value) =>
    api.patch(`/workspaces/${id}/archive`, { value }),

  restoreWorkspace: (id) => api.patch(`/workspaces/${id}/restore`),

  openWorkspace: (id) => api.patch(`/workspaces/${id}/open`),

  getWorkspaceStats: () => api.get("/workspaces/stats"),
};

