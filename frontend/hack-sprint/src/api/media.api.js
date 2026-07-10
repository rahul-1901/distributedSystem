import client from "./client";
import { API } from "./endpoints";

export const MediaAPI = {
  upload(file) {
    const formData = new FormData();

    formData.append("file", file);

    return client.post(
      API.MEDIA,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  delete(data) {
    return client.delete(API.MEDIA, {
      data,
    });
  },
};