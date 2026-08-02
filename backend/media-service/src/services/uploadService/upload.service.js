import path from "path";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { BadRequestError } from "../../errors/BadRequestError.js";
import dotenv from "dotenv"
dotenv.config();

const BUCKET = process.env.AWS_S3_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_RESOURCE_TYPES = [
  "submission",
  "gallery",
  "resource",
  "avatar",
  "profile",
  "banner",
];

const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "jpg",
  "jpeg",
  "png",
  "mp4",
  "mpeg",
  "mov",
  "zip",
];

export class UploadService {
  constructor(getS3Client, logger) {
    this.getS3Client = getS3Client;
    this.logger = logger;
  }

  async uploadFile({ file, resourceType, hackathonId = null }) {
    if (!file) {
      throw new BadRequestError("File is required");
    }

    console.log({
      resourceType,
      allowed: ALLOWED_RESOURCE_TYPES,
  });

    if (!ALLOWED_RESOURCE_TYPES.includes(resourceType)) {
      throw new BadRequestError("Invalid resource type");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestError("File size exceeds 50MB limit");
    }

    const fileName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "");

    const extension = path.extname(fileName).slice(1).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      throw new BadRequestError(`.${extension} files are not supported`);
    }

    const timestamp = Date.now();

    const randomString = Math.random().toString(36).substring(2, 9);

    let key;

    if (hackathonId) {
      key =
        `hackathons/${hackathonId}/` +
        `${resourceType}/` +
        `${timestamp}-${randomString}-${fileName}`;
    } else {
      key = `${resourceType}/` + `${timestamp}-${randomString}-${fileName}`;
    }

    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.getS3Client().send(command);

      const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

      this.logger.info(
        {
          key,
          resourceType,
          hackathonId,
          size: file.size,
        },
        "File uploaded successfully"
      );

      return {
        url,
        key,
        originalName: file.originalname,
        format: extension,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        {
          err: error,
          key,
        },
        "S3 upload failed"
      );

      throw new BadRequestError("File upload failed");
    }
  }

  async deleteFile(key) {
    if (!key) {
      throw new BadRequestError("File key is required");
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      });

      await this.getS3Client().send(command);

      this.logger.info(
        {
          key,
        },
        "File deleted successfully"
      );

      return true;
    } catch (error) {
      this.logger.error(
        {
          err: error,
          key,
        },
        "S3 delete failed"
      );

      throw new BadRequestError("File deletion failed");
    }
  }
}
