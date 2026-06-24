import { Worker } from "bullmq";
import emailService from "../services/email.service.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

export const emailWorker = new Worker(
  "email",
  async (job) => {
    const { type, user, token } = job.data;

    switch (type) {
      case "verification":
        await emailService.sendVerificationEmail(user, token);
        break;

      case "welcome":
        await emailService.sendWelcomeEmail(user);
        break;

      case "reset-password":
        await emailService.sendResetPasswordEmail(user, token);
        break;

      case "password-reset-success":
        await emailService.sendPasswordResetSuccessEmail(user);
        break;

      default:
        throw new Error(`Unknown email job type: ${type}`);
    }

    logger.info(
      {
        jobId: job.id,
        type,
        email: user.email,
      },
      "Email processed successfully"
    );
  },
  {
    connection: {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
    },

    concurrency: 5,
  }
);

emailWorker.on("completed", (job) => {
  logger.info(
    {
      jobId: job.id,
    },
    "Email job completed"
  );
});

emailWorker.on("failed", (job, err) => {
  logger.error(
    {
      jobId: job?.id,
      attemptsMade: job?.attemptsMade,
      type: job?.data?.type,
      email: job?.data?.user?.email,
      err,
    },
    "Email job failed"
  );
});

emailWorker.on("error", (err) => {
  logger.error({ err }, "Email worker error");
});
