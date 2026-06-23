import { create } from "zustand";
import { authService } from "../services/authService";

function extractUser(res) {
  return res?.data?.data?.user ?? res?.data?.user ?? null;
}

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  authLoading: true,
  validationError: null,

  restoreSession: async () => {
    set({ authLoading: true, validationError: null });
    try {
      const res = await authService.me();
      const userProfile = extractUser(res);
      set({
        user: userProfile,
        isAuthenticated: Boolean(userProfile?.id || userProfile?.email),
        authLoading: false,
      });
      return userProfile;
    } catch {
      try {
        const refreshRes = await authService.refresh();
        const userProfile = extractUser(refreshRes);
        set({
          user: userProfile,
          isAuthenticated: Boolean(userProfile?.id || userProfile?.email),
          authLoading: false,
        });
        return userProfile;
      } catch {
        set({ user: null, isAuthenticated: false, authLoading: false });
        return null;
      }
    }
  },

  login: async ({ email, password }) => {
    set({ authLoading: true, validationError: null });
    try {
      const res = await authService.login({ email, password });
      const userProfile = extractUser(res);
      set({
        user: userProfile,
        isAuthenticated: Boolean(userProfile?.id || userProfile?.email),
        authLoading: false,
      });
      return userProfile;
    } catch (err) {
      const data = err?.response?.data;
      const messages =
        data?.error?.details ??
        data?.errors ??
        data?.error?.message ??
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
