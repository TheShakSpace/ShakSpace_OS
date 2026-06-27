import { create } from "zustand";
import {
  normalizeId,
  normalizeApiPayload,
  looksLikeHex,
  looksLikeGradient,
} from "../utils/workspaceHelpers";
import { workspaceService } from "../services/workspaceService";

function safeRollback(set, prevSnapshot) {
  set(() => prevSnapshot);
}

function extractWorkspace(res) {
  return res?.data?.data?.workspace ?? res?.data?.workspace ?? null;
}

function extractList(res) {
  const list = res?.data?.data?.items ?? res?.data?.workspaces ?? res?.data?.results ?? [];
  return Array.isArray(list) ? list : [];
}

function extractPagination(res) {
  return res?.data?.data?.pagination ?? res?.data?.pagination ?? null;
}

function extractStats(res) {
  return res?.data?.data ?? res?.data ?? null;
}

function normalizeWorkspace(w) {
  if (!w) return null;

  const id = w.id ?? w._id;
  const hexColor =
    looksLikeHex(w.color) && !looksLikeGradient(w.color)
      ? w.color
      : looksLikeHex(w.accentColor)
        ? w.accentColor
        : "#4F8CFF";

  return {
    ...w,
    id: id ? String(id) : undefined,
    pinned: Boolean(w.pinned),
    favorite: Boolean(w.favorite),
    archived: Boolean(w.archived),
    accentColor: hexColor,
    color: looksLikeGradient(w.color) ? w.color : hexColor,
    tags: Array.isArray(w.tags) ? w.tags : [],
    activity: Array.isArray(w.activity) ? w.activity : [],
    createdAt: w.createdAt ?? w.updatedAt ?? null,
    updatedAt: w.updatedAt ?? null,
    lastOpened: w.lastOpened ?? null,
  };
}

function replaceWorkspaceInList(workspaces, target, workspace) {
  return workspaces.map((w) =>
    normalizeId(w.id) === target && workspace ? workspace : w
  );
}

async function refreshAll(get) {
  await Promise.all([get().fetchWorkspaces(), get().fetchStats()]);
}

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  selectedWorkspace: null,
  currentWorkspace: null,
  loading: false,
  error: null,
  pagination: null,
  stats: null,
  statsLoading: false,
  statsError: null,
  _listRequestId: 0,

  fetchWorkspaces: async ({
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
    const requestId = get()._listRequestId + 1;
    set({ loading: true, error: null, _listRequestId: requestId });

    try {
      const res = await workspaceService.getAllWorkspaces({
        q,
        page,
        limit,
        sortBy,
        sortOrder,
        category,
        pinnedOnly,
        favoriteOnly,
        archivedOnly,
      });

      if (get()._listRequestId !== requestId) {
        return get().workspaces;
      }

      const workspaces = extractList(res).map(normalizeWorkspace);
      const pagination = extractPagination(res);

      set({ workspaces, pagination, loading: false, error: null });
      return workspaces;
    } catch (e) {
      if (get()._listRequestId === requestId) {
        set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      }
      throw e;
    }
  },

  getWorkspaceById: (id) => {
    const target = normalizeId(id);
    return get().workspaces.find((w) => normalizeId(w.id) === target) ?? null;
  },

  fetchWorkspace: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await workspaceService.getWorkspace(id);
      const workspace = normalizeWorkspace(extractWorkspace(res));

      set((state) => {
        const target = normalizeId(id);
        const exists = state.workspaces.some((w) => normalizeId(w.id) === target);
        return {
          workspaces: exists
            ? replaceWorkspaceInList(state.workspaces, target, workspace)
            : workspace
              ? [workspace, ...state.workspaces]
              : state.workspaces,
          currentWorkspace: workspace,
          selectedWorkspace: workspace,
          loading: false,
          error: null,
        };
      });

      return workspace;
    } catch (e) {
      set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  createWorkspace: async (payload) => {
    const prevSnapshot = { ...get() };
    const outgoingPayload = normalizeApiPayload(payload);

    set({ loading: true, error: null });

    try {
      const res = await workspaceService.createWorkspace(outgoingPayload);
      const workspace = normalizeWorkspace(extractWorkspace(res));

      set((state) => ({
        loading: false,
        error: null,
        workspaces: workspace ? [workspace, ...state.workspaces] : state.workspaces,
      }));

      await refreshAll(get);
      return workspace;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  updateWorkspace: async (id, payload) => {
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);
    const outgoingPayload = normalizeApiPayload(payload);

    set((state) => ({
      loading: true,
      error: null,
      workspaces: state.workspaces.map((w) =>
        normalizeId(w.id) === target
          ? normalizeWorkspace({ ...w, ...outgoingPayload, ...payload })
          : w
      ),
    }));

    try {
      const res = await workspaceService.updateWorkspace(id, outgoingPayload);
      const updated = normalizeWorkspace(extractWorkspace(res));

      set((state) => ({
        loading: false,
        error: null,
        workspaces: replaceWorkspaceInList(state.workspaces, target, updated),
        currentWorkspace:
          state.currentWorkspace && normalizeId(state.currentWorkspace.id) === target
            ? updated
            : state.currentWorkspace,
        selectedWorkspace:
          state.selectedWorkspace && normalizeId(state.selectedWorkspace.id) === target
            ? updated
            : state.selectedWorkspace,
      }));

      await get().fetchStats();
      return updated;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  deleteWorkspace: async (id) => {
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);

    set((state) => ({
      loading: true,
      error: null,
      workspaces: state.workspaces.filter((w) => normalizeId(w.id) !== target),
    }));

    try {
      await workspaceService.deleteWorkspace(id);
      set({ loading: false, error: null });
      await refreshAll(get);
      return true;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  pin: async (id, value) => {
    return get()._toggleFlagOptimistic(id, value, "pinned", workspaceService.pinWorkspace);
  },

  favorite: async (id, value) => {
    return get()._toggleFlagOptimistic(id, value, "favorite", workspaceService.favoriteWorkspace);
  },

  archive: async (id, value) => {
    return get()._toggleFlagOptimistic(id, value, "archived", workspaceService.archiveWorkspace);
  },

  restore: async (id) => {
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);

    set((state) => ({
      error: null,
      workspaces: state.workspaces.map((w) =>
        normalizeId(w.id) === target ? { ...w, archived: false } : w
      ),
    }));

    try {
      const res = await workspaceService.restoreWorkspace(id);
      const restored = normalizeWorkspace(extractWorkspace(res));

      set((state) => ({
        error: null,
        workspaces: replaceWorkspaceInList(state.workspaces, target, restored),
      }));

      await refreshAll(get);
      return restored;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  openWorkspace: async (id) => {
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);
    const now = new Date().toISOString();

    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        normalizeId(w.id) === target ? { ...w, lastOpened: now, archived: false } : w
      ),
    }));

    try {
      const res = await workspaceService.openWorkspace(id);
      const opened = normalizeWorkspace(extractWorkspace(res));

      set((state) => {
        const withLastOpened = opened ? { ...opened, lastOpened: now } : opened;
        return {
          workspaces: replaceWorkspaceInList(state.workspaces, target, withLastOpened),
          currentWorkspace:
            state.currentWorkspace && normalizeId(state.currentWorkspace.id) === target
              ? withLastOpened
              : state.currentWorkspace,
          selectedWorkspace:
            state.selectedWorkspace && normalizeId(state.selectedWorkspace.id) === target
              ? withLastOpened
              : state.selectedWorkspace,
        };
      });

      return opened;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  refresh: async () => {
    return refreshAll(get);
  },

  fetchStats: async () => {
    set({ statsLoading: true, statsError: null });
    try {
      const res = await workspaceService.getWorkspaceStats();
      const data = extractStats(res);
      set({ stats: data, statsLoading: false, statsError: null });
      return data;
    } catch (e) {
      set({
        statsLoading: false,
        statsError: e?.response?.data ?? e?.message ?? String(e),
      });
      throw e;
    }
  },

  _toggleFlagOptimistic: async (id, value, field, apiFn) => {
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);

    set((state) => ({
      error: null,
      workspaces: state.workspaces.map((w) =>
        normalizeId(w.id) === target ? { ...w, [field]: value } : w
      ),
    }));

    try {
      const res = await apiFn(id, value);
      const updated = normalizeWorkspace(extractWorkspace(res));

      set((state) => ({
        error: null,
        workspaces: replaceWorkspaceInList(state.workspaces, target, updated),
      }));

      await get().fetchStats();
      return updated;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  addWorkspace: (payload) => get().createWorkspace(payload),

  togglePinWorkspace: (id) => {
    const ws = get().getWorkspaceById(id);
    const next = !ws?.pinned;
    return get().pin(id, next);
  },

  toggleFavoriteWorkspace: (id) => {
    const ws = get().getWorkspaceById(id);
    const next = !ws?.favorite;
    return get().favorite(id, next);
  },

  archiveWorkspace: (id) => get().archive(id, true),

  restoreWorkspace: (id) => get().restore(id),

  duplicateWorkspace: (id) => {
    const ws = get().getWorkspaceById(id);
    if (!ws) return Promise.resolve(null);
    return get().createWorkspace({
      name: `${ws.name} (Copy)`,
      description: ws.description,
      category: ws.category,
      icon: ws.icon,
      color: ws.color,
      accentColor: ws.accentColor,
    });
  },
}));
