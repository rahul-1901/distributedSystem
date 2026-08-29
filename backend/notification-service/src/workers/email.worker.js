import { Worker } from "bullmq";
import emailService from "../services/email.service.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";
import { Sentry } from "../config/sentry.js";

export const emailWorker = new Worker(
  "email",
  async (job) => {
    const { type, user, token, hackathon } = job.data;

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

      case "admin-welcome":
        await emailService.sendAdminWelcomeEmail(user);
        break;

      case "hackathon-approved":
        await emailService.sendHackathonApprovedEmail(user, hackathon);
        break;

      case "hackathon-rejected":
        await emailService.sendHackathonRejectedEmail(user, hackathon);
        break;

      case "registration-confirmation":
        await emailService.sendRegistrationConfirmationEmail(user, hackathon);
        break;

      case "submission-confirmation":
        await emailService.sendSubmissionConfirmationEmail(user, hackathon);
        break;

      case "results-announcement":
        await emailService.sendResultsAnnouncementEmail(user, hackathon);
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

  if (job && job.attemptsMade >= (job.opts?.attempts || 1)) {
    Sentry.captureException(err);
  }
});

emailWorker.on("error", (err) => {
  logger.error({ err }, "Email worker error");
});
