import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";

import { useWorkspaceStore } from "../stores/useWorkspaceStore";
import { useToastStore } from "../stores/useToastStore";
import { normalizeId, extractApiError } from "../utils/workspaceHelpers";
import WorkspaceDetails from "../components/workspace/WorkspaceDetails";
import WorkspaceModal, { EMPTY_FORM } from "../components/workspace/WorkspaceModal";

export default function WorkspaceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);

  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const loading = useWorkspaceStore((state) => state.loading);
  const getWorkspaceById = useWorkspaceStore((state) => state.getWorkspaceById);
  const fetchWorkspace = useWorkspaceStore((state) => state.fetchWorkspace);
  const openWorkspace = useWorkspaceStore((state) => state.openWorkspace);
  const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const togglePinWorkspace = useWorkspaceStore((state) => state.togglePinWorkspace);
  const toggleFavoriteWorkspace = useWorkspaceStore((state) => state.toggleFavoriteWorkspace);
  const archiveWorkspace = useWorkspaceStore((state) => state.archiveWorkspace);
  const restoreWorkspace = useWorkspaceStore((state) => state.restoreWorkspace);
  const duplicateWorkspace = useWorkspaceStore((state) => state.duplicateWorkspace);

  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const openedRef = useRef(false);

  const workspace =
    getWorkspaceById(id) ??
    workspaces.find((w) => normalizeId(w.id) === normalizeId(id));

  useEffect(() => {
    if (!id) return;

    const cached = getWorkspaceById(id);
    if (cached) {
      if (!openedRef.current) {
        openWorkspace(id).catch(() => {});
        openedRef.current = true;
      }
      return;
    }

    fetchWorkspace(id)
      .then(() => {
        if (!openedRef.current) {
          openWorkspace(id).catch(() => {});
          openedRef.current = true;
        }
      })
      .catch((e) => showToast(extractApiError(e), "error"));
  }, [id, getWorkspaceById, fetchWorkspace, openWorkspace, showToast]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
    setSubmitting(false);
  }, []);

  const openEditModal = useCallback(() => {
    if (!workspace) return;
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
  }, [workspace]);

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

  const handleSaveEdit = useCallback(async () => {
    if (!workspace || !form.name.trim() || submitting) return;

    setSubmitting(true);
    try {
      await updateWorkspace(workspace.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim() || "general",
        icon: form.icon || "📁",
        color: form.color,
        accentColor: form.accentColor,
      });
      showToast("Workspace updated", "success");
      closeModal();
    } catch (e) {
      showToast(extractApiError(e), "error");
      setSubmitting(false);
    }
  }, [workspace, form, submitting, updateWorkspace, closeModal, showToast]);

  const handleDelete = useCallback(() => {
    if (!workspace) return;
    const ok = window.confirm(`Delete "${workspace.name}"? This cannot be undone.`);
    if (!ok) return;
    runAction(async () => {
      await deleteWorkspace(workspace.id);
      navigate("/workspaces", { replace: true });
    }, "Workspace deleted");
  }, [workspace, deleteWorkspace, navigate, runAction]);

  if (loading && !workspace) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center text-sm text-[#A0A6B1]">
        Loading workspace...
      </div>
    );
  }

  if (!workspace) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto py-20 text-center"
      >
        <h1 className="text-xl font-black text-white mb-2">Workspace not found</h1>
        <p className="text-sm text-[#A0A6B1] mb-6">
          This workspace may have been deleted or the link is invalid.
        </p>
        <button
          type="button"
          onClick={() => navigate("/workspaces")}
          className="px-4 py-2 rounded-xl text-sm bg-[#4F8CFF] text-white hover:brightness-110 cursor-pointer"
        >
          Back to Workspaces
        </button>
      </motion.div>
    );
  }

  const actionHandlers = {
    onEdit: openEditModal,
    onDelete: handleDelete,
    onTogglePin: () => runAction(() => togglePinWorkspace(workspace.id)),
    onToggleFavorite: () => runAction(() => toggleFavoriteWorkspace(workspace.id)),
    onArchive: () =>
      runAction(async () => {
        await archiveWorkspace(workspace.id);
        navigate("/workspaces");
      }, "Workspace archived"),
    onRestore: () => runAction(() => restoreWorkspace(workspace.id), "Workspace restored"),
    onDuplicate: () =>
      runAction(async () => {
        await duplicateWorkspace(workspace.id);
        navigate("/workspaces");
      }, "Workspace duplicated"),
  };

  return (
    <div className="max-w-7xl mx-auto">
      <WorkspaceDetails
        workspace={workspace}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={() => navigate("/workspaces")}
        actionHandlers={actionHandlers}
      />

      <WorkspaceModal
        isOpen={isModalOpen}
        mode="edit"
        form={form}
        onFormChange={setForm}
        onClose={closeModal}
        onSubmit={handleSaveEdit}
        onSelectTemplate={() => {}}
        selectedTemplateId={null}
        submitting={submitting}
      />
    </div>
  );
}
