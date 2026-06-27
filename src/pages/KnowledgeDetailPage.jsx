import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Bold,
  Code,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Save,
  Table,
} from "lucide-react";

import { useKnowledgeStore } from "../stores/useKnowledgeStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastStore } from "../stores/useToastStore";
import {
  computeWordCount,
  estimateReadTime,
  extractApiError,
  formatRelativeTime,
  normalizeId,
  renderMarkdown,
} from "../utils/knowledgeHelpers";

function insertAround(text, before, after = before) {
  return `${before}${text}${after}`;
}

export default function KnowledgeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const { isAuthenticated, authLoading } = useAuthStore();

  const loading = useKnowledgeStore((s) => s.loading);
  const fetchKnowledgeById = useKnowledgeStore((s) => s.fetchKnowledgeById);
  const openKnowledge = useKnowledgeStore((s) => s.openKnowledge);
  const updateKnowledge = useKnowledgeStore((s) => s.updateKnowledge);
  const getKnowledgeById = useKnowledgeStore((s) => s.getKnowledgeById);
  const currentKnowledge = useKnowledgeStore((s) => s.currentKnowledge);

  const note =
    getKnowledgeById(id) ??
    (currentKnowledge && normalizeId(currentKnowledge.id) === normalizeId(id) ? currentKnowledge : null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [preview, setPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const saveTimer = useRef(null);
  const openedRef = useRef(false);

  useEffect(() => {
    openedRef.current = false;
  }, [id]);

  useEffect(() => {
    if (!id || authLoading || !isAuthenticated) return;

    const cached = getKnowledgeById(id);
    if (cached) {
      setTitle(cached.title ?? "");
      setContent(cached.content ?? "");
      setSummary(cached.summary ?? "");
      if (!openedRef.current) {
        openKnowledge(id).catch(() => {});
        openedRef.current = true;
      }
      return;
    }
    fetchKnowledgeById(id)
      .then((item) => {
        if (item) {
          setTitle(item.title ?? "");
          setContent(item.content ?? "");
          setSummary(item.summary ?? "");
        }
        if (!openedRef.current) {
          openKnowledge(id).catch(() => {});
          openedRef.current = true;
        }
      })
      .catch((e) => showToast(extractApiError(e), "error"));
  }, [id, authLoading, isAuthenticated, getKnowledgeById, fetchKnowledgeById, openKnowledge, showToast]);

  const wordCount = useMemo(() => computeWordCount(content), [content]);
  const readingTime = useMemo(() => estimateReadTime(content), [content]);
  const previewHtml = useMemo(() => renderMarkdown(content), [content]);

  const save = useCallback(async () => {
    if (!id || !title.trim()) return;
    setSaving(true);
    try {
      await updateKnowledge(id, {
        title: title.trim(),
        content,
        summary: summary.trim(),
      });
      setDirty(false);
    } catch (e) {
      showToast(extractApiError(e), "error");
    } finally {
      setSaving(false);
    }
  }, [id, title, content, summary, updateKnowledge, showToast]);

  useEffect(() => {
    if (!dirty || !id) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      save();
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [dirty, id, title, content, summary, save]);

  const wrapSelection = (before, after) => {
    const el = document.getElementById("knowledge-editor-content");
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || "text";
    const next = content.slice(0, start) + insertAround(selected, before, after) + content.slice(end);
    setContent(next);
    setDirty(true);
  };

  const insertLine = (prefix) => {
    setContent((c) => (c ? `${c}\n${prefix}` : prefix));
    setDirty(true);
  };

  if (loading && !note) {
    return <div className="max-w-5xl mx-auto py-20 text-center text-sm text-[#A0A6B1]">Loading note...</div>;
  }

  if (!note && !loading) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <h1 className="text-xl font-black text-white mb-2">Note not found</h1>
        <button
          type="button"
          onClick={() => navigate("/knowledge")}
          className="px-4 py-2 rounded-xl text-sm bg-purple-500 text-white cursor-pointer"
        >
          Back to Knowledge Hub
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/knowledge")}
          className="inline-flex items-center gap-2 text-sm text-[#A0A6B1] hover:text-white cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 text-[11px] text-[#A0A6B1]">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{readingTime} min read</span>
          <span>·</span>
          <span>Edited {formatRelativeTime(note?.lastEdited ?? note?.updatedAt)}</span>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/10 hover:border-purple-500/40 cursor-pointer"
          >
            {preview ? <EyeOff size={12} /> : <Eye size={12} />}
            {preview ? "Edit" : "Preview"}
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <Save size={12} /> {saving ? "Saving..." : dirty ? "Save" : "Saved"}
          </motion.button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setDirty(true);
        }}
        placeholder="Note title"
        className="w-full text-2xl font-black text-white bg-transparent outline-none border-b border-white/10 pb-3"
      />

      <textarea
        value={summary}
        onChange={(e) => {
          setSummary(e.target.value);
          setDirty(true);
        }}
        placeholder="Short summary (optional)"
        rows={2}
        className="w-full text-sm text-[#A0A6B1] bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 outline-none focus:border-purple-500/50 resize-none"
      />

      <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-white/[0.03] border border-white/[0.08]">
        {[
          { icon: Bold, action: () => wrapSelection("**") },
          { icon: Italic, action: () => wrapSelection("*") },
          { icon: Heading1, action: () => insertLine("# Heading") },
          { icon: Heading2, action: () => insertLine("## Subheading") },
          { icon: List, action: () => insertLine("- List item") },
          { icon: ListOrdered, action: () => insertLine("1. List item") },
          { icon: Quote, action: () => insertLine("> Quote") },
          { icon: Code, action: () => wrapSelection("`") },
          { icon: Link, action: () => wrapSelection("[", "](https://)") },
          { icon: Table, action: () => insertLine("| Col 1 | Col 2 |\n| --- | --- |\n| A | B |") },
        ].map(({ icon: Icon, action }, i) => (
          <button
            key={i}
            type="button"
            onClick={action}
            className="p-2 rounded-lg text-[#A0A6B1] hover:text-white hover:bg-white/[0.06] cursor-pointer"
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      <div className={`grid gap-4 ${preview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        <textarea
          id="knowledge-editor-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setDirty(true);
          }}
          placeholder="Write in Markdown..."
          className="min-h-[420px] w-full text-sm text-white bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-3 outline-none focus:border-purple-500/50 font-mono leading-relaxed resize-y"
        />
        {preview && (
          <div
            className="min-h-[420px] prose prose-invert max-w-none p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-sm text-[#d4d4d8] overflow-auto knowledge-preview"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>
    </div>
  );
}
