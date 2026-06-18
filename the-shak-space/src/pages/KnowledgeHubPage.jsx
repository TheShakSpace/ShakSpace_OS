import { useCallback, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";

import { useKnowledgeStore } from "../stores/useKnowledgeStore";
import {
  searchNotes,
  filterNotes,
  enrichNotesWithCollection,
  getKnowledgeStats,
  getAllTags,
  getRecentNotes,
  SIDEBAR_VIEWS,
  normalizeId,
  estimateReadTime,
} from "../utils/knowledgeHelpers";

import KnowledgeHero from "../components/knowledge/KnowledgeHero";
import KnowledgeSidebar from "../components/knowledge/KnowledgeSidebar";
import KnowledgeToolbar from "../components/knowledge/KnowledgeToolbar";
import KnowledgeCard from "../components/knowledge/KnowledgeCard";
import KnowledgeEmptyState from "../components/knowledge/KnowledgeEmptyState";
import KnowledgeCollections from "../components/knowledge/KnowledgeCollections";
import KnowledgePinned from "../components/knowledge/KnowledgePinned";
import KnowledgeRecent from "../components/knowledge/KnowledgeRecent";
import KnowledgeModal from "../components/knowledge/KnowledgeModal";
import {
  EMPTY_NOTE_FORM,
  EMPTY_COLLECTION_FORM,
} from "../components/knowledge/knowledgeModalForms";

const VIEW_TITLES = {
  [SIDEBAR_VIEWS.ALL]: "All Notes",
  [SIDEBAR_VIEWS.FAVORITES]: "Favorite Notes",
  [SIDEBAR_VIEWS.PINNED]: "Pinned Notes",
  [SIDEBAR_VIEWS.RECENT]: "Recent Notes",
  [SIDEBAR_VIEWS.ARCHIVED]: "Archived Notes",
  [SIDEBAR_VIEWS.TRASH]: "Trash",
};

export default function KnowledgeHubPage() {
  const notes = useKnowledgeStore((s) => s.notes);
  const collections = useKnowledgeStore((s) => s.collections);
  const addNote = useKnowledgeStore((s) => s.addNote);
  const updateNote = useKnowledgeStore((s) => s.updateNote);
  const duplicateNote = useKnowledgeStore((s) => s.duplicateNote);
  const togglePinNote = useKnowledgeStore((s) => s.togglePinNote);
  const toggleFavoriteNote = useKnowledgeStore((s) => s.toggleFavoriteNote);
  const archiveNote = useKnowledgeStore((s) => s.archiveNote);
  const restoreNote = useKnowledgeStore((s) => s.restoreNote);
  const trashNote = useKnowledgeStore((s) => s.trashNote);
  const restoreFromTrash = useKnowledgeStore((s) => s.restoreFromTrash);
  const permanentlyDeleteNote = useKnowledgeStore((s) => s.permanentlyDeleteNote);
  const openNote = useKnowledgeStore((s) => s.openNote);
  const addCollection = useKnowledgeStore((s) => s.addCollection);
  const emptyTrash = useKnowledgeStore((s) => s.emptyTrash);

  const [activeView, setActiveView] = useState(SIDEBAR_VIEWS.ALL);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTag, setSelectedTag] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("note");
  const [modalMode, setModalMode] = useState("create");
  const [noteForm, setNoteForm] = useState(EMPTY_NOTE_FORM);
  const [collectionForm, setCollectionForm] = useState(EMPTY_COLLECTION_FORM);
  const [editingNoteId, setEditingNoteId] = useState(null);

  const enrichedNotes = useMemo(
    () => enrichNotesWithCollection(notes, collections),
    [notes, collections]
  );

  const stats = useMemo(() => getKnowledgeStats(notes, collections), [notes, collections]);
  const allTags = useMemo(() => getAllTags(notes), [notes]);

  const noteCounts = useMemo(() => {
    const active = notes.filter((n) => !n.trashed);
    const counts = {
      [SIDEBAR_VIEWS.ALL]: active.filter((n) => !n.archived).length,
      [SIDEBAR_VIEWS.FAVORITES]: active.filter((n) => n.favorite && !n.archived).length,
      [SIDEBAR_VIEWS.PINNED]: active.filter((n) => n.pinned && !n.archived).length,
      [SIDEBAR_VIEWS.RECENT]: active.filter((n) => n.lastOpened && !n.archived).length,
      [SIDEBAR_VIEWS.ARCHIVED]: active.filter((n) => n.archived).length,
      [SIDEBAR_VIEWS.TRASH]: notes.filter((n) => n.trashed).length,
    };
    collections.forEach((col) => {
      counts[`col-${col.id}`] = active.filter(
        (n) => normalizeId(n.collectionId) === normalizeId(col.id) && !n.archived
      ).length;
    });
    return counts;
  }, [notes, collections]);

  const filteredNotes = useMemo(() => {
    let result = filterNotes(enrichedNotes, {
      view: activeView,
      collectionId: activeCollectionId,
      sortBy,
    });

    result = searchNotes(result, search);

    if (statusFilter === "favorites") {
      result = result.filter((n) => n.favorite);
    } else if (statusFilter === "pinned") {
      result = result.filter((n) => n.pinned);
    } else if (statusFilter === "archived") {
      result = result.filter((n) => n.archived);
    }

    if (selectedTag) {
      result = result.filter((n) => (n.tags ?? []).includes(selectedTag));
    }

    return result;
  }, [
    enrichedNotes,
    activeView,
    activeCollectionId,
    sortBy,
    search,
    statusFilter,
    selectedTag,
  ]);

  const pinnedNotes = useMemo(() => {
    if (activeView !== SIDEBAR_VIEWS.ALL || activeCollectionId) return [];
    return filteredNotes.filter((n) => n.pinned && !n.archived && !n.trashed).slice(0, 6);
  }, [filteredNotes, activeView, activeCollectionId]);

  const recentNotes = useMemo(() => {
    if (activeView !== SIDEBAR_VIEWS.ALL || activeCollectionId) return [];
    const recent = getRecentNotes(
      enrichedNotes.filter((n) => searchNotes([n], search).length > 0 || !search.trim()),
      5
    );
    const pinnedIds = new Set(pinnedNotes.map((n) => normalizeId(n.id)));
    return recent.filter((n) => !pinnedIds.has(normalizeId(n.id)));
  }, [enrichedNotes, search, activeView, activeCollectionId, pinnedNotes]);

  const mainNotes = useMemo(() => {
    if (activeView === SIDEBAR_VIEWS.PINNED || activeView === SIDEBAR_VIEWS.RECENT) {
      return filteredNotes;
    }
    const excludeIds = new Set([
      ...pinnedNotes,
      ...recentNotes,
    ].map((n) => normalizeId(n.id)));
    return filteredNotes.filter((n) => !excludeIds.has(normalizeId(n.id)));
  }, [filteredNotes, activeView, pinnedNotes, recentNotes]);

  const viewTitle = activeCollectionId
    ? collections.find((c) => c.id === activeCollectionId)?.name ?? "Collection"
    : VIEW_TITLES[activeView] ?? "Notes";

  const showCollectionsGrid =
    activeView === SIDEBAR_VIEWS.ALL && !activeCollectionId && !search.trim();

  const isFiltered =
    search.trim() !== "" || statusFilter !== "all" || selectedTag !== "";

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalMode("create");
    setEditingNoteId(null);
    setNoteForm(EMPTY_NOTE_FORM);
    setCollectionForm(EMPTY_COLLECTION_FORM);
  }, []);

  const openCreateNote = useCallback(() => {
    setModalType("note");
    setModalMode("create");
    setEditingNoteId(null);
    setNoteForm({
      ...EMPTY_NOTE_FORM,
      collectionId: activeCollectionId ?? "",
    });
    setModalOpen(true);
  }, [activeCollectionId]);

  const openCreateCollection = useCallback(() => {
    setModalType("collection");
    setModalMode("create");
    setCollectionForm(EMPTY_COLLECTION_FORM);
    setModalOpen(true);
  }, []);

  const openEditNote = useCallback((note) => {
    setModalType("note");
    setModalMode("edit");
    setEditingNoteId(note.id);
    setNoteForm({
      title: note.title ?? "",
      description: note.description ?? "",
      collectionId: note.collectionId ?? "",
      tags: (note.tags ?? []).join(", "),
    });
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (modalType === "collection") {
      const name = collectionForm.name.trim();
      if (!name) return;
      addCollection({
        name,
        description: collectionForm.description.trim(),
        icon: collectionForm.icon || "📂",
        color: collectionForm.color,
      });
      closeModal();
      return;
    }

    const title = noteForm.title.trim();
    if (!title) return;

    const payload = {
      title,
      description: noteForm.description.trim(),
      collectionId: noteForm.collectionId || null,
      tags: noteForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      readTime: estimateReadTime(noteForm.description),
    };

    if (modalMode === "edit" && editingNoteId) {
      updateNote(editingNoteId, payload);
    } else {
      addNote(payload);
    }
    closeModal();
  }, [
    modalType,
    modalMode,
    noteForm,
    collectionForm,
    editingNoteId,
    addNote,
    updateNote,
    addCollection,
    closeModal,
  ]);

  const handleOpenNote = useCallback(
    (note) => {
      openNote(note.id);
    },
    [openNote]
  );

  const makeHandlers = useCallback(
    (note) => ({
      onOpen: () => handleOpenNote(note),
      onEdit: () => openEditNote(note),
      onTogglePin: () => togglePinNote(note.id),
      onToggleFavorite: () => toggleFavoriteNote(note.id),
      onDuplicate: () => duplicateNote(note.id),
      onArchive: () => archiveNote(note.id),
      onRestore: () => restoreNote(note.id),
      onTrash: () => trashNote(note.id),
      onRestoreFromTrash: () => restoreFromTrash(note.id),
      onPermanentDelete: () => {
        const ok = window.confirm("Permanently delete this note? This cannot be undone.");
        if (!ok) return;
        permanentlyDeleteNote(note.id);
      },
    }),
    [
      handleOpenNote,
      openEditNote,
      togglePinNote,
      toggleFavoriteNote,
      duplicateNote,
      archiveNote,
      restoreNote,
      trashNote,
      restoreFromTrash,
      permanentlyDeleteNote,
    ]
  );

  const handleViewChange = useCallback((view) => {
    setActiveView(view);
    setActiveCollectionId(null);
    setStatusFilter("all");
  }, []);

  const handleCollectionSelect = useCallback((id) => {
    setActiveCollectionId(id);
    setActiveView(SIDEBAR_VIEWS.ALL);
    setStatusFilter("all");
  }, []);

  const handleEmptyTrash = useCallback(() => {
    const ok = window.confirm("Permanently delete all items in trash?");
    if (!ok) return;
    emptyTrash();
  }, [emptyTrash]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 max-w-7xl mx-auto">
      <KnowledgeSidebar
        activeView={activeView}
        activeCollectionId={activeCollectionId}
        collections={collections}
        noteCounts={noteCounts}
        onViewChange={handleViewChange}
        onCollectionSelect={handleCollectionSelect}
        onNewCollection={openCreateCollection}
        onEmptyTrash={handleEmptyTrash}
        trashCount={stats.trash}
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
          onNewNote={openCreateNote}
          viewTitle={viewTitle}
        />

        {showCollectionsGrid && (
          <KnowledgeCollections
            collections={collections}
            noteCounts={noteCounts}
            activeId={activeCollectionId}
            onSelect={handleCollectionSelect}
          />
        )}

        {activeView === SIDEBAR_VIEWS.ALL && !activeCollectionId && (
          <div className="space-y-4">
            <KnowledgePinned notes={pinnedNotes} makeHandlers={makeHandlers} />
            <KnowledgeRecent notes={recentNotes} makeHandlers={makeHandlers} />
          </div>
        )}

        <section className="space-y-2.5">
          {mainNotes.length > 0 && activeView === SIDEBAR_VIEWS.ALL && !activeCollectionId && (
            <h2 className="text-sm font-black text-white tracking-tight">All Notes</h2>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr">
            {mainNotes.map((note, i) => (
              <KnowledgeCard
                key={note.id}
                note={note}
                index={i}
                handlers={makeHandlers(note)}
              />
            ))}

            {mainNotes.length === 0 &&
              pinnedNotes.length === 0 &&
              recentNotes.length === 0 && (
                <KnowledgeEmptyState
                  onCreate={
                    activeView === SIDEBAR_VIEWS.TRASH ? null : openCreateNote
                  }
                  isFiltered={isFiltered || activeView !== SIDEBAR_VIEWS.ALL}
                  viewLabel={
                    activeView === SIDEBAR_VIEWS.TRASH ? "items in trash" : "notes"
                  }
                />
              )}

            {mainNotes.length > 0 &&
              activeView === SIDEBAR_VIEWS.ALL &&
              !activeCollectionId && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openCreateNote}
                  className="h-full min-h-[140px] p-3.5 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-purple-500/50 hover:bg-white/[0.02] flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
                >
                  <div className="p-2.5 rounded-full bg-white/[0.04] text-[#A0A6B1] group-hover:text-white group-hover:scale-110 transition-all">
                    <Plus size={18} />
                  </div>
                  <span className="text-xs font-bold text-white">New Note</span>
                </motion.button>
              )}
          </div>
        </section>
      </div>

      <KnowledgeModal
        isOpen={modalOpen}
        mode={modalMode}
        type={modalType}
        form={modalType === "note" ? noteForm : collectionForm}
        onFormChange={modalType === "note" ? setNoteForm : setCollectionForm}
        collections={collections}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
