import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Plus } from "lucide-react";

import { useWorkspaceStore } from "../stores/useWorkspaceStore";
import {
  searchWorkspaces,
  filterWorkspaces,
  getRecentWorkspaces,
  getWorkspaceStats,
  normalizeId,
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

  const workspaces = useWorkspaceStore((state) => state.workspaces);
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

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const stats = useMemo(() => getWorkspaceStats(workspaces), [workspaces]);

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
      category: workspace.category ?? "",
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

  const parseTags = (tagsStr) =>
    tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSubmit = useCallback(() => {
    const name = form.name.trim();
    if (!name) return;

    const payload = {
      name,
      description: form.description.trim(),
      category: form.category.trim() || "Development",
      icon: form.icon || "📁",
      color: form.color,
      accentColor: form.accentColor,
      tags: parseTags(form.tags),
    };

    if (modalMode === "edit" && editingWorkspaceId) {
      updateWorkspace(editingWorkspaceId, payload);
    } else {
      addWorkspace(payload);
    }

    closeModal();
  }, [form, modalMode, editingWorkspaceId, updateWorkspace, addWorkspace, closeModal]);

  const handleEnter = useCallback(
    (workspace) => {
      openWorkspace(workspace.id);
      navigate(`/workspace/${workspace.id}`);
    },
    [openWorkspace, navigate]
  );

  const handleDelete = useCallback(
    (workspace) => {
      const ok = window.confirm(`Delete "${workspace.name}"? This cannot be undone.`);
      if (!ok) return;
      deleteWorkspace(workspace.id);
    },
    [deleteWorkspace]
  );

  const makeCardProps = useCallback(
    (workspace) => ({
      onEnter: () => handleEnter(workspace),
      onEdit: () => openEditModal(workspace),
      onDelete: () => handleDelete(workspace),
      onTogglePin: () => togglePinWorkspace(workspace.id),
      onToggleFavorite: () => toggleFavoriteWorkspace(workspace.id),
      onArchive: () => archiveWorkspace(workspace.id),
      onRestore: () => restoreWorkspace(workspace.id),
      onDuplicate: () => duplicateWorkspace(workspace.id),
    }),
    [
      handleEnter,
      openEditModal,
      handleDelete,
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
    selectedCategory !== "All" ||
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

      <WorkspaceModal
        isOpen={isModalOpen}
        mode={modalMode}
        form={form}
        onFormChange={setForm}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onSelectTemplate={handleSelectTemplate}
        selectedTemplateId={selectedTemplateId}
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

            {!hasVisibleWorkspaces && (
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

      {statusFilter === "archived" && archivedWorkspaces.length === 0 && (
        <WorkspaceEmptyState onCreate={openCreateModal} isFiltered />
      )}
    </div>
  );
}
