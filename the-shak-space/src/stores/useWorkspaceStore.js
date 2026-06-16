import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialWorkspaces = [
  {
    id: 1,
    name: "The Shak Space",
    description: "Main operating workspace",
    category: "Development",
    createdAt: new Date().toISOString(),
  },
];

export const useWorkspaceStore = create(
  persist(
    (set) => ({
      workspaces: initialWorkspaces,

      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
        })),

      deleteWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter(
            (workspace) => workspace.id !== id
          ),
        })),

      updateWorkspace: (id, updatedData) =>
        set((state) => ({
          workspaces: state.workspaces.map((workspace) =>
            workspace.id === id
              ? { ...workspace, ...updatedData }
              : workspace
          ),
        })),
    }),
    {
      name: "shak-space-workspaces",
      getStorage: () => localStorage,
    }
  )
);

