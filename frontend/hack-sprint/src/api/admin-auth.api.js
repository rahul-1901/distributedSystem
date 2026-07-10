export const AdminAuthAPI = {
    googleLogin() {
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/admin-auth/google`;
    },
  };