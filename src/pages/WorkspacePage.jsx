import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { motion } from "motion/react";
import { Plus } from "lucide-react";

import { useWorkspaceStore } from "../stores/useWorkspaceStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastStore } from "../stores/useToastStore";
import {
  searchWorkspaces,
  filterWorkspaces,
  getRecentWorkspaces,
  getWorkspaceStats,
  mergeServerStats,
  normalizeId,
  extractApiError,
} from "../utils/workspaceHelpers";

import WorkspaceHero from "../components/workspace/WorkspaceHero";
import WorkspaceFilters from "../components/workspace/WorkspaceFilters";
import WorkspaceModal, { EMPTY_FORM } from "../components/workspace/WorkspaceModal";
import WorkspaceCard from "../components/workspace/WorkspaceCard";
import WorkspaceEmptyState from "../components/workspace/WorkspaceEmptyState";
import PinnedSection from "../components/workspace/PinnedSection";
import RecentSection from "../components/workspace/RecentSection";
import FavoritesSection from "../components/workspace/FavoritesSection";
import ArchivedSection from "../components/workspace/ArchivedSection";

export default function WorkspacesPage() {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialLoadRef = useRef(false);

  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const loading = useWorkspaceStore((state) => state.loading);
  const error = useWorkspaceStore((state) => state.error);
  const serverStats = useWorkspaceStore((state) => state.stats);

  const addWorkspace = useWorkspaceStore((state) => state.addWorkspace);
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);
  const togglePinWorkspace = useWorkspaceStore((state) => state.togglePinWorkspace);
  const toggleFavoriteWorkspace = useWorkspaceStore((state) => state.toggleFavoriteWorkspace);
  const archiveWorkspace = useWorkspaceStore((state) => state.archiveWorkspace);
  const restoreWorkspace = useWorkspaceStore((state) => state.restoreWorkspace);
  const duplicateWorkspace = useWorkspaceStore((state) => state.duplicateWorkspace);
  const openWorkspace = useWorkspaceStore((state) => state.openWorkspace);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (!isAuthenticated || initialLoadRef.current) return;
    initialLoadRef.current = true;

    let active = true;
    const load = async () => {
      try {
        await useWorkspaceStore.getState().refresh();
      } catch (e) {
        if (active) showToast(extractApiError(e), "error");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated, showToast]);

  const stats = useMemo(() => {
    const clientStats = getWorkspaceStats(workspaces);
    return mergeServerStats(clientStats, serverStats);
  }, [workspaces, serverStats]);

  const filteredWorkspaces = useMemo(() => {
    const searched = searchWorkspaces(workspaces, search);
    return filterWorkspaces(searched, {
      category: selectedCategory,
      statusFilter,
      sortBy,
    });
  }, [workspaces, search, selectedCategory, statusFilter, sortBy]);

  const pinnedWorkspaces = useMemo(
    () =>
      filteredWorkspaces
        .filter((w) => w.pinned && !w.archived)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [filteredWorkspaces]
  );

  const favoriteWorkspaces = useMemo(
    () => filteredWorkspaces.filter((w) => w.favorite && !w.archived && !w.pinned),
    [filteredWorkspaces]
  );

  const recentWorkspaces = useMemo(() => {
    const recent = getRecentWorkspaces(filteredWorkspaces, 5);
    const pinnedIds = new Set(pinnedWorkspaces.map((w) => normalizeId(w.id)));
    const favoriteIds = new Set(favoriteWorkspaces.map((w) => normalizeId(w.id)));
    return recent.filter(
      (w) =>
        !pinnedIds.has(normalizeId(w.id)) && !favoriteIds.has(normalizeId(w.id))
    );
  }, [filteredWorkspaces, pinnedWorkspaces, favoriteWorkspaces]);

  const mainWorkspaces = useMemo(() => {
    const excludeIds = new Set([
      ...pinnedWorkspaces,
      ...favoriteWorkspaces,
      ...recentWorkspaces,
    ].map((w) => normalizeId(w.id)));

    return filteredWorkspaces.filter(
      (w) => !w.archived && !excludeIds.has(normalizeId(w.id))
    );
  }, [filteredWorkspaces, pinnedWorkspaces, favoriteWorkspaces, recentWorkspaces]);

  const archivedWorkspaces = useMemo(
    () =>
      statusFilter === "archived" || statusFilter === "all"
        ? searchWorkspaces(
            workspaces.filter((w) => w.archived),
            search
          ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        : [],
    [workspaces, search, statusFilter]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalMode("create");
    setEditingWorkspaceId(null);
    setSelectedTemplateId(null);
    setForm(EMPTY_FORM);
    setSubmitting(false);
  }, []);

  const openCreateModal = useCallback(() => {
    setModalMode("create");
    setEditingWorkspaceId(null);
    setSelectedTemplateId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((workspace) => {
    setModalMode("edit");
    setEditingWorkspaceId(workspace.id);
    setForm({
      name: workspace.name ?? "",
      description: workspace.description ?? "",
      category: workspace.category ?? "general",
      icon: workspace.icon ?? "📁",
      color: workspace.color ?? "from-blue-500/20 to-indigo-500/10",
      accentColor: workspace.accentColor ?? "#4F8CFF",
      tags: (workspace.tags ?? []).join(", "),
    });
    setIsModalOpen(true);
  }, []);

  const handleSelectTemplate = useCallback((template) => {
    setSelectedTemplateId(template.id);
    setForm({
      name: template.name,
      description: template.description,
      category: template.category,
      icon: template.icon,
      color: template.color,
      accentColor: template.accentColor,
      tags: (template.tags ?? []).join(", "),
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const name = form.name.trim();
    if (!name || submitting) return;

    const payload = {
      name,
      description: form.description.trim(),
      category: form.category.trim() || "general",
      icon: form.icon || "📁",
      color: form.color,
      accentColor: form.accentColor,
    };

    setSubmitting(true);
    try {
      if (modalMode === "edit" && editingWorkspaceId) {
        await updateWorkspace(editingWorkspaceId, payload);
        showToast("Workspace updated", "success");
      } else {
        await addWorkspace(payload);
        showToast("Workspace created", "success");
      }
      closeModal();
    } catch (e) {
      showToast(extractApiError(e), "error");
      setSubmitting(false);
    }
  }, [
    form,
    modalMode,
    editingWorkspaceId,
    submitting,
    updateWorkspace,
    addWorkspace,
    closeModal,
    showToast,
  ]);

  const runAction = useCallback(
    async (action, successMessage) => {
      try {
        await action();
        if (successMessage) showToast(successMessage, "success");
      } catch (e) {
        showToast(extractApiError(e), "error");
      }
    },
    [showToast]
  );

  const handleEnter = useCallback(
    async (workspace) => {
      try {
        await openWorkspace(workspace.id);
        navigate(`/workspace/${workspace.id}`);
      } catch (e) {
        showToast(extractApiError(e), "error");
      }
    },
    [openWorkspace, navigate, showToast]
  );

  const handleDelete = useCallback(
    (workspace) => {
      const ok = window.confirm(`Delete "${workspace.name}"? This cannot be undone.`);
      if (!ok) return;
      runAction(() => deleteWorkspace(workspace.id), "Workspace deleted");
    },
    [deleteWorkspace, runAction]
  );

  const makeCardProps = useCallback(
    (workspace) => ({
      onEnter: () => handleEnter(workspace),
      onEdit: () => openEditModal(workspace),
      onDelete: () => handleDelete(workspace),
      onTogglePin: () => runAction(() => togglePinWorkspace(workspace.id)),
      onToggleFavorite: () => runAction(() => toggleFavoriteWorkspace(workspace.id)),
      onArchive: () => runAction(() => archiveWorkspace(workspace.id), "Workspace archived"),
      onRestore: () => runAction(() => restoreWorkspace(workspace.id), "Workspace restored"),
      onDuplicate: () => runAction(() => duplicateWorkspace(workspace.id), "Workspace duplicated"),
    }),
    [
      handleEnter,
      openEditModal,
      handleDelete,
      runAction,
      togglePinWorkspace,
      toggleFavoriteWorkspace,
      archiveWorkspace,
      restoreWorkspace,
      duplicateWorkspace,
    ]
  );

  const cardPropsFn = useCallback(
    (workspace) => makeCardProps(workspace),
    [makeCardProps]
  );

  const showArchivedSection =
    archivedWorkspaces.length > 0 && (statusFilter === "all" || statusFilter === "archived");
  const isFiltered =
    search.trim() !== "" ||
    selectedCategory !== "all" ||
    statusFilter !== "all";
  const hasVisibleWorkspaces =
    pinnedWorkspaces.length > 0 ||
    favoriteWorkspaces.length > 0 ||
    recentWorkspaces.length > 0 ||
    mainWorkspaces.length > 0 ||
    showArchivedSection;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <WorkspaceHero stats={stats} />

      <WorkspaceFilters
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {loading && workspaces.length === 0 && (
        <p className="text-sm text-[#A0A6B1]">Loading workspaces...</p>
      )}

      {!loading && error && workspaces.length === 0 && (
        <p className="text-sm text-red-400">
          {extractApiError({ response: { data: error } })}
        </p>
      )}

      <WorkspaceModal
        isOpen={isModalOpen}
        mode={modalMode}
        form={form}
        onFormChange={setForm}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onSelectTemplate={handleSelectTemplate}
        selectedTemplateId={selectedTemplateId}
        submitting={submitting}
      />

      {statusFilter !== "archived" && (
        <>
          <PinnedSection workspaces={pinnedWorkspaces} cardProps={cardPropsFn} />
          <FavoritesSection workspaces={favoriteWorkspaces} cardProps={cardPropsFn} />
          <RecentSection workspaces={recentWorkspaces} cardProps={cardPropsFn} />
        </>
      )}

      {statusFilter !== "archived" && (
        <section className="space-y-4">
          {mainWorkspaces.length > 0 && (
            <h2 className="text-lg font-black text-white">All Workspaces</h2>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainWorkspaces.map((workspace, i) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                index={i}
                {...makeCardProps(workspace)}
              />
            ))}

            {!loading && !hasVisibleWorkspaces && (
              <WorkspaceEmptyState onCreate={openCreateModal} isFiltered={isFiltered} />
            )}

            {hasVisibleWorkspaces && statusFilter === "all" && (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreateModal}
                className="p-5 rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-[#4F8CFF]/50 hover:bg-white/[0.02] flex flex-col items-center justify-center text-center gap-2.5 min-h-[280px] transition-all cursor-pointer group"
              >
                <div className="p-3 rounded-full bg-white/[0.04] text-[#A0A6B1] group-hover:text-white group-hover:scale-110 transition-all">
                  <Plus size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">Create New Workspace</span>
                  <p className="text-[10px] text-[#A0A6B1] mt-0.5">Partition system directory</p>
                </div>
              </motion.button>
            )}
          </div>
        </section>
      )}

      {showArchivedSection && (
        <ArchivedSection workspaces={archivedWorkspaces} cardProps={cardPropsFn} />
      )}

      {statusFilter === "archived" && archivedWorkspaces.length === 0 && !loading && (
        <WorkspaceEmptyState onCreate={openCreateModal} isFiltered />
      )}
    </div>
  );
}
