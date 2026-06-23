import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Grid3x3, List, Plus } from "lucide-react";

import { useKnowledgeStore } from "../stores/useKnowledgeStore";
import { useWorkspaceStore } from "../stores/useWorkspaceStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastStore } from "../stores/useToastStore";
import {
  SIDEBAR_VIEWS,
  searchNotes,
  filterNotes,
  getRecentNotes,
  getPinnedNotes,
  getKnowledgeStats,
  mergeServerStats,
  getAllTags,
  normalizeId,
  extractApiError,
  KNOWLEDGE_CATEGORIES,
} from "../utils/knowledgeHelpers";

import KnowledgeHero from "../components/knowledge/KnowledgeHero";
import KnowledgeSidebar from "../components/knowledge/KnowledgeSidebar";
import KnowledgeToolbar from "../components/knowledge/KnowledgeToolbar";
import KnowledgeCard from "../components/knowledge/KnowledgeCard";
import KnowledgeEmptyState from "../components/knowledge/KnowledgeEmptyState";
import KnowledgePinned from "../components/knowledge/KnowledgePinned";
import KnowledgeRecent from "../components/knowledge/KnowledgeRecent";
import KnowledgeModal from "../components/knowledge/KnowledgeModal";
import { EMPTY_NOTE_FORM } from "../components/knowledge/knowledgeModalForms";

const VIEW_TITLES = {
  [SIDEBAR_VIEWS.ALL]: "All Notes",
  [SIDEBAR_VIEWS.FAVORITES]: "Favorite Notes",
  [SIDEBAR_VIEWS.PINNED]: "Pinned Notes",
  [SIDEBAR_VIEWS.RECENT]: "Recent Notes",
  [SIDEBAR_VIEWS.ARCHIVED]: "Archived Notes",
};

