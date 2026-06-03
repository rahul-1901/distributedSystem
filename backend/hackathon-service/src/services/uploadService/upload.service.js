import path from "path";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { BadRequestError } from "../../errors/BadRequestError.js";

const ALLOWED_RESOURCE_TYPES = ["submission", "gallery", "resource", "avatar"];

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
  constructor(s3Client, logger) {
    this.s3Client = s3Client;
    this.logger = logger;
  }

  async uploadFile({ file, resourceType, hackathonId = null }) {
    if (!file) {
      throw new BadRequestError("File is required");
    }

    if (!ALLOWED_RESOURCE_TYPES.includes(resourceType)) {
      throw new BadRequestError("Invalid resource type");
    }

    const extension = path.extname(file.originalname).slice(1).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      throw new BadRequestError(`.${extension} files are not supported`);
    }

    const timestamp = Date.now();

    const randomString = Math.random().toString(36).substring(2, 9);

    let key;

    if (hackathonId) {
      key = `hackathons/${hackathonId}/${resourceType}/${timestamp}-${randomString}-${file.originalname}`;
    } else {
      key = `${resourceType}/${timestamp}-${randomString}-${file.originalname}`;
    }

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,

        Key: key,

        Body: file.buffer,

        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      this.logger.info(
        {
          key,
          resourceType,
          hackathonId,
        },
        "File uploaded successfully"
      );

      return {
        url,
        public_id: key,
        format: extension,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        {
          error,
          key,
        },
        "S3 upload failed"
      );

      throw new BadRequestError("File upload failed");
    }
  }

  async deleteFile(publicId) {
    if (!publicId) {
      throw new BadRequestError("Public id is required");
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,

        Key: publicId,
      });

      await this.s3Client.send(command);

      this.logger.info(
        {
          publicId,
        },
        "File deleted successfully"
      );

      return true;
    } catch (error) {
      this.logger.error(
        {
          error,
          publicId,
        },
        "S3 delete failed"
      );

      throw new BadRequestError("File deletion failed");
    }
  }
}
