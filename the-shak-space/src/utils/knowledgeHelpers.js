export const NOTE_SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
];

export const NOTE_FILTER_OPTIONS = [
  { id: "all", label: "All Notes" },
  { id: "favorites", label: "Favorites" },
  { id: "pinned", label: "Pinned" },
  { id: "archived", label: "Archived" },
];

export const SIDEBAR_VIEWS = {
  ALL: "all",
  FAVORITES: "favorites",
  PINNED: "pinned",
  RECENT: "recent",
  ARCHIVED: "archived",
  TRASH: "trash",
};

export function normalizeId(id) {
  return id == null ? "" : String(id);
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

export function estimateReadTime(text = "") {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function createDefaultCollection(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: "Untitled Collection",
    icon: "📂",
    color: "from-purple-500/20 to-pink-500/10",
    description: "",
    createdAt: now,
    ...overrides,
  };
}

export function createDefaultNote(overrides = {}) {
  const now = new Date().toISOString();
  const description = overrides.description ?? "";
  const tags = Array.isArray(overrides.tags) ? overrides.tags : [];

  return {
    id: generateId(),
    title: "Untitled Note",
    description,
    collectionId: null,
    pinned: false,
    favorite: false,
    archived: false,
    trashed: false,
    trashedAt: null,
    lastOpened: null,
    readTime: estimateReadTime(description),
    createdAt: now,
    updatedAt: now,
    ...overrides,
    tags,
  };
}

export function migrateNote(raw) {
  const n = raw ?? {};
  const now = new Date().toISOString();
  const id = normalizeId(n.id || generateId());
  const description = n.description ?? "";
  const createdAt = n.createdAt ?? (n.date ? new Date(n.date).toISOString() : now);
  const updatedAt = n.updatedAt ?? createdAt;

  let readTime = n.readTime;
  if (!readTime && n.duration) {
    const match = String(n.duration).match(/(\d+)/);
    readTime = match ? Number(match[1]) : estimateReadTime(description);
  }

  return createDefaultNote({
    ...n,
    id,
    title: n.title ?? "Untitled Note",
    description,
    createdAt,
    updatedAt,
    readTime: readTime ?? estimateReadTime(description),
    pinned: Boolean(n.pinned),
    favorite: Boolean(n.favorite),
    archived: Boolean(n.archived),
    trashed: Boolean(n.trashed),
    trashedAt: n.trashedAt ?? null,
    lastOpened: n.lastOpened ?? null,
    collectionId: n.collectionId ?? null,
    tags: Array.isArray(n.tags) ? n.tags : [],
  });
}

export function migrateCollection(raw) {
  const c = raw ?? {};
  return createDefaultCollection({
    ...c,
    id: normalizeId(c.id || generateId()),
    name: c.name ?? "Untitled Collection",
    icon: c.icon ?? "📂",
    color: c.color ?? "from-purple-500/20 to-pink-500/10",
  });
}

export function searchNotes(notes, query) {
  const q = query.trim().toLowerCase();
  if (!q) return notes;

  return notes.filter((note) => {
    const title = (note.title ?? "").toLowerCase();
    const description = (note.description ?? "").toLowerCase();
    const tags = (note.tags ?? []).join(" ").toLowerCase();
    const collection = (note.collectionName ?? "").toLowerCase();
    return (
      title.includes(q) ||
      description.includes(q) ||
      tags.includes(q) ||
      collection.includes(q)
    );
  });
}

export function enrichNotesWithCollection(notes, collections) {
  const map = new Map(collections.map((c) => [normalizeId(c.id), c]));
  return notes.map((note) => {
    const col = note.collectionId ? map.get(normalizeId(note.collectionId)) : null;
    return {
      ...note,
      collectionName: col?.name ?? null,
      collectionIcon: col?.icon ?? null,
      collectionColor: col?.color ?? null,
    };
  });
}

export function filterNotes(notes, { view, collectionId, sortBy }) {
  let result = [...notes];

  if (view === SIDEBAR_VIEWS.TRASH) {
    result = result.filter((n) => n.trashed);
  } else {
    result = result.filter((n) => !n.trashed);

    if (view === SIDEBAR_VIEWS.ARCHIVED) {
      result = result.filter((n) => n.archived);
    } else if (view === SIDEBAR_VIEWS.FAVORITES) {
      result = result.filter((n) => n.favorite && !n.archived);
    } else if (view === SIDEBAR_VIEWS.PINNED) {
      result = result.filter((n) => n.pinned && !n.archived);
    } else if (view === SIDEBAR_VIEWS.RECENT) {
      result = result
        .filter((n) => n.lastOpened && !n.archived)
        .sort((a, b) => new Date(b.lastOpened) - new Date(a.lastOpened))
        .slice(0, 20);
    } else if (collectionId) {
      result = result.filter(
        (n) => normalizeId(n.collectionId) === normalizeId(collectionId) && !n.archived
      );
    } else {
      result = result.filter((n) => !n.archived);
    }
  }

  if (view !== SIDEBAR_VIEWS.RECENT) {
    if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    } else {
      result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
  }

  return result;
}

export function getRecentNotes(notes, limit = 5) {
  return [...notes]
    .filter((n) => n.lastOpened && !n.trashed && !n.archived)
    .sort((a, b) => new Date(b.lastOpened) - new Date(a.lastOpened))
    .slice(0, limit);
}

export function getKnowledgeStats(notes, collections) {
  const active = notes.filter((n) => !n.trashed && !n.archived);
  return {
    total: active.length,
    collections: collections.length,
    pinned: active.filter((n) => n.pinned).length,
    favorites: active.filter((n) => n.favorite).length,
    archived: notes.filter((n) => n.archived && !n.trashed).length,
    trash: notes.filter((n) => n.trashed).length,
    tags: new Set(active.flatMap((n) => n.tags ?? [])).size,
    readTime: active.reduce((sum, n) => sum + (n.readTime ?? 0), 0),
  };
}

export function getAllTags(notes) {
  const tags = new Set();
  notes
    .filter((n) => !n.trashed && !n.archived)
    .forEach((n) => (n.tags ?? []).forEach((t) => tags.add(t)));
  return [...tags].sort();
}
