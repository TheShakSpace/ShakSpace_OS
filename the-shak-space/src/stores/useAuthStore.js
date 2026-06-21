import { create } from "zustand";
import { authService } from "../services/authService";

export const useAuthStore = create((set) => ({

  user: null,
  isAuthenticated: false,
  authLoading: true,
  validationError: null,

  restoreSession: async () => {
    set({ authLoading: true, validationError: null });
    try {
      const res = await authService.me();
      const userProfile = res?.data?.user ?? res?.data;
      set({ user: userProfile ?? null, isAuthenticated: !!userProfile, authLoading: false });
      return userProfile ?? null;
    } catch (e) {
      set({ user: null, isAuthenticated: false, authLoading: false });
      return null;
    }
  },

  login: async ({ email, password }) => {
    set({ authLoading: true, validationError: null });
    try {
      const res = await authService.login({ email, password });
      const userProfile = res?.data?.user ?? res?.data;
      set({ user: userProfile ?? null, isAuthenticated: !!userProfile, authLoading: false });
      return userProfile ?? null;
    } catch (err) {
      const data = err?.response?.data;
      const messages =
        data?.errors ??
        data?.message ??
        data?.error ??
        data ??
        "Login failed";

      set({
        validationError: messages,
        user: null,
        isAuthenticated: false,
        authLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    set({ authLoading: true, validationError: null });
    try {
      await authService.logout();
    } catch {
      // ignore; we still clear local state
    }
    set({ user: null, isAuthenticated: false, authLoading: false });
  },
}));

