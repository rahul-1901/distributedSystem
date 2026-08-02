import client from "./client";
import { API } from "./endpoints";

export const AdminAuthAPI = {
  googleLogin(code) {
    return client.get(`${API.ADMIN_AUTH}/google`, { params: { code } });
  },
};
