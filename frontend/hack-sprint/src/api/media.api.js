import client from "./client";
import { API } from "./endpoints";

export const MediaAPI = {
  uploadFile(file, resourceType, hackathonId, onUploadProgress) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("resourceType", resourceType);
    if (hackathonId) formData.append("hackathonId", hackathonId);

    return client.post(API.MEDIA, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
  },

  delete(data) {
    return client.delete(API.MEDIA, {
      data,
    });
  },
};