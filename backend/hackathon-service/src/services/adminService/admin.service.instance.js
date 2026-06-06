import logger from "../../config/logger.js";
import { adminRepository } from "../../repositories/admin.repository.instance.js";
import { AdminService } from "./admin.service.js";

export const adminService =
  new AdminService(
    adminRepository,
    logger
  );