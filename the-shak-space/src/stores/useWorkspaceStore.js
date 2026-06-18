import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createDefaultWorkspace,
  generateWorkspaceId,
  migrateWorkspace,
  normalizeId,
} from "../utils/workspaceHelpers";

const initialWorkspaces = [
  createDefaultWorkspace({
    id: "shak-space-main",
    name: "The Shak Space",
    description: "Main operating workspace for your internet OS.",
    category: "Development",
    icon: "⚡",
    color: "from-blue-500/20 to-indigo-500/10",
    documents: 12,
    knowledge: 8,
    aiChats: 24,
    automations: 3,
    storage: 256,
    pinned: true,
    favorite: true,
  }),
];

function appendActivity(workspace, type, label) {
  const entry = {
    id: generateWorkspaceId(),
    type,
    label,
    timestamp: new Date().toISOString(),
  };
  return {
    ...workspace,
    activity: [entry, ...(workspace.activity ?? [])].slice(0, 50),
    updatedAt: entry.timestamp,
  };
}

function mapWorkspace(state, id, updater) {
  const targetId = normalizeId(id);
  return {
    workspaces: state.workspaces.map((workspace) =>
      normalizeId(workspace.id) === targetId ? updater(workspace) : workspace
    ),
  };
}

export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      workspaces: initialWorkspaces,

      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [
            ...state.workspaces,
            createDefaultWorkspace(workspace),
          ],
        })),

      deleteWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter(
            (workspace) => normalizeId(workspace.id) !== normalizeId(id)
          ),
        })),

      updateWorkspace: (id, updatedData) =>
        set((state) =>
          mapWorkspace(state, id, (workspace) =>
            appendActivity(
              { ...workspace, ...updatedData },
              "edited",
              "Workspace edited"
            )
          )
        ),

      togglePinWorkspace: (id) =>
        set((state) =>
          mapWorkspace(state, id, (workspace) => {
            const pinned = !workspace.pinned;
            return appendActivity(
              { ...workspace, pinned },
              pinned ? "pinned" : "unpinned",
              pinned ? "Workspace pinned" : "Workspace unpinned"
            );
          })
        ),

      toggleFavoriteWorkspace: (id) =>
        set((state) =>
          mapWorkspace(state, id, (workspace) => ({
            ...workspace,
            favorite: !workspace.favorite,
            updatedAt: new Date().toISOString(),
          }))
        ),

      archiveWorkspace: (id) =>
        set((state) =>
          mapWorkspace(state, id, (workspace) =>
            appendActivity(
              { ...workspace, archived: true, pinned: false },
              "archived",
              "Workspace archived"
            )
          )
        ),

      restoreWorkspace: (id) =>
        set((state) =>
          mapWorkspace(state, id, (workspace) =>
            appendActivity(
              { ...workspace, archived: false },
              "restored",
              "Workspace restored"
            )
          )
        ),

      duplicateWorkspace: (id) => {
        const source = get().workspaces.find(
          (w) => normalizeId(w.id) === normalizeId(id)
        );
        if (!source) return;

        const copy = createDefaultWorkspace({
          name: `${source.name} (Copy)`,
          description: source.description,
          category: source.category,
          icon: source.icon,
          color: source.color,
          accentColor: source.accentColor,
          tags: [...(source.tags ?? [])],
        });

        set((state) => ({
          workspaces: [...state.workspaces, copy],
        }));
      },

      openWorkspace: (id) =>
        set((state) =>
          mapWorkspace(state, id, (workspace) =>
            appendActivity(
              { ...workspace, lastOpened: new Date().toISOString() },
              "opened",
              "Workspace opened"
            )
          )
        ),

      getWorkspaceById: (id) =>
        get().workspaces.find(
          (w) => normalizeId(w.id) === normalizeId(id)
        ),

      addActivity: (id, type, label) =>
        set((state) =>
          mapWorkspace(state, id, (workspace) =>
            appendActivity(workspace, type, label)
          )
        ),
    }),
    {
      name: "shak-space-workspaces",
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState ?? {};

        if (version === 0 || version === 1) {
          const raw = Array.isArray(state.workspaces) ? state.workspaces : [];
          return {
            ...state,
            workspaces: raw.length > 0
              ? raw.map(migrateWorkspace)
              : initialWorkspaces,
          };
        }

        const workspaces = Array.isArray(state.workspaces)
          ? state.workspaces.map(migrateWorkspace)
          : initialWorkspaces;

        return { ...state, workspaces };
      },
    }
  )
);
