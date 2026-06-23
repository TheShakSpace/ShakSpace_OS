import { create } from "zustand";
import { normalizeId, normalizeApiPayload, normalizeKnowledgeItem } from "../utils/knowledgeHelpers";
import { knowledgeService } from "../services/knowledgeService";

function safeRollback(set, prevSnapshot) {
  set(() => prevSnapshot);
}

function extractItem(res) {
  return res?.data?.data?.item ?? res?.data?.item ?? null;
}

function extractList(res) {
  const list = res?.data?.data?.items ?? res?.data?.items ?? [];
  return Array.isArray(list) ? list : [];
}

function extractPagination(res) {
  return res?.data?.data?.pagination ?? res?.data?.pagination ?? null;
}

function extractStats(res) {
  return res?.data?.data ?? res?.data ?? null;
}

function extractTags(res) {
  return res?.data?.data?.tags ?? res?.data?.tags ?? [];
}

function replaceInList(items, target, item) {
  return items.map((n) => (normalizeId(n.id) === target && item ? item : n));
}

async function refreshAll(get) {
  await Promise.all([get().fetchKnowledge(), get().fetchStats()]);
}

export const useKnowledgeStore = create((set, get) => ({
  knowledge: [],
  selectedKnowledge: null,
  currentKnowledge: null,
  loading: false,
  error: null,
  pagination: null,
  stats: null,
  statsLoading: false,
  statsError: null,
  tags: [],
  search: "",
  filters: {
    workspaceId: null,
    category: "all",
    tag: "",
    pinned: undefined,
    favorite: undefined,
    archived: undefined,
  },
  _listRequestId: 0,

  setSearch: (search) => set({ search }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

  fetchKnowledge: async ({
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
    const requestId = get()._listRequestId + 1;
    set({ loading: true, error: null, _listRequestId: requestId });

    const stateFilters = get().filters;
    const term = search ?? q ?? get().search;

    try {
      const res = await knowledgeService.getAllKnowledge({
        q: term,
        search: term,
        page,
        limit,
        sortBy,
        sortOrder,
        workspaceId: workspaceId ?? stateFilters.workspaceId ?? undefined,
        category: category && category !== "all" ? category : stateFilters.category !== "all" ? stateFilters.category : undefined,
        tags: tags ?? (stateFilters.tag ? stateFilters.tag : undefined),
        pinned,
        favorite,
        archived,
      });

      if (get()._listRequestId !== requestId) return get().knowledge;

      const knowledge = extractList(res).map(normalizeKnowledgeItem);
      const pagination = extractPagination(res);
      set({ knowledge, pagination, loading: false, error: null });
      return knowledge;
    } catch (e) {
      if (get()._listRequestId === requestId) {
        set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      }
      throw e;
    }
  },

  fetchKnowledgeById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await knowledgeService.getKnowledge(id);
      const item = normalizeKnowledgeItem(extractItem(res));

      set((state) => {
        const target = normalizeId(id);
        const exists = state.knowledge.some((n) => normalizeId(n.id) === target);
        return {
          knowledge: exists
            ? replaceInList(state.knowledge, target, item)
            : item
              ? [item, ...state.knowledge]
              : state.knowledge,
          currentKnowledge: item,
          selectedKnowledge: item,
          loading: false,
          error: null,
        };
      });

      return item;
    } catch (e) {
      set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  getKnowledgeById: (id) => {
    const target = normalizeId(id);
    return get().knowledge.find((n) => normalizeId(n.id) === target) ?? null;
  },

  createKnowledge: async (payload) => {
    const prevSnapshot = { ...get() };
    set({ loading: true, error: null });

    try {
      const res = await knowledgeService.createKnowledge(normalizeApiPayload(payload));
      const item = normalizeKnowledgeItem(extractItem(res));

      set((state) => ({
        loading: false,
        error: null,
        knowledge: item ? [item, ...state.knowledge] : state.knowledge,
      }));

      await refreshAll(get);
      return item;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  updateKnowledge: async (id, payload) => {
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);
    const outgoing = normalizeApiPayload(payload);

    set((state) => ({
      loading: true,
      error: null,
      knowledge: state.knowledge.map((n) =>
        normalizeId(n.id) === target ? normalizeKnowledgeItem({ ...n, ...outgoing, ...payload }) : n
      ),
    }));

    try {
      const res = await knowledgeService.updateKnowledge(id, outgoing);
      const updated = normalizeKnowledgeItem(extractItem(res));

      set((state) => ({
        loading: false,
        error: null,
        knowledge: replaceInList(state.knowledge, target, updated),
        currentKnowledge:
          state.currentKnowledge && normalizeId(state.currentKnowledge.id) === target
            ? updated
            : state.currentKnowledge,
        selectedKnowledge:
          state.selectedKnowledge && normalizeId(state.selectedKnowledge.id) === target
            ? updated
            : state.selectedKnowledge,
      }));

      return updated;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  deleteKnowledge: async (id) => {
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);

    set((state) => ({
      loading: true,
      error: null,
      knowledge: state.knowledge.filter((n) => normalizeId(n.id) !== target),
    }));

    try {
      await knowledgeService.deleteKnowledge(id);
      set({ loading: false, error: null });
      await refreshAll(get);
      return true;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ loading: false, error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  togglePin: (id) => {
    const item = get().getKnowledgeById(id);
    return get()._toggleFlag(id, !item?.pinned, "pinned", knowledgeService.pinKnowledge);
  },

  toggleFavorite: (id) => {
    const item = get().getKnowledgeById(id);
    return get()._toggleFlag(id, !item?.favorite, "favorite", knowledgeService.favoriteKnowledge);
  },

  toggleArchive: (id) => {
    const item = get().getKnowledgeById(id);
    return get()._toggleFlag(id, !item?.archived, "archived", knowledgeService.archiveKnowledge);
  },

  archiveKnowledge: (id) => get()._toggleFlag(id, true, "archived", knowledgeService.archiveKnowledge),

  restore: async (id) => {
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);

    set((state) => ({
      error: null,
      knowledge: state.knowledge.map((n) =>
        normalizeId(n.id) === target ? { ...n, archived: false } : n
      ),
    }));

    try {
      const res = await knowledgeService.restoreKnowledge(id);
      const restored = normalizeKnowledgeItem(extractItem(res));
      set((state) => ({
        error: null,
        knowledge: replaceInList(state.knowledge, target, restored),
      }));
      await refreshAll(get);
      return restored;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  openKnowledge: async (id) => {
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);
    const now = new Date().toISOString();

    set((state) => ({
      knowledge: state.knowledge.map((n) =>
        normalizeId(n.id) === target ? { ...n, lastOpened: now, archived: false } : n
      ),
    }));

    try {
      const res = await knowledgeService.openKnowledge(id);
      const opened = normalizeKnowledgeItem(extractItem(res));
      const withOpened = opened ? { ...opened, lastOpened: now } : opened;

      set((state) => ({
        knowledge: replaceInList(state.knowledge, target, withOpened),
        currentKnowledge:
          state.currentKnowledge && normalizeId(state.currentKnowledge.id) === target
            ? withOpened
            : state.currentKnowledge,
      }));

      return withOpened;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },

  duplicateKnowledge: (id) => {
    const item = get().getKnowledgeById(id);
    if (!item) return Promise.resolve(null);
    return get().createKnowledge({
      workspaceId: item.workspaceId,
      title: `${item.title} (Copy)`,
      content: item.content,
      summary: item.summary,
      tags: item.tags,
      category: item.category,
      color: item.color,
      icon: item.icon,
    });
  },

  fetchStats: async (workspaceId) => {
    set({ statsLoading: true, statsError: null });
    try {
      const res = await knowledgeService.getKnowledgeStats(workspaceId);
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

  fetchTags: async (workspaceId) => {
    try {
      const res = await knowledgeService.getKnowledgeTags(workspaceId);
      const tags = extractTags(res);
      set({ tags: Array.isArray(tags) ? tags : [] });
      return tags;
    } catch {
      return [];
    }
  },

  refresh: async () => refreshAll(get),

  _toggleFlag: async (id, value, field, apiFn) => {
    const prevSnapshot = { ...get() };
    const target = normalizeId(id);

    set((state) => ({
      error: null,
      knowledge: state.knowledge.map((n) =>
        normalizeId(n.id) === target ? { ...n, [field]: value } : n
      ),
    }));

    try {
      const res = await apiFn(id, value);
      const updated = normalizeKnowledgeItem(extractItem(res));
      set((state) => ({
        error: null,
        knowledge: replaceInList(state.knowledge, target, updated),
      }));
      await get().fetchStats();
      return updated;
    } catch (e) {
      safeRollback(set, prevSnapshot);
      set({ error: e?.response?.data ?? e?.message ?? String(e) });
      throw e;
    }
  },
}));
