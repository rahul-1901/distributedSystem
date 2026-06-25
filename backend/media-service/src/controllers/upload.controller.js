import { uploadService } from "../services/uploadService/upload.service.instance.js";

export const uploadFile = async (req, res, next) => {
  try {
    const uploadedFile = await uploadService.uploadFile({
      file: req.file,
      resourceType: req.body.resourceType,
      hackathonId: req.body.hackathonId,
    });

    return res.status(200).json({
      success: true,
      file: uploadedFile,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "File key is required",
      });
    }

    await uploadService.deleteFile(key);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
