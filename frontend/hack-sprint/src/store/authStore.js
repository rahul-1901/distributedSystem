import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  loading: true,
  isAuthenticated: false,

  login: (user, role = "student") =>
    set({
      user,
      role,
      isAuthenticated: true,
      loading: false,
    }),

  logout: () =>
    set({
      user: null,
      role: null,
      isAuthenticated: false,
      loading: false,
    }),

  finishLoading: () =>
    set({
      loading: false,
    }),
}));
