import React from "react";
import { motion } from "motion/react";

import { Plus, ArrowUpRight, Trash2, Pencil } from "lucide-react";
import { useWorkspaceStore } from "../stores/useWorkspaceStore";

export default function WorkspacesPage() {
  const { addWorkspace, deleteWorkspace, updateWorkspace } = useWorkspaceStore();
  const workspaces = useWorkspaceStore((state) => state.workspaces);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState("create"); // create | edit

  const [form, setForm] = React.useState({
    name: "",
    description: "",
    category: "",
  });

  const [editingWorkspaceId, setEditingWorkspaceId] = React.useState(null);

  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");


  const categories = [
    "All",
    "Development",
    "Research",
    "Client",
    "Personal",
    "Learning",
  ];

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode("create");
    setEditingWorkspaceId(null);
    setForm({ name: "", description: "", category: "" });
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingWorkspaceId(null);
    setForm({ name: "", description: "", category: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (workspace) => {
    setModalMode("edit");
    setEditingWorkspaceId(workspace.id);
    setForm({
      name: workspace.name ?? "",
      description: workspace.description ?? "",
      category: workspace.category ?? "",
    });
    setIsModalOpen(true);
  };


  const handleAddNewWorkspace = () => {
    openCreateModal();
  };

  const handleCreateWorkspace = () => {
    const name = form.name.trim();
    const description = form.description.trim();
    const category = form.category.trim();

    if (!name) return;

    addWorkspace({
      id: String(Date.now()),
      name,
      description: description || `${name} workspace`,
      category: category || "Development",
      createdAt: new Date().toISOString(),
    });

    closeModal();
  };

  const handleSaveEdit = () => {
    if (!editingWorkspaceId) return;
    const prevCategory = (workspaces.find((w) => w.id === editingWorkspaceId) ?? {}).category;


    const name = form.name.trim();
    const description = form.description.trim();
    const category = form.category.trim();

    if (!name) return;

    updateWorkspace(editingWorkspaceId, {
      name,
      description,
      category,
      updated: new Date().toISOString(),
    });

    closeModal();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-white/[0.08] pb-5">
        <p className="text-xs text-[#A0A6B1] mb-2">Workspace Count: {workspaces.length}</p>
        <h1 className="text-2xl font-black text-white">Workspaces</h1>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}

                className={`px-3 py-1 rounded-full text-xs border transition-all cursor-pointer ${
                  selectedCategory === c

                    ? "bg-[#4F8CFF]/20 border-[#4F8CFF]/60 text-white"
                    : "bg-white/[0.03] border-white/[0.10] text-[#A0A6B1] hover:text-white hover:border-[#4F8CFF]/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#4F8CFF]/60"
            placeholder="Search workspaces..."
          />
        </div>

        <p className="text-xs text-[#A0A6B1] mt-1">
          Manage your isolated directories, project contexts, and external assets pipelines under sandboxed boundaries.
        </p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-lg rounded-2xl border border-white/[0.10] bg-white/[0.03] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-black text-white">
                  {modalMode === "edit" ? "Edit Workspace" : "Create Workspace"}
                </h2>
                <p className="text-xs text-[#A0A6B1] mt-1">
                  {modalMode === "edit"
                    ? "Update the workspace metadata." 
                    : "Set up a sandboxed space with its metadata."}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-[#A0A6B1] hover:text-white transition-colors cursor-pointer rounded-lg px-2 py-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1">Workspace Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#4F8CFF]/60"
                  placeholder="e.g. Research Hub"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#4F8CFF]/60 resize-none"
                  placeholder="What will this workspace contain?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#4F8CFF]/60"
                  placeholder="e.g. Development"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl text-sm border border-white/[0.10] text-[#A0A6B1] hover:text-white hover:border-white/[0.20] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {modalMode === "edit" ? (
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-xl text-sm bg-[#4F8CFF] text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
                  disabled={!form.name.trim()}
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={handleCreateWorkspace}
                  className="px-4 py-2 rounded-xl text-sm bg-[#4F8CFF] text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
                  disabled={!form.name.trim()}
                >
                  Create
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {workspaces
          .filter((workspace) => {
            const q = search.trim().toLowerCase();

            const workspaceCategory = (workspace.category ?? "").toString().toLowerCase();
            const selectedCategoryNormalized = (selectedCategory ?? "All").toString().toLowerCase();

            const categoryMatches =
              selectedCategoryNormalized === "all" ||
              workspaceCategory === selectedCategoryNormalized;

            if (!categoryMatches) return false;

            if (!q) return true;

            const name = (workspace.name ?? "").toString().toLowerCase();
            const description = (workspace.description ?? "").toString().toLowerCase();
            const category = workspaceCategory;

            return name.includes(q) || description.includes(q) || category.includes(q);
          })

          .map((workspace) => (
            <motion.div
              whileHover={{ y: -4 }}
              key={workspace.id}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between h-44 relative group overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr ${
                  workspace.color ?? "from-blue-500/20 to-indigo-500/10"
                } blur-2xl opacity-30`}
              />

              <div className="z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.08] text-[9px] font-bold uppercase text-[#4F8CFF] rounded-full">
                    {workspace.category ?? "Development"}
                  </span>
                  <span className="text-[10px] text-[#A0A6B1]">{workspace.updated ?? "Just now"}</span>
                </div>
                <h3 className="text-sm font-bold text-white block truncate">{workspace.name}</h3>
                <p className="text-xs text-[#A0A6B1] mt-1 line-clamp-2">
                  {workspace.description ?? "Contains dynamic code representations, metadata guidelines, and live assets sync."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-4 z-10">
                <span className="text-[11px] text-[#A0A6B1]">{workspace.items ?? 0} items indexed</span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openEditModal(workspace);
                    }}
                    className="text-[11px] text-[#4F8CFF] hover:underline flex items-center gap-1 cursor-pointer"
                    aria-label="Edit workspace"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const ok = window.confirm("Delete this workspace?");
                      if (!ok) return;

                      deleteWorkspace(workspace.id);
                    }}
                    className="text-[11px] text-[#A0A6B1] hover:text-white flex items-center gap-1 cursor-pointer"
                    aria-label="Delete workspace"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <button className="text-[11px] text-[#4F8CFF] hover:underline flex items-center gap-1 cursor-pointer">
                  Enter Space <ArrowUpRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}

        {/* New workspace trigger card */}
        <button
          onClick={handleAddNewWorkspace}
          className="p-5 rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-[#4F8CFF]/50 hover:bg-white/[0.02] flex flex-col items-center justify-center text-center gap-2.5 h-44 transition-all cursor-pointer group"
        >
          <div className="p-3 rounded-full bg-white/[0.04] text-[#A0A6B1] group-hover:text-white group-hover:scale-115 transition-all">
            <Plus size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-white">Create New Workspace</span>
            <p className="text-[10px] text-[#A0A6B1] mt-0.5">Partition system directory</p>
          </div>
        </button>
      </div>
    </div>
  );
}

