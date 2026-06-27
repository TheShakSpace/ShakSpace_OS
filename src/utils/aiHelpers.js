export const AI_MODELS = [
  { id: "gpt", label: "GPT", provider: "OpenAI", badge: "GPT-4o" },
  { id: "claude", label: "Claude", provider: "Anthropic", badge: "Claude 3.5" },
  { id: "gemini", label: "Gemini", provider: "Google", badge: "Gemini 2.5" },
  { id: "deepseek", label: "DeepSeek", provider: "DeepSeek", badge: "DeepSeek V3" },
  { id: "local", label: "Local Model", provider: "On-device", badge: "Llama 3" },
];

export const PROMPT_SUGGESTIONS = [
  { id: "s1", icon: "💡", title: "Summarize my workspaces", prompt: "Summarize all my active workspaces and suggest priorities for today." },
  { id: "s2", icon: "📋", title: "Draft a PRD outline", prompt: "Create a product requirements outline for a new dashboard widget." },
  { id: "s3", icon: "🔍", title: "Research assistant", prompt: "Help me research best practices for Zustand state persistence in React apps." },
  { id: "s4", icon: "⚡", title: "Automate a workflow", prompt: "Suggest an automation pipeline to sync knowledge notes to GitHub." },
  { id: "s5", icon: "🧠", title: "Explain code", prompt: "Explain this React pattern with an example:\n\n```jsx\nconst store = create(persist(...))\n```" },
  { id: "s6", icon: "📊", title: "Compare options", prompt: "Compare Framer Motion vs CSS transitions for a glassmorphism dashboard UI." },
];

export const ATTACHMENT_TYPES = {
  image: ["image/png", "image/jpeg", "image/gif", "image/webp"],
  pdf: ["application/pdf"],
  markdown: ["text/markdown", ".md"],
  text: ["text/plain"],
  code: ["text/javascript", "text/typescript", "application/json", ".js", ".ts", ".jsx", ".tsx", ".py"],
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

export function estimateTokens(text = "") {
  return Math.ceil(text.length / 4);
}

export function createDefaultMessage(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    role: "user",
    content: "",
    attachments: [],
    createdAt: now,
    ...overrides,
  };
}

export function createDefaultConversation(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: "New Chat",
    model: "gpt",
    pinned: false,
    favorite: false,
    archived: false,
    messages: [],
    tokenCount: 0,
    createdAt: now,
    updatedAt: now,
    lastOpened: now,
    ...overrides,
  };
}

export function migrateConversation(raw) {
  const c = raw ?? {};
  const now = new Date().toISOString();
  return createDefaultConversation({
    ...c,
    id: normalizeId(c.id || generateId()),
    title: c.title ?? "New Chat",
    model: c.model ?? "gpt",
    pinned: Boolean(c.pinned),
    favorite: Boolean(c.favorite),
    archived: Boolean(c.archived),
    messages: Array.isArray(c.messages)
      ? c.messages.map((m) => ({
          ...createDefaultMessage(),
          ...m,
          id: normalizeId(m.id || generateId()),
          role: m.role === "ai" ? "assistant" : (m.role ?? "user"),
          attachments: Array.isArray(m.attachments) ? m.attachments : [],
        }))
      : [],
    tokenCount: c.tokenCount ?? 0,
    createdAt: c.createdAt ?? now,
    updatedAt: c.updatedAt ?? now,
    lastOpened: c.lastOpened ?? now,
  });
}

export function searchConversations(conversations, query) {
  const q = query.trim().toLowerCase();
  if (!q) return conversations;
  return conversations.filter((c) => {
    const title = (c.title ?? "").toLowerCase();
    const msgs = (c.messages ?? []).map((m) => m.content).join(" ").toLowerCase();
    return title.includes(q) || msgs.includes(q);
  });
}

export function getConversationStats(conversations) {
  const active = conversations.filter((c) => !c.archived);
  const messages = active.reduce((sum, c) => sum + (c.messages?.length ?? 0), 0);
  const tokens = active.reduce((sum, c) => sum + (c.tokenCount ?? 0), 0);
  return {
    total: active.length,
    messages,
    pinned: active.filter((c) => c.pinned).length,
    favorites: active.filter((c) => c.favorite).length,
    archived: conversations.filter((c) => c.archived).length,
    tokens,
  };
}

