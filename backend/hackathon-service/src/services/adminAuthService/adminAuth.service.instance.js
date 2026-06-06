import logger from "../../config/logger.js";
import { adminRepository } from "../../repositories/admin.repository.instance.js";
import { AdminAuthService } from "./adminAuth.service.js";

export const adminAuthService =
  new AdminAuthService(
    adminRepository,
    logger
  );