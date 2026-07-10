import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  admin: null,
  isAuthenticated: false,
  loading: true,

  login(user) {
    set({
      user,
      isAuthenticated: true,
      loading: false,
    });
  },
  loginAdmin(admin) {
    set({
      admin,
      loading: false,
    });
  },
  logout() {
    set({
      user: null,
      admin: null,
      isAuthenticated: false,
      loading: false,
    });
  },

  finishLoading() {
    set({
      loading: false,
    });
  },
}));
