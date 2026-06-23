import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Pin, Star } from "lucide-react";
import { useKnowledgeStore } from "../../stores/useKnowledgeStore";
import { formatRelativeTime, normalizeId } from "../../utils/knowledgeHelpers";

export default function WorkspaceKnowledgeList({ workspaceId }) {
  const navigate = useNavigate();
  const knowledge = useKnowledgeStore((s) => s.knowledge);
  const loading = useKnowledgeStore((s) => s.loading);
  const fetchKnowledge = useKnowledgeStore((s) => s.fetchKnowledge);

  useEffect(() => {
    if (!workspaceId) return;
    fetchKnowledge({ workspaceId, limit: 50, sortBy: "lastEdited" }).catch(() => {});
  }, [workspaceId, fetchKnowledge]);

  const notes = knowledge
    .filter((n) => normalizeId(n.workspaceId) === normalizeId(workspaceId) && !n.archived)
    .sort((a, b) => new Date(b.lastEdited ?? b.updatedAt) - new Date(a.lastEdited ?? a.updatedAt));

  if (loading && notes.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.02] text-center">
        <BookOpen size={32} className="text-[#8B5CF6] mx-auto mb-3 opacity-60" />
        <h3 className="text-sm font-bold text-white mb-1">No knowledge notes yet</h3>
        <p className="text-xs text-[#A0A6B1] mb-4">Create notes in this workspace from the Knowledge Hub.</p>
        <button
          type="button"
          onClick={() => navigate("/knowledge")}
          className="text-xs text-[#4F8CFF] hover:underline cursor-pointer font-semibold"
        >
          Open Knowledge Hub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">{notes.length} notes in this workspace</h3>
        <button
          type="button"
          onClick={() => navigate("/knowledge")}
          className="text-[11px] text-[#4F8CFF] hover:underline cursor-pointer font-semibold"
        >
          View all
        </button>
      </div>
      {notes.map((note) => (
        <button
          key={note.id}
          type="button"
          onClick={() => navigate(`/knowledge/${note.id}`)}
          className="w-full text-left p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-colors cursor-pointer group"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">{note.icon ?? "📝"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-white truncate group-hover:text-[#4F8CFF] transition-colors">
                  {note.title}
                </span>
                {note.pinned && <Pin size={12} className="text-amber-400 shrink-0" />}
                {note.favorite && <Star size={12} className="text-yellow-400 shrink-0 fill-yellow-400" />}
              </div>
              <p className="text-xs text-[#A0A6B1] line-clamp-1">{note.description || "No summary"}</p>
              <p className="text-[10px] text-[#6B7280] mt-1">
                {formatRelativeTime(note.lastEdited ?? note.updatedAt)} · {note.readingTime ?? 1} min read
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
