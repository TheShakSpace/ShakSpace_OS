import { create } from "zustand";
import { authService } from "../services/authService";

const DEMO_FLAG_KEY = "shakspace_demo_mode";

const DEMO_USER = {
  id: "demo-user",
  name: "Demo User",
  email: "demo@shakspace.app",
  roles: ["user"],
  avatarUrl: null,
};

function extractUser(res) {
  return res?.data?.data?.user ?? res?.data?.user ?? null;
}

function extractErrorMessages(err) {
  const data = err?.response?.data;
  return (
    data?.error?.details ??
    data?.errors ??
    data?.error?.message ??
    data?.message ??
    data?.error ??
    data ??
    "Request failed"
  );
}

function isDemoModeActive() {
  try {
    return window.localStorage.getItem(DEMO_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

function setDemoModeFlag(active) {
  try {
    if (active) {
      window.localStorage.setItem(DEMO_FLAG_KEY, "1");
    } else {
      window.localStorage.removeItem(DEMO_FLAG_KEY);
    }
  } catch {
    // localStorage unavailable (e.g. private browsing) — demo mode just won't persist across reloads.
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isDemo: false,
  authLoading: true,
  validationError: null,

  // Lets you explore the whole app without a real account or a working
  // MongoDB connection. Nothing here touches the backend at all.
  demoLogin: () => {
    setDemoModeFlag(true);
    set({
      user: DEMO_USER,
      isAuthenticated: true,
      isDemo: true,
      authLoading: false,
      validationError: null,
    });
    return DEMO_USER;
  },

  restoreSession: async () => {
    if (isDemoModeActive()) {
      set({
        user: DEMO_USER,
        isAuthenticated: true,
        isDemo: true,
        authLoading: false,
        validationError: null,
      });
      return DEMO_USER;
    }

    set({ authLoading: true, validationError: null });
    try {
      const res = await authService.me();
      const userProfile = extractUser(res);
      set({
        user: userProfile,
        isAuthenticated: Boolean(userProfile?.id || userProfile?.email),
        isDemo: false,
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
          isDemo: false,
          authLoading: false,
        });
        return userProfile;
      } catch {
        set({ user: null, isAuthenticated: false, isDemo: false, authLoading: false });
        return null;
      }
    }
  },

  login: async ({ email, password }) => {
    setDemoModeFlag(false);
    set({ authLoading: true, validationError: null });
    try {
      const res = await authService.login({ email, password });
      const userProfile = extractUser(res);
      set({
        user: userProfile,
        isAuthenticated: Boolean(userProfile?.id || userProfile?.email),
        isDemo: false,
        authLoading: false,
      });
      return userProfile;
    } catch (err) {
      set({
        validationError: extractErrorMessages(err),
        user: null,
        isAuthenticated: false,
        authLoading: false,
      });
      throw err;
    }
  },

  register: async ({ name, email, password }) => {
    setDemoModeFlag(false);
    set({ authLoading: true, validationError: null });
    try {
      const res = await authService.register({ name, email, password });
      const userProfile = extractUser(res);
      set({
        user: userProfile,
        isAuthenticated: Boolean(userProfile?.id || userProfile?.email),
        isDemo: false,
        authLoading: false,
      });
      return userProfile;
    } catch (err) {
      set({
        validationError: extractErrorMessages(err),
        user: null,
        isAuthenticated: false,
        authLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    const wasDemo = get().isDemo;
    setDemoModeFlag(false);

    if (wasDemo) {
      set({ user: null, isAuthenticated: false, isDemo: false, authLoading: false });
      return;
    }

    set({ authLoading: true, validationError: null });
    try {
      await authService.logout();
    } catch {
      // ignore; we still clear local state
    }
    set({ user: null, isAuthenticated: false, isDemo: false, authLoading: false });
  },
}));
