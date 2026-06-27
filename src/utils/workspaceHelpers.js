export const BACKEND_CATEGORIES = [
  "general",
  "personal",
  "team",
  "education",
  "business",
  "research",
];

export const WORKSPACE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "personal", label: "Personal" },
  { value: "team", label: "Team" },
  { value: "education", label: "Education" },
  { value: "business", label: "Business" },
  { value: "research", label: "Research" },
];

const CATEGORY_ALIASES = {
  development: "general",
  dev: "general",
  startup: "business",
  "ai project": "research",
  "ai-project": "research",
  aiproject: "research",
  college: "education",
  freelancing: "business",
  freelance: "business",
  "open source": "team",
  "open-source": "team",
  opensource: "team",
  client: "business",
  learning: "education",
};

const CATEGORY_LABELS = {
  general: "General",
  personal: "Personal",
  team: "Team",
  education: "Education",
  business: "Business",
  research: "Research",
};

export const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
];

export const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "pinned", label: "Pinned" },
  { id: "favorites", label: "Favorites" },
  { id: "archived", label: "Archived" },
];

export function normalizeId(id) {
  return id == null ? "" : String(id);
}

export function looksLikeHex(value) {
  if (typeof value !== "string") return false;
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(value.trim());
}

export function looksLikeGradient(value) {
  if (typeof value !== "string") return false;
  return /\bfrom-|\bto-/i.test(value);
}

export function normalizeCategoryForApi(value) {
  if (!value || typeof value !== "string") return "general";
  const lower = value.trim().toLowerCase();
  if (BACKEND_CATEGORIES.includes(lower)) return lower;
  return CATEGORY_ALIASES[lower] ?? "general";
}

export function formatCategoryLabel(value) {
  if (!value) return "General";
  const lower = String(value).trim().toLowerCase();
  return CATEGORY_LABELS[lower] ?? value;
}

export function normalizeApiPayload(payload) {
  const safe = payload ?? {};

  const backendColor = (() => {
    const accent = safe.accentColor;
    const raw = safe.color;
    if (accent && looksLikeHex(accent) && !looksLikeGradient(accent)) return accent;
    if (raw && looksLikeHex(raw) && !looksLikeGradient(raw)) return raw;
    return "#4F8CFF";
  })();

  return {
    name: safe.name,
    description: safe.description ?? "",
    category: normalizeCategoryForApi(safe.category),
    color: backendColor,
    icon: safe.icon ?? "📁",
  };
}

export function extractApiError(error) {
  const data = error?.response?.data;
  if (!data) return error?.message ?? "Something went wrong";

  if (typeof data === "string") return data;

  if (data?.error?.message) return data.error.message;
  if (data?.error?.details?.length) {
    return data.error.details.map((d) => d.message).join(", ");
  }
  if (data?.message) return data.message;

  return "Something went wrong";
}

export function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function formatRelativeTime(iso) {
  if (!iso) return "Never";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(iso);
  } catch {
    return "—";
  }
}

export function formatStorage(mb) {
  const value = Number(mb) || 0;
  if (value < 1) return `${Math.round(value * 1024)} KB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} GB`;
  return `${value.toFixed(1)} MB`;
}

export function searchWorkspaces(workspaces, query) {
  const q = query.trim().toLowerCase();
  if (!q) return workspaces;

  return workspaces.filter((w) => {
    const name = (w.name ?? "").toLowerCase();
    const description = (w.description ?? "").toLowerCase();
    const category = (w.category ?? "").toLowerCase();
    const tags = (w.tags ?? []).join(" ").toLowerCase();
    return (
      name.includes(q) ||
      description.includes(q) ||
      category.includes(q) ||
      tags.includes(q)
    );
  });
}

export function filterWorkspaces(workspaces, { category, statusFilter, sortBy }) {
  let result = [...workspaces];

  if (statusFilter === "pinned") {
    result = result.filter((w) => w.pinned && !w.archived);
  } else if (statusFilter === "favorites") {
    result = result.filter((w) => w.favorite && !w.archived);
  } else if (statusFilter === "archived") {
    result = result.filter((w) => w.archived);
  } else {
    result = result.filter((w) => !w.archived);
  }

  const cat = (category ?? "all").toLowerCase();
  if (cat !== "all") {
    result = result.filter((w) => normalizeCategoryForApi(w.category) === cat);
  }

  if (sortBy === "oldest") {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return result;
}

export function getRecentWorkspaces(workspaces, limit = 5) {
  return [...workspaces]
    .filter((w) => w.lastOpened && !w.archived)
    .sort((a, b) => new Date(b.lastOpened) - new Date(a.lastOpened))
    .slice(0, limit);
}

export function getWorkspaceStats(workspaces) {
  const active = workspaces.filter((w) => !w.archived);
  return {
    total: active.length,
    pinned: active.filter((w) => w.pinned).length,
    archived: workspaces.filter((w) => w.archived).length,
    favorites: active.filter((w) => w.favorite).length,
    documents: active.reduce((sum, w) => sum + (w.documents ?? 0), 0),
    knowledge: active.reduce((sum, w) => sum + (w.knowledge ?? 0), 0),
    aiChats: active.reduce((sum, w) => sum + (w.aiChats ?? 0), 0),
    automations: active.reduce((sum, w) => sum + (w.automations ?? 0), 0),
    storage: active.reduce((sum, w) => sum + (w.storage ?? 0), 0),
  };
}

export function mergeServerStats(clientStats, serverStats) {
  if (!serverStats) return clientStats;

  const archived = serverStats.archived ?? clientStats.archived;
  const totalAll = serverStats.total ?? clientStats.total + archived;

  return {
    ...clientStats,
    total: Math.max(0, totalAll - archived),
    pinned: serverStats.pinned ?? clientStats.pinned,
    archived,
    favorites: serverStats.favorites ?? clientStats.favorites,
  };
}