export function getModelById(id) {
  return AI_MODELS.find((m) => m.id === id) ?? AI_MODELS[0];
}

export function normalizeConversation(raw) {
  if (!raw) return null;
  return {
    id: normalizeId(raw.id ?? raw._id),
    title: raw.title ?? "New conversation",
    provider: raw.provider ?? "gemini",
    model: raw.model ?? "gemini-2.0-flash",
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
}

export function normalizeMessage(raw) {
  if (!raw) return null;
  return {
    id: normalizeId(raw.id ?? raw._id),
    conversationId: normalizeId(raw.conversationId ?? raw.conversation),
    role: raw.role === "ai" ? "assistant" : (raw.role ?? "user"),
    content: raw.content ?? "",
    tokenCount: raw.tokenCount ?? 0,
    createdAt: raw.createdAt ?? null,
  };
}

export function deriveTitleFromMessage(content) {
  const line = content.trim().split("\n")[0] ?? "New Chat";
  return line.length > 48 ? `${line.slice(0, 48)}…` : line || "New Chat";
}

export function getAttachmentKind(file) {
  const name = file.name?.toLowerCase() ?? "";
  const type = file.type ?? "";
  if (type.startsWith("image/")) return "image";
  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".md") || type === "text/markdown") return "markdown";
  if (/\.(js|ts|jsx|tsx|py|json|css|html)$/.test(name)) return "code";
  return "text";
}

const MOCK_RESPONSES = [
  (prompt, model) => {
    const modelName = getModelById(model).badge;
    return `I've analyzed your request using **${modelName}**.\n\nHere's a structured response:\n\n### Summary\n${prompt.slice(0, 120)}${prompt.length > 120 ? "…" : ""}\n\n### Key Points\n- Your Shak Space workspaces are indexed and ready\n- Knowledge Hub notes can be cross-referenced\n- Automations can be triggered from chat commands\n\n### Example Code\n\`\`\`jsx\nimport { useWorkspaceStore } from './stores/useWorkspaceStore';\n\nconst workspaces = useWorkspaceStore((s) => s.workspaces);\n\`\`\`\n\n| Feature | Status |\n|---------|--------|\n| Workspaces | ✅ Active |\n| Knowledge | ✅ Synced |\n| AI Chat | ✅ Online |\n\nLet me know if you'd like me to expand on any section.`;
  },
  (prompt) =>
    `Great question! Based on your Shak Space context:\n\n1. **Immediate action** — Review pinned workspaces\n2. **Next step** — Draft documentation in Knowledge Hub\n3. **Optional** — Set up an automation pipeline\n\n> "${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}"\n\nI can regenerate with more detail or a different format.`,
  () =>
    `### Thinking through your request…\n\nHere's what I found in your local index:\n\n- **4 workspaces** with active metadata\n- **Knowledge notes** matching your query\n- **Automation rules** ready to configure\n\n\`\`\`typescript\ninterface Workspace {\n  id: string;\n  name: string;\n  pinned: boolean;\n}\n\`\`\`\n\nWould you like a step-by-step plan?`,
];

export function generateMockResponse(prompt, model = "gpt") {
  const idx = Math.abs(prompt.length) % MOCK_RESPONSES.length;
  return MOCK_RESPONSES[idx](prompt, model);
}

export function parseMarkdownBlocks(content) {
  const blocks = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || "text";
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", lang, content: codeLines.join("\n") });
      i++;
      continue;
    }

    if (line.startsWith("|") && lines[i + 1]?.includes("---")) {
      const tableLines = [line];
      i++;
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "table", rows: tableLines });
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", content: line.slice(4) });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", content: line.slice(3) });
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", content: line.slice(2) });
      i++;
      continue;
    }
    if (line.startsWith("> ")) {
      blocks.push({ type: "quote", content: line.slice(2) });
      i++;
      continue;
    }
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("```") && !lines[i].startsWith("|") && !lines[i].startsWith(">") && !/^[-*] /.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) blocks.push({ type: "p", content: paraLines.join("\n") });
  }

  return blocks;
}

export function inlineMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-white/80">$1</em>')
    .replace(/~~(.+?)~~/g, '<del class="text-[#A0A6B1]">$1</del>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-[#4F8CFF] font-mono text-[11px] border border-white/[0.06]">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#4F8CFF] hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
}
