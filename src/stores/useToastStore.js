import { create } from "zustand";

let toastId = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  showToast: (message, type = "error") => {
    const id = ++toastId;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      get().dismissToast(id);
    }, 5000);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
