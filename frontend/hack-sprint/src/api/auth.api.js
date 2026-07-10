import client from "./client";
import { API } from "./endpoints";

export const AuthAPI = {
  signup(data) {
    return client.post(`${API.AUTH}/signup`, data);
  },
  login(data) {
    return client.post(`${API.AUTH}/login`, data);
  },
  googleLogin() {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}${API.AUTH}/google`;
  },
  verifyEmail(token) {
    return client.get(`${API.AUTH}/verify-email?token=${token}`);
  },
  sendResetLink(data) {
    return client.post(`${API.AUTH}/send-reset-link`, data);
  },
  resetPassword(data) {
    return client.post(`${API.AUTH}/reset-password`, data);
  },
};