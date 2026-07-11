import { useEffect } from "react";
import { ProfileAPI } from "../api";
import { useAuthStore } from "../store/authStore";

function AuthProvider({ children }) {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const finishLoading = useAuthStore((state) => state.finishLoading);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await ProfileAPI.getMyProfile();

        login(data.user, data.user?.role || "student");
      } catch (err) {
        logout();
      } finally {
        finishLoading();
      }
    };

    bootstrap();
  }, [login, logout, finishLoading]);

  return children;
}

export default AuthProvider;