export default function KnowledgeHubPage() {
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialLoadRef = useRef(false);

  const knowledge = useKnowledgeStore((s) => s.knowledge);
  const loading = useKnowledgeStore((s) => s.loading);
  const error = useKnowledgeStore((s) => s.error);
  const serverStats = useKnowledgeStore((s) => s.stats);
  const storeTags = useKnowledgeStore((s) => s.tags);

  const createKnowledge = useKnowledgeStore((s) => s.createKnowledge);
  const updateKnowledge = useKnowledgeStore((s) => s.updateKnowledge);
  const deleteKnowledge = useKnowledgeStore((s) => s.deleteKnowledge);
  const togglePin = useKnowledgeStore((s) => s.togglePin);
  const toggleFavorite = useKnowledgeStore((s) => s.toggleFavorite);
  const archiveKnowledge = useKnowledgeStore((s) => s.archiveKnowledge);
  const restore = useKnowledgeStore((s) => s.restore);
  const duplicateKnowledge = useKnowledgeStore((s) => s.duplicateKnowledge);
  const openKnowledge = useKnowledgeStore((s) => s.openKnowledge);
  const setFilters = useKnowledgeStore((s) => s.setFilters);

  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);

  const [activeView, setActiveView] = useState(SIDEBAR_VIEWS.ALL);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [workspaceFilter, setWorkspaceFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [noteForm, setNoteForm] = useState(EMPTY_NOTE_FORM);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || initialLoadRef.current) return;
    initialLoadRef.current = true;
    let active = true;
    const load = async () => {
      try {
        await fetchWorkspaces().catch(() => {});
        await useKnowledgeStore.getState().refresh();
        await useKnowledgeStore.getState().fetchTags();
      } catch (e) {
        if (active) showToast(extractApiError(e), "error");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated, fetchWorkspaces, showToast]);

  useEffect(() => {
    setFilters({
      workspaceId: workspaceFilter || null,
      category: selectedCategory,
      tag: selectedTag,
    });
  }, [workspaceFilter, selectedCategory, selectedTag, setFilters]);

  const stats = useMemo(() => {
    const client = getKnowledgeStats(knowledge);
    return mergeServerStats(client, serverStats);
  }, [knowledge, serverStats]);

  const allTags = useMemo(() => {
    const fromNotes = getAllTags(knowledge);
    const merged = new Set([...fromNotes, ...(storeTags ?? [])]);
    return [...merged].sort();
  }, [knowledge, storeTags]);

  const noteCounts = useMemo(() => {
    const active = knowledge.filter((n) => !n.archived);
    return {
      [SIDEBAR_VIEWS.ALL]: active.length,
      [SIDEBAR_VIEWS.FAVORITES]: active.filter((n) => n.favorite).length,
      [SIDEBAR_VIEWS.PINNED]: active.filter((n) => n.pinned).length,
      [SIDEBAR_VIEWS.RECENT]: active.filter((n) => n.lastOpened).length,
      [SIDEBAR_VIEWS.ARCHIVED]: knowledge.filter((n) => n.archived).length,
    };
  }, [knowledge]);

  const filteredNotes = useMemo(() => {
    let result = filterNotes(knowledge, {
      view: activeView,
      category: selectedCategory,
      workspaceId: workspaceFilter || null,
      sortBy,
    });
    result = searchNotes(result, search);
    if (statusFilter === "favorites") result = result.filter((n) => n.favorite);
    if (statusFilter === "pinned") result = result.filter((n) => n.pinned);
    if (statusFilter === "archived") result = result.filter((n) => n.archived);
    if (selectedTag) result = result.filter((n) => (n.tags ?? []).includes(selectedTag));
    return result;
  }, [knowledge, activeView, selectedCategory, workspaceFilter, sortBy, search, statusFilter, selectedTag]);

  const pinnedNotes = useMemo(() => {
    if (activeView !== SIDEBAR_VIEWS.ALL) return [];
    return getPinnedNotes(
      searchNotes(knowledge.filter((n) => !n.archived), search),
      6
    );
  }, [knowledge, search, activeView]);

  const recentNotes = useMemo(() => {
    if (activeView !== SIDEBAR_VIEWS.ALL) return [];
    const recent = getRecentNotes(searchNotes(knowledge.filter((n) => !n.archived), search), 5);
    const pinnedIds = new Set(pinnedNotes.map((n) => normalizeId(n.id)));
    return recent.filter((n) => !pinnedIds.has(normalizeId(n.id)));
  }, [knowledge, search, activeView, pinnedNotes]);

  const mainNotes = useMemo(() => {
    if (activeView === SIDEBAR_VIEWS.PINNED || activeView === SIDEBAR_VIEWS.RECENT) {
      return filteredNotes;
    }
    const exclude = new Set([...pinnedNotes, ...recentNotes].map((n) => normalizeId(n.id)));
    return filteredNotes.filter((n) => !exclude.has(normalizeId(n.id)));
  }, [filteredNotes, activeView, pinnedNotes, recentNotes]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalMode("create");
    setEditingNoteId(null);
    setNoteForm(EMPTY_NOTE_FORM);
    setSubmitting(false);
  }, []);

  const openCreateModal = useCallback(() => {
    const defaultWs = workspaces.find((w) => !w.archived)?.id ?? "";
    setModalMode("create");
    setEditingNoteId(null);
    setNoteForm({ ...EMPTY_NOTE_FORM, workspaceId: workspaceFilter || defaultWs });
    setModalOpen(true);
  }, [workspaces, workspaceFilter]);

  const openEditModal = useCallback((note) => {
    setModalMode("edit");
    setEditingNoteId(note.id);
    setNoteForm({
      title: note.title ?? "",
      summary: note.summary ?? "",
      content: note.content ?? "",
      workspaceId: note.workspaceId ?? "",
      category: note.category ?? "general",
      icon: note.icon ?? "📝",
      accentColor: note.accentColor ?? "#8B5CF6",
      tags: (note.tags ?? []).join(", "),
    });
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    const title = noteForm.title.trim();
    if (!title || submitting) return;
    if (!noteForm.workspaceId) {
      showToast("Select a workspace", "error");
      return;
    }

    const payload = {
      title,
      summary: noteForm.summary?.trim() ?? "",
      content: noteForm.content ?? "",
      workspaceId: noteForm.workspaceId,
      category: noteForm.category || "general",
      icon: noteForm.icon || "📝",
      accentColor: noteForm.accentColor,
      tags: noteForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    setSubmitting(true);
    try {
      if (modalMode === "edit" && editingNoteId) {
        await updateKnowledge(editingNoteId, payload);
        showToast("Note updated", "success");
      } else {
        const created = await createKnowledge(payload);
        showToast("Note created", "success");
        closeModal();
        if (created?.id) navigate(`/knowledge/${created.id}`);
        return;
      }
      closeModal();
    } catch (e) {
      showToast(extractApiError(e), "error");
      setSubmitting(false);
    }
  }, [noteForm, submitting, modalMode, editingNoteId, createKnowledge, updateKnowledge, closeModal, showToast, navigate]);

  const runAction = useCallback(
    async (action, msg) => {
      try {
        await action();
        if (msg) showToast(msg, "success");
      } catch (e) {
        showToast(extractApiError(e), "error");
      }
    },
    [showToast]
  );

  const handleOpenNote = useCallback(
    async (note) => {
      try {
        await openKnowledge(note.id);
        navigate(`/knowledge/${note.id}`);
      } catch (e) {
        showToast(extractApiError(e), "error");
      }
    },
    [openKnowledge, navigate, showToast]
  );

  const makeHandlers = useCallback(
    (note) => ({
      onOpen: () => handleOpenNote(note),
      onEdit: () => openEditModal(note),
      onTogglePin: () => runAction(() => togglePin(note.id)),
      onToggleFavorite: () => runAction(() => toggleFavorite(note.id)),
      onDuplicate: () => runAction(() => duplicateKnowledge(note.id), "Note duplicated"),
      onArchive: () => runAction(() => archiveKnowledge(note.id), "Note archived"),
      onRestore: () => runAction(() => restore(note.id), "Note restored"),
      onDelete: () => {
        const ok = window.confirm(`Delete "${note.title}"? This cannot be undone.`);
        if (!ok) return;
        runAction(() => deleteKnowledge(note.id), "Note deleted");
      },
    }),
    [handleOpenNote, openEditModal, runAction, togglePin, toggleFavorite, duplicateKnowledge, archiveKnowledge, restore, deleteKnowledge]
  );

  const isFiltered =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    selectedTag !== "" ||
    selectedCategory !== "all" ||
    workspaceFilter !== "";

  const gridClass =
    viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "flex flex-col gap-2";

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 max-w-7xl mx-auto">
      <KnowledgeSidebar
        activeView={activeView}
        noteCounts={noteCounts}
        onViewChange={(v) => {
          setActiveView(v);
          setStatusFilter("all");
        }}
      />

      <div className="flex-1 min-w-0 space-y-4">
        <KnowledgeHero stats={stats} />

        <KnowledgeToolbar
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          tags={allTags}
          onNewNote={openCreateModal}
          viewTitle={VIEW_TITLES[activeView] ?? "Notes"}
          workspaceFilter={workspaceFilter}
          onWorkspaceFilterChange={setWorkspaceFilter}
          workspaces={workspaces.filter((w) => !w.archived)}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={KNOWLEDGE_CATEGORIES}
        />

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg cursor-pointer ${viewMode === "grid" ? "bg-purple-500/20 text-purple-300" : "text-[#A0A6B1]"}`}
          >
            <Grid3x3 size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg cursor-pointer ${viewMode === "list" ? "bg-purple-500/20 text-purple-300" : "text-[#A0A6B1]"}`}
          >
            <List size={16} />
          </button>
        </div>

        {loading && knowledge.length === 0 && (
          <p className="text-sm text-[#A0A6B1]">Loading knowledge...</p>
        )}
        {!loading && error && knowledge.length === 0 && (
          <p className="text-sm text-red-400">{extractApiError({ response: { data: error } })}</p>
        )}

        {activeView === SIDEBAR_VIEWS.ALL && (
          <div className="space-y-4">
            <KnowledgePinned notes={pinnedNotes} makeHandlers={makeHandlers} />
            <KnowledgeRecent notes={recentNotes} makeHandlers={makeHandlers} />
          </div>
        )}

        <section className="space-y-2.5">
          {mainNotes.length > 0 && activeView === SIDEBAR_VIEWS.ALL && (
            <h2 className="text-sm font-black text-white tracking-tight">All Notes</h2>
          )}

          <div className={gridClass}>
            {mainNotes.map((note, i) => (
              <KnowledgeCard
                key={note.id}
                note={note}
                index={i}
                handlers={makeHandlers(note)}
                listView={viewMode === "list"}
                workspaceName={
                  workspaces.find((w) => normalizeId(w.id) === normalizeId(note.workspaceId))?.name
                }
              />
            ))}

            {mainNotes.length === 0 && pinnedNotes.length === 0 && recentNotes.length === 0 && !loading && (
              <KnowledgeEmptyState onCreate={openCreateModal} isFiltered={isFiltered} viewLabel="notes" />
            )}

            {mainNotes.length > 0 && activeView === SIDEBAR_VIEWS.ALL && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -3 }}
                onClick={openCreateModal}
                className="min-h-[140px] p-3.5 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-purple-500/50 flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={18} className="text-[#A0A6B1]" />
                <span className="text-xs font-bold text-white">New Note</span>
              </motion.button>
            )}
          </div>
        </section>
      </div>

      <KnowledgeModal
        isOpen={modalOpen}
        mode={modalMode}
        form={noteForm}
        onFormChange={setNoteForm}
        workspaces={workspaces.filter((w) => !w.archived)}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}
