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
      // Uploads (up to 100MB) can easily exceed the client's default 10s
      // timeout — that would abort the request client-side while the
      // server keeps uploading to S3 and "succeeds" with no one listening.
      timeout: 5 * 60 * 1000,
    });
  },

  delete(data, asAdmin = false) {
    return client.delete(API.MEDIA, {
      data,
      adminRequest: asAdmin,
    });
  },
};