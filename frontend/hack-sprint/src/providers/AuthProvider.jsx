import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { ProfileAPI } from "../api/profile.api.js";

export default function AuthProvider({ children }) {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        logout();
        return;
      }

      try {
        const res = await ProfileAPI.getMyProfile();
        const profile = res.data.profile;
        login(profile, profile.role || "student");
      } catch (err) {
        localStorage.removeItem("token");
        logout();
      }
    };

    bootstrap();
  }, [login, logout]);

  return children;
}
