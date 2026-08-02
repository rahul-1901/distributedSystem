import { getS3Client } from "../../config/aws.js";
import { logger } from "../../utils/logger.js";
import { UploadService } from "./upload.service.js";

export const uploadService =
  new UploadService(
    getS3Client,
    logger
  );