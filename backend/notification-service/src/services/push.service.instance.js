import { logger }
  from "../utils/logger.js";

import { PushService }
  from "./push.service.js";

import { pushSubscriptionRepository }
  from "../repositories/pushSubscription.repository.instance.js";

export const pushService =
  new PushService(
    pushSubscriptionRepository,
    logger
  );
