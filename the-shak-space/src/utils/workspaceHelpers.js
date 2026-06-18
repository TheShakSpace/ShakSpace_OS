export const WORKSPACE_CATEGORIES = [
  "All",
  "Development",
  "Research",
  "Startup",
  "AI Project",
  "College",
  "Freelancing",
  "Personal",
  "Open Source",
  "Client",
  "Learning",
];

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

export function generateWorkspaceId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultWorkspace(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: generateWorkspaceId(),
    name: "Untitled Workspace",
    description: "",
    category: "Development",
    icon: "📁",
    color: "from-blue-500/20 to-indigo-500/10",
    accentColor: "#4F8CFF",
    tags: [],
    pinned: false,
    favorite: false,
    archived: false,
    lastOpened: null,
    storage: 0,
    documents: 0,
    knowledge: 0,
    aiChats: 0,
    automations: 0,
    status: "active",
    createdAt: now,
    updatedAt: now,
    activity: [
      {
        id: generateWorkspaceId(),
        type: "created",
        label: "Workspace created",
        timestamp: now,
      },
    ],
    ...overrides,
  };
}

export function migrateWorkspace(raw) {
  const w = raw ?? {};
  const now = new Date().toISOString();
  const id = normalizeId(w.id || generateWorkspaceId());

  const documents = w.documents ?? w.items ?? 0;
  const updatedAt = w.updatedAt ?? w.updated ?? w.createdAt ?? now;

  return createDefaultWorkspace({
    ...w,
    id,
    documents,
    knowledge: w.knowledge ?? 0,
    aiChats: w.aiChats ?? 0,
    automations: w.automations ?? 0,
    storage: w.storage ?? 0,
    favorite: Boolean(w.favorite),
    pinned: Boolean(w.pinned),
    archived: Boolean(w.archived),
    lastOpened: w.lastOpened ?? null,
    icon: w.icon ?? "📁",
    color: w.color ?? "from-blue-500/20 to-indigo-500/10",
    accentColor: w.accentColor ?? "#4F8CFF",
    tags: Array.isArray(w.tags) ? w.tags : [],
    status: w.status ?? "active",
    updatedAt,
    activity: Array.isArray(w.activity) && w.activity.length > 0
      ? w.activity
      : [
          {
            id: generateWorkspaceId(),
            type: "created",
            label: "Workspace created",
            timestamp: w.createdAt ?? now,
          },
        ],
  });
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

  const cat = (category ?? "All").toLowerCase();
  if (cat !== "all") {
    result = result.filter((w) => (w.category ?? "").toLowerCase() === cat);
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
