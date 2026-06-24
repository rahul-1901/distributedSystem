import { logger } from "../../utils/logger.js";
import { adminRepository } from "../../repositories/admin.repository.instance.js";
import { AdminService } from "./admin.service.js";

export const adminService =
  new AdminService(
    adminRepository,
    logger
  );