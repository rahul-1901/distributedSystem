import { useEffect } from "react";
import { ProfileAPI } from "../api";
import { useAuthStore } from "../store/authStore";

function AuthProvider({ children }) {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const finishLoading = useAuthStore((state) => state.finishLoading);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data } = await ProfileAPI.getMyProfile();
        login(data.user);
      } catch {
        logout();
      } finally {
        finishLoading();
      }
    }

    loadUser();
  }, []);

  return children;
}

export default AuthProvider;
