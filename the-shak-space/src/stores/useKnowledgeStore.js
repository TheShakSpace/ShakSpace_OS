import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createDefaultNote,
  createDefaultCollection,
  migrateNote,
  migrateCollection,
  normalizeId,
} from "../utils/knowledgeHelpers";

const initialCollections = [
  createDefaultCollection({
    id: "col-general",
    name: "General",
    icon: "📚",
    color: "from-purple-500/20 to-pink-500/10",
    description: "Default knowledge collection",
  }),
  createDefaultCollection({
    id: "col-engineering",
    name: "Engineering",
    icon: "💻",
    color: "from-blue-500/20 to-indigo-500/10",
    description: "Technical docs and architecture",
  }),
  createDefaultCollection({
    id: "col-research",
    name: "Research",
    icon: "🔬",
    color: "from-emerald-500/20 to-teal-500/10",
    description: "Papers, findings, and references",
  }),
];

const initialNotes = [
  createDefaultNote({
    id: "note-prd",
    title: "Product Requirements Doc (PRD)",
    description: "Core product requirements, user stories, and acceptance criteria for The Shak Space v1 launch.",
    collectionId: "col-general",
    tags: ["product", "requirements"],
    readTime: 5,
    favorite: true,
    pinned: true,
  }),
  createDefaultNote({
    id: "note-vibe",
    title: "Vibe and Aesthetic Guidelines",
    description: "Glassmorphism design language, color tokens, typography, and motion principles for the OS.",
    collectionId: "col-general",
    tags: ["design", "ui", "brand"],
    readTime: 12,
    favorite: true,
  }),
  createDefaultNote({
    id: "note-nextjs",
    title: "Next.js 16 Server Components Plan",
    description: "Migration strategy for server components, streaming SSR, and data fetching patterns.",
    collectionId: "col-engineering",
    tags: ["engineering", "nextjs", "architecture"],
    readTime: 3,
    pinned: true,
  }),
];

function mapNote(state, id, updater) {
  const targetId = normalizeId(id);
  return {
    notes: state.notes.map((note) =>
      normalizeId(note.id) === targetId ? updater(note) : note
    ),
  };
}

function mapCollection(state, id, updater) {
  const targetId = normalizeId(id);
  return {
    collections: state.collections.map((col) =>
      normalizeId(col.id) === targetId ? updater(col) : col
    ),
  };
}

export const useKnowledgeStore = create(
  persist(
    (set, get) => ({
      notes: initialNotes,
      collections: initialCollections,

      addNote: (note) =>
        set((state) => ({
          notes: [...state.notes, createDefaultNote(note)],
        })),

      updateNote: (id, data) =>
        set((state) =>
          mapNote(state, id, (note) => ({
            ...note,
            ...data,
            updatedAt: new Date().toISOString(),
          }))
        ),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter(
            (note) => normalizeId(note.id) !== normalizeId(id)
          ),
        })),

      duplicateNote: (id) => {
        const source = get().notes.find(
          (n) => normalizeId(n.id) === normalizeId(id)
        );
        if (!source) return;

        const copy = createDefaultNote({
          title: `${source.title} (Copy)`,
          description: source.description,
          collectionId: source.collectionId,
          tags: [...(source.tags ?? [])],
          readTime: source.readTime,
        });

        set((state) => ({ notes: [...state.notes, copy] }));
      },

      togglePinNote: (id) =>
        set((state) =>
          mapNote(state, id, (note) => ({
            ...note,
            pinned: !note.pinned,
            updatedAt: new Date().toISOString(),
          }))
        ),

      toggleFavoriteNote: (id) =>
        set((state) =>
          mapNote(state, id, (note) => ({
            ...note,
            favorite: !note.favorite,
            updatedAt: new Date().toISOString(),
          }))
        ),

      archiveNote: (id) =>
        set((state) =>
          mapNote(state, id, (note) => ({
            ...note,
            archived: true,
            pinned: false,
            updatedAt: new Date().toISOString(),
          }))
        ),

      restoreNote: (id) =>
        set((state) =>
          mapNote(state, id, (note) => ({
            ...note,
            archived: false,
            updatedAt: new Date().toISOString(),
          }))
        ),

      trashNote: (id) =>
        set((state) =>
          mapNote(state, id, (note) => ({
            ...note,
            trashed: true,
            trashedAt: new Date().toISOString(),
            archived: false,
            pinned: false,
            updatedAt: new Date().toISOString(),
          }))
        ),

      restoreFromTrash: (id) =>
        set((state) =>
          mapNote(state, id, (note) => ({
            ...note,
            trashed: false,
            trashedAt: null,
            updatedAt: new Date().toISOString(),
          }))
        ),

      permanentlyDeleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter(
            (note) => normalizeId(note.id) !== normalizeId(id)
          ),
        })),

      openNote: (id) =>
        set((state) =>
          mapNote(state, id, (note) => ({
            ...note,
            lastOpened: new Date().toISOString(),
          }))
        ),

      addCollection: (collection) =>
        set((state) => ({
          collections: [...state.collections, createDefaultCollection(collection)],
        })),

      updateCollection: (id, data) =>
        set((state) => mapCollection(state, id, (col) => ({ ...col, ...data }))),

      deleteCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter(
            (col) => normalizeId(col.id) !== normalizeId(id)
          ),
          notes: state.notes.map((note) =>
            normalizeId(note.collectionId) === normalizeId(id)
              ? { ...note, collectionId: null }
              : note
          ),
        })),

      getNoteById: (id) =>
        get().notes.find((n) => normalizeId(n.id) === normalizeId(id)),

      getCollectionById: (id) =>
        get().collections.find((c) => normalizeId(c.id) === normalizeId(id)),

      emptyTrash: () =>
        set((state) => ({
          notes: state.notes.filter((n) => !n.trashed),
        })),
    }),
    {
      name: "shak-space-knowledge",
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState ?? {};

        if (version === 0 || version === 1) {
          const rawNotes = Array.isArray(state.notes) ? state.notes : [];
          const rawCollections = Array.isArray(state.collections)
            ? state.collections
            : initialCollections;

          return {
            ...state,
            notes: rawNotes.length > 0 ? rawNotes.map(migrateNote) : initialNotes,
            collections:
              rawCollections.length > 0
                ? rawCollections.map(migrateCollection)
                : initialCollections,
          };
        }

        return {
          ...state,
          notes: Array.isArray(state.notes)
            ? state.notes.map(migrateNote)
            : initialNotes,
          collections: Array.isArray(state.collections)
            ? state.collections.map(migrateCollection)
            : initialCollections,
        };
      },
    }
  )
);
