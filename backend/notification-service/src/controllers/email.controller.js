import { emailQueue } from "../queues/email.queue.js";
import { logger } from "../utils/logger.js";

const VALID_TYPES = [
  "verification",
  "welcome",
  "reset-password",
  "password-reset-success",
  "admin-welcome",
  "hackathon-approved",
  "hackathon-rejected",
  "registration-confirmation",
  "submission-confirmation",
  "results-announcement",
];

// Internal, service-to-service entry point for queuing a transactional
// email — mirrors createNotification's role for in-app notifications, but
// for email. Callers never touch BullMQ/Redis directly; they just describe
// what happened and this service handles templating, queueing, and Brevo.
export const sendEmail = async (req, res, next) => {
  try {
    const { type, user, token, hackathon } = req.body;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid email type: ${type}`,
      });
    }

    if (!user?.email) {
      return res.status(400).json({
        success: false,
        message: "user.email is required",
      });
    }

    const job = await emailQueue.add("send-email", { type, user, token, hackathon });

    logger.info({ jobId: job.id, type, email: user.email }, "Email job queued (internal)");

    return res.status(202).json({ success: true });
  } catch (error) {
    next(error);
  }
};
