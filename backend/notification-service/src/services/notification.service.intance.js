import { logger }
  from "../utils/logger.js";

import { NotificationService }
  from "./notification.service.js";

import { notificationRepository }
  from "../repositories/notification.repository.instance.js";

export const notificationService =
  new NotificationService(
    notificationRepository,
    logger
  );