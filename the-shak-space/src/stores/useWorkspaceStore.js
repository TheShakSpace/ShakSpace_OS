import { create } from "zustand";
import { normalizeId } from "../utils/workspaceHelpers";
import { workspaceService } from "../services/workspaceService";

function safeRollback(set, prevSnapshot) {
  set(() => prevSnapshot);
}


function normalizeWorkspace(w) {
  // Backend is source-of-truth; minimal normalization for UI helpers.
  return {
    ...w,
    pinned: Boolean(w?.pinned),
    favorite: Boolean(w?.favorite),
    archived: Boolean(w?.archived),
    tags: Array.isArray(w?.tags) ? w.tags : [],
    activity: Array.isArray(w?.activity) ? w.activity : [],
    createdAt: w?.createdAt ?? w?.updatedAt ?? null,
    updatedAt: w?.updatedAt ?? null,
    lastOpened: w?.lastOpened ?? null,
  };
}

export const useWorkspaceStore = create((set, get) => ({
  // Cache
  workspaces: [],

  // Single selection/current
  selectedWorkspace: null,
  currentWorkspace: null,

  // UI states
  loading: false,
  error: null,

  // Stats cache
  stats: null,
  statsLoading: false,
  statsError: null,

  fetchWorkspaces: async ({
    q,
    page,
    limit,
    sortBy,
    sortOrder,
    category,
    pinnedOnly,
    favoriteOnly,
    archivedOnly,
  } = {}) => {
    set({ loading: true, error: null });
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

      const list =
        res?.data?.data?.items ??
        res?.data?.workspaces ??
        res?.data?.results ??
        res?.data ??
        [];

      const workspaces = Array.isArray(list) ? list.map(normalizeWorkspace) : [];

      set({ workspaces, loading: false, error: null });
      return workspaces;
    } catch (e) {
      set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
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
      const workspace = normalizeWorkspace(res?.data?.workspace ?? res?.data ?? null);
      set({ currentWorkspace: workspace, selectedWorkspace: workspace, loading: false });
      return workspace;
    } catch (e) {
      set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  createWorkspace: async (payload) => {
    const prevSnapshot = { ...get() };
    set({ loading: true, error: null });

    // Backend payload normalization (do NOT change UI)
    // - category must be one of: general/personal/team/education/business/research (lowercase)
    // - color must be a hex value (e.g. "#4F8CFF"), never a Tailwind gradient string
    // - if accentColor exists, send it as color
    const normalizeCreatePayload = (p) => {
      const safe = p ?? {};
      const rawCategory = safe.category;
      const category = typeof rawCategory === "string" ? rawCategory.toLowerCase() : rawCategory;

      const accentColor = safe.accentColor;
      const rawColor = safe.color;

      // Tailwind gradient patterns (e.g. "from-blue-500/20 to-indigo-500/10") should never be sent.
      const looksLikeGradient = (v) => {
        if (typeof v !== "string") return false;
        return /\bfrom-[a-z]+-\d+\/|\bto-[a-z]+-\d+\//i.test(v);
      };

      // Accept only hex-like values when sending to backend.
      const looksLikeHex = (v) => {
        if (typeof v !== "string") return false;
        return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(v.trim());
      };

      // If accentColor exists, it should be the backend color (per requirements).
      // Otherwise, only forward color if it's a valid hex.
      const backendColor = (() => {
        if (accentColor && looksLikeHex(accentColor) && !looksLikeGradient(accentColor)) return accentColor;
        if (rawColor && looksLikeHex(rawColor) && !looksLikeGradient(rawColor)) return rawColor;
        return undefined;
      })();

      return {
        name: safe.name,
        description: safe.description,
        category,
        color: backendColor,
        icon: safe.icon,
      };
    };

    const outgoingPayload = normalizeCreatePayload(payload);

    // optimistic: nothing reliable (backend will generate IDs); add placeholder only for immediate UX
    try {
      const res = await workspaceService.createWorkspace(outgoingPayload);
      const workspace = normalizeWorkspace(res?.data?.workspace ?? res?.data ?? null);


      set((state) => ({
        loading: false,
        error: null,
        workspaces: workspace
          ? [workspace, ...state.workspaces]
          : state.workspaces,
      }));

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

    // optimistic update: update fields on cached item
    set((state) => ({
      loading: true,
      error: null,
      workspaces: state.workspaces.map((w) =>
        normalizeId(w.id) === target
          ? normalizeWorkspace({ ...w, ...payload })
          : w
      ),
    }));

    try {
      const res = await workspaceService.updateWorkspace(id, payload);
      const updated = normalizeWorkspace(res?.data?.workspace ?? res?.data ?? null);

      set((state) => ({
        loading: false,
        error: null,
        workspaces: state.workspaces.map((w) =>
          normalizeId(w.id) === target && updated ? updated : w
        ),
        currentWorkspace:
          state.currentWorkspace && normalizeId(state.currentWorkspace.id) === target
            ? updated
            : state.currentWorkspace,
        selectedWorkspace:
          state.selectedWorkspace && normalizeId(state.selectedWorkspace.id) === target
            ? updated
            : state.selectedWorkspace,
      }));

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
    return get()._toggleFlagOptimistic(
      id,
      value,
      "favorite",
      workspaceService.favoriteWorkspace
    );
  },

  archive: async (id, value) => {
    return get()._toggleFlagOptimistic(
      id,
      value,
      "archived",
      workspaceService.archiveWorkspace
    );
  },

  restore: async (id) => {
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);

    set((state) => ({
      loading: true,
      error: null,
      workspaces: state.workspaces.map((w) =>
        normalizeId(w.id) === target ? { ...w, archived: false } : w
      ),
    }));

    try {
      const res = await workspaceService.restoreWorkspace(id);
      const restored = normalizeWorkspace(res?.data?.workspace ?? res?.data ?? null);

      set((state) => ({
        loading: false,
        error: null,
        workspaces: state.workspaces.map((w) =>
          normalizeId(w.id) === target && restored ? restored : w
        ),
      }));

      return restored;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  openWorkspace: async (id) => {
    // optional: optimistic lastOpened update
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);

    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        normalizeId(w.id) === target ? { ...w, lastOpened: new Date().toISOString() } : w
      ),
    }));

    try {
      const res = await workspaceService.openWorkspace(id);
      const opened = normalizeWorkspace(res?.data?.workspace ?? res?.data ?? null);

      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          normalizeId(w.id) === target && opened ? opened : w
        ),
        currentWorkspace:
          state.currentWorkspace && normalizeId(state.currentWorkspace.id) === target
            ? opened
            : state.currentWorkspace,
        selectedWorkspace:
          state.selectedWorkspace && normalizeId(state.selectedWorkspace.id) === target
            ? opened
            : state.selectedWorkspace,
      }));

      return opened;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  refresh: async () => {
    return get().fetchWorkspaces();
  },

  fetchStats: async () => {
    set({ statsLoading: true, statsError: null });
    try {
      const res = await workspaceService.getWorkspaceStats();
      const data = res?.data?.stats ?? res?.data?.data ?? res?.data ?? null;
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

  // ---- Optimistic helpers (internal) ----
  _toggleFlagOptimistic: async (id, value, field, apiFn) => {
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);

    set((state) => ({
      loading: true,
      error: null,
      workspaces: state.workspaces.map((w) =>
        normalizeId(w.id) === target ? { ...w, [field]: value } : w
      ),
    }));

    try {
      const res = await apiFn(id, value);
      const updated = normalizeWorkspace(res?.data?.workspace ?? res?.data ?? null);

      set((state) => ({
        loading: false,
        error: null,
        workspaces: state.workspaces.map((w) =>
          normalizeId(w.id) === target && updated ? updated : w
        ),
      }));

      return updated;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  // ---- Back-compat action names used by existing pages/components ----
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

  // used by list/details pages
  duplicateWorkspace: (id) => {
    const ws = get().getWorkspaceById(id);
    if (!ws) return Promise.resolve(null);
    const payload = {
      name: `${ws.name} (Copy)`,
      description: ws.description,
      category: ws.category,
      icon: ws.icon,
      color: ws.color,
      accentColor: ws.accentColor,
      tags: ws.tags,
    };
    return get().createWorkspace(payload);
  },

  // Existing pages compute stats client-side using helpers.
  // fetchStats() is still available for future wiring, but we don’t force it here.
}));


