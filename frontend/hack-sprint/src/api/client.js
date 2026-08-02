import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const isAdminRequest = config.adminRequest || config.url?.includes("/admin");
  const token = localStorage.getItem(isAdminRequest ? "adminToken" : "token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminRequest =
        error.config?.adminRequest || error.config?.url?.includes("/admin");
      localStorage.removeItem(isAdminRequest ? "adminToken" : "token");
    }
    return Promise.reject(error);
  }
);

export default client;
