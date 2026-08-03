import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const loading = useAuthStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const logoutAndClear = useAuthStore((state) => state.logoutAndClear);
  const finishLoading = useAuthStore((state) => state.finishLoading);

  return { user, role, loading, isAuthenticated, login, logout, logoutAndClear, finishLoading };
}