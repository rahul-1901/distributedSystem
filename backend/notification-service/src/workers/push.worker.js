import { Worker } from "bullmq";
import { pushService } from "../services/push.service.instance.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

export const pushWorker = new Worker(
  "push",
  async (job) => {
    const { userId, title, message, actionUrl } = job.data;
    await pushService.sendToUser(userId, { title, message, actionUrl });

    logger.info({ jobId: job.id, userId }, "Push job processed");
  },
  {
    connection: {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
    },

    concurrency: 10,
  }
);

pushWorker.on("failed", (job, err) => {
  logger.error(
    {
      jobId: job?.id,
      attemptsMade: job?.attemptsMade,
      userId: job?.data?.userId,
      err,
    },
    "Push job failed"
  );
});

pushWorker.on("error", (err) => {
  logger.error({ err }, "Push worker error");
});
