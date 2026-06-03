import { uploadService }
  from "../services/uploadService/upload.service.instance.js";

export const uploadFile =
  async (
    req,
    res,
    next
  ) => {
    try {
      const file =
        await uploadService.uploadFile({
          file: req.file,

          resourceType:
            req.body.resourceType,

          hackathonId:
            req.body.hackathonId,
        });

      return res
        .status(200)
        .json({
          success: true,
          file,
        });
    } catch (error) {
      next(error);
    }
  };