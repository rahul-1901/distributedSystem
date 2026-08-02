import client from "./client";
import { API } from "./endpoints";

export const MediaAPI = {
  uploadFile(file, resourceType, hackathonId, onUploadProgress, asAdmin = false) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("resourceType", resourceType);
    if (hackathonId) formData.append("hackathonId", hackathonId);

    return client.post(API.MEDIA, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
      adminRequest: asAdmin,
    });
  },

  delete(data, asAdmin = false) {
    return client.delete(API.MEDIA, {
      data,
      adminRequest: asAdmin,
    });
  },
};