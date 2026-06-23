export const KNOWLEDGE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "personal", label: "Personal" },
  { value: "team", label: "Team" },
  { value: "education", label: "Education" },
  { value: "business", label: "Business" },
  { value: "research", label: "Research" },
];

export const NOTE_SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "title", label: "A-Z" },
  { id: "lastEdited", label: "Recently Edited" },
  { id: "recent", label: "Recently Opened" },
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
};

const CATEGORY_ALIASES = {
  development: "general",
  research: "research",
  college: "education",
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

export function estimateReadTime(text = "") {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  return words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));
}

export function computeWordCount(text = "") {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

export function normalizeCategoryForApi(value) {
  if (!value || typeof value !== "string") return "general";
  const lower = value.trim().toLowerCase();
  if (KNOWLEDGE_CATEGORIES.some((c) => c.value === lower)) return lower;
  return CATEGORY_ALIASES[lower] ?? "general";
}

export function formatCategoryLabel(value) {
  if (!value) return "General";
  const lower = String(value).trim().toLowerCase();
  return CATEGORY_LABELS[lower] ?? value;
}

export function looksLikeHex(value) {
  if (typeof value !== "string") return false;
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(value.trim());
}

export function looksLikeGradient(value) {
  if (typeof value !== "string") return false;
  return /\bfrom-|\bto-/i.test(value);
}

export function normalizeApiPayload(payload) {
  const safe = payload ?? {};
  const hexColor =
    safe.accentColor && looksLikeHex(safe.accentColor)
      ? safe.accentColor
      : safe.color && looksLikeHex(safe.color)
        ? safe.color
        : "#8B5CF6";

  return {
    workspaceId: safe.workspaceId,
    title: safe.title,
    content: safe.content ?? "",
    summary: safe.summary ?? "",
    tags: Array.isArray(safe.tags)
      ? safe.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
      : typeof safe.tags === "string"
        ? safe.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [],
    category: normalizeCategoryForApi(safe.category),
    color: hexColor,
    icon: safe.icon ?? "📝",
  };
}

export function normalizeKnowledgeItem(item) {
  if (!item) return null;
  const id = item.id ?? item._id;
  const hexColor =
    looksLikeHex(item.color) && !looksLikeGradient(item.color) ? item.color : "#8B5CF6";
  const workspaceId = item.workspaceId ?? item.workspace;

  return {
    ...item,
    id: id ? String(id) : undefined,
    workspaceId: workspaceId ? String(workspaceId) : undefined,
    title: item.title ?? "Untitled",
    content: item.content ?? "",
    summary: item.summary ?? "",
    description: item.summary || excerptContent(item.content),
    tags: Array.isArray(item.tags) ? item.tags : [],
    category: item.category ?? "general",
    accentColor: hexColor,
    color: hexColor,
    icon: item.icon ?? "📝",
    pinned: Boolean(item.pinned),
    favorite: Boolean(item.favorite),
    archived: Boolean(item.archived),
    wordCount: item.wordCount ?? computeWordCount(item.content),
    readingTime: item.readingTime ?? estimateReadTime(item.content),
    readTime: item.readingTime ?? estimateReadTime(item.content),
    lastOpened: item.lastOpened ?? null,
    lastEdited: item.lastEdited ?? item.updatedAt ?? null,
    createdAt: item.createdAt ?? null,
    updatedAt: item.updatedAt ?? null,
  };
}

export function excerptContent(content, max = 160) {
  const plain = String(content ?? "")
    .replace(/[#*_`>\[\]()!|-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return "";
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
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

export function searchNotes(notes, query) {
  const q = query.trim().toLowerCase();
  if (!q) return notes;
  return notes.filter((note) => {
    const title = (note.title ?? "").toLowerCase();
    const summary = (note.summary ?? note.description ?? "").toLowerCase();
    const content = (note.content ?? "").toLowerCase();
    const tags = (note.tags ?? []).join(" ").toLowerCase();
    return title.includes(q) || summary.includes(q) || content.includes(q) || tags.includes(q);
  });
}

export function filterNotes(notes, { view, category, workspaceId, sortBy }) {
  let result = [...notes];

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
  } else {
    result = result.filter((n) => !n.archived);
  }

  if (workspaceId) {
    result = result.filter((n) => normalizeId(n.workspaceId) === normalizeId(workspaceId));
  }

  const cat = (category ?? "all").toLowerCase();
  if (cat !== "all") {
    result = result.filter((n) => normalizeCategoryForApi(n.category) === cat);
  }

  if (view !== SIDEBAR_VIEWS.RECENT) {
    if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "title") {
      result.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    } else if (sortBy === "lastEdited") {
      result.sort((a, b) => new Date(b.lastEdited ?? b.updatedAt) - new Date(a.lastEdited ?? a.updatedAt));
    } else if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.lastOpened ?? 0) - new Date(a.lastOpened ?? 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  return result;
}

export function getRecentNotes(notes, limit = 5) {
  return [...notes]
    .filter((n) => n.lastOpened && !n.archived)
    .sort((a, b) => new Date(b.lastOpened) - new Date(a.lastOpened))
    .slice(0, limit);
}

export function getPinnedNotes(notes, limit = 6) {
  return [...notes]
    .filter((n) => n.pinned && !n.archived)
    .sort((a, b) => new Date(b.lastEdited ?? b.updatedAt) - new Date(a.lastEdited ?? a.updatedAt))
    .slice(0, limit);
}

export function getKnowledgeStats(notes) {
  const active = notes.filter((n) => !n.archived);
  return {
    total: active.length,
    pinned: active.filter((n) => n.pinned).length,
    favorites: active.filter((n) => n.favorite).length,
    archived: notes.filter((n) => n.archived).length,
    tags: new Set(active.flatMap((n) => n.tags ?? [])).size,
    wordCount: active.reduce((sum, n) => sum + (n.wordCount ?? 0), 0),
    readingTime: active.reduce((sum, n) => sum + (n.readingTime ?? 0), 0),
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
    favorites: serverStats.favorites ?? clientStats.favorites,
    archived,
    wordCount: serverStats.wordCount ?? clientStats.wordCount,
    readingTime: serverStats.readingTime ?? clientStats.readingTime,
  };
}

export function getAllTags(notes) {
  const tags = new Set();
  notes.filter((n) => !n.archived).forEach((n) => (n.tags ?? []).forEach((t) => tags.add(t)));
  return [...tags].sort();
}

export function renderMarkdown(text = "") {
  let html = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  html = html.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/^\s*[-*] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(/^\s*\d+\. (.+)$/gm, "<li>$1</li>");
  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, "");
  return html;
}
