import cron from "node-cron";
import { logger } from "../utils/logger.js";
import { HackathonRepository } from "../repositories/hackathon.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { RegistrationRepository } from "../repositories/registration.repository.js";
import { TeamRepository } from "../repositories/team.repository.js";
import { SubmissionRepository } from "../repositories/submission.repository.js";
import { NotificationClient } from "../clients/notification.client.js";

const hackathonRepository = new HackathonRepository();
const userRepository = new UserRepository();
const registrationRepository = new RegistrationRepository();
const teamRepository = new TeamRepository();
const submissionRepository = new SubmissionRepository();
const notificationClient = new NotificationClient(logger);

const REMINDER_WINDOW_HOURS = 24;

const notifyRegistrationEndingSoon = async (hackathon, phase) => {
  const [wishlisters, participants] = await Promise.all([
    userRepository.getWishlistedUserIds(hackathon._id),
    registrationRepository.getParticipants(hackathon._id),
  ]);

  const registeredIds = new Set(
    participants.map((p) => p.user._id.toString())
  );

  const recipients = wishlisters.filter(
    (u) => !registeredIds.has(u._id.toString())
  );

  await Promise.all(
    recipients.map((u) =>
      notificationClient.createNotification({
        userId: u._id,
        title: "Registration Closing Soon",
        message: `Registration for ${hackathon.title} closes soon. Don't miss out!`,
        type: "HACKATHON",
        actionUrl: `/hackathon/${hackathon.slug}`,
        metadata: { hackathonId: hackathon._id.toString(), phaseId: phase._id.toString() },
      })
    )
  );

  return recipients.length;
};

const notifySubmissionEndingSoon = async (hackathon, phase) => {
  const submissions = await submissionRepository.getSubmissionsByPhase(
    hackathon._id,
    phase._id
  );

  let recipientIds = [];

  if (hackathon.participationType === "TEAM") {
    const teams = await teamRepository.getTeamsByHackathon(hackathon._id);

    const submittedTeamIds = new Set(
      submissions.filter((s) => s.team).map((s) => s.team._id.toString())
    );

    const pendingTeams = teams.filter(
      (t) => !submittedTeamIds.has(t._id.toString())
    );

    recipientIds = pendingTeams.flatMap((t) => [
      t.leader._id,
      ...t.members.map((m) => m._id),
    ]);
  } else {
    const participants = await registrationRepository.getParticipants(
      hackathon._id
    );

    const submittedParticipantIds = new Set(
      submissions
        .filter((s) => s.participant)
        .map((s) => s.participant._id.toString())
    );

    recipientIds = participants
      .filter((p) => !submittedParticipantIds.has(p.user._id.toString()))
      .map((p) => p.user._id);
  }

  await Promise.all(
    recipientIds.map((userId) =>
      notificationClient.createNotification({
        userId,
        title: "Submission Deadline Approaching",
        message: `The submission window for ${hackathon.title} closes soon.`,
        type: "SUBMISSION",
        actionUrl: `/hackathon/${hackathon.slug}`,
        metadata: { hackathonId: hackathon._id.toString(), phaseId: phase._id.toString() },
      })
    )
  );

  return recipientIds.length;
};

export const runPhaseReminderSweep = async () => {
  const hackathons = await hackathonRepository.getPhasesEndingSoon(
    REMINDER_WINDOW_HOURS
  );

  for (const hackathon of hackathons) {
    const phase = hackathon.phases?.[0];

    if (!phase) continue;

    try {
      const notified =
        phase.phaseType === "REGISTRATION"
          ? await notifyRegistrationEndingSoon(hackathon, phase)
          : await notifySubmissionEndingSoon(hackathon, phase);

      await hackathonRepository.markPhaseReminderSent(hackathon._id, phase._id);

      logger.info(
        {
          hackathonId: hackathon._id,
          phaseId: phase._id,
          phaseType: phase.phaseType,
          notified,
        },
        "Phase-ending reminder sent"
      );
    } catch (error) {
      logger.error(
        { err: error, hackathonId: hackathon._id, phaseId: phase._id },
        "Failed to process phase-ending reminder"
      );
    }
  }
};

export const startPhaseReminderJob = () => {
  cron.schedule("0 * * * *", () => {
    runPhaseReminderSweep().catch((error) => {
      logger.error({ err: error }, "Phase reminder sweep failed");
    });
  });

  logger.info("Phase reminder job scheduled (hourly)");
};
