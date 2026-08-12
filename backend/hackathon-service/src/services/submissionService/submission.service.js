import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { calculateFinalScore } from "../../utils/scoreCalculator.js";
import { getLifecycleStatus } from "../../utils/lifecycleStatus.js";
import { validateSubmissionData } from "../../utils/validateSubmissionData.js";
import { getNowUTC } from "../../utils/dateUtils.js";

export class SubmissionService {
  constructor(
    submissionRepository,
    hackathonRepository,
    teamRepository,
    registrationRepository,
    mediaServiceClient,
    cacheService,
    notificationClient,
    logger,
    submissionReviewRepository
  ) {
    this.submissionRepository = submissionRepository;
    this.hackathonRepository = hackathonRepository;
    this.teamRepository = teamRepository;
    this.registrationRepository = registrationRepository;
    this.mediaServiceClient = mediaServiceClient,
    this.cacheService = cacheService;
    this.notificationClient = notificationClient,
    this.logger = logger;
    this.submissionReviewRepository = submissionReviewRepository;
  }

  async getHackathonResults(hackathonId) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid hackathon id");
    }

    const hackathon = await this.hackathonRepository.getResultVisibility(
      hackathonId
    );

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    if (getLifecycleStatus(hackathon) !== "COMPLETED") {
      throw new ForbiddenError("Results are not available yet");
    }

    if (!hackathon.showResult) {
      throw new ForbiddenError("Results are not public");
    }

    const submissionPhases = hackathon.phases.filter(
      (phase) => phase.phaseType === "SUBMISSION"
    );

    const finalPhase = submissionPhases[submissionPhases.length - 1];

    if (!finalPhase) {
      throw new BadRequestError("No submission phase configured");
    }

    const submissions =
      await this.submissionRepository.getLeaderboardSubmissions(
        hackathonId,
        finalPhase._id
      );

    const maxVoteCount = submissions.length
      ? Math.max(...submissions.map((submission) => submission.voteCount || 0))
      : 0;

    const voteWeight = hackathon.votingConfig?.voteWeight || 0;

    const maxJudgeScore = hackathon.judgingConfig?.maxScore || 100;

    const leaderboard = submissions.map((submission) => {
      const finalScore = calculateFinalScore({
        averageScore: submission.averageScore,

        voteCount: submission.voteCount,

        maxVoteCount,

        voteWeight,

        maxJudgeScore,
      });

      return {
        ...submission,

        finalScore,
      };
    });

    leaderboard.sort((a, b) => b.finalScore - a.finalScore);

    if (hackathon.publicLeaderboardLimit) {
      return leaderboard.slice(0, hackathon.publicLeaderboardLimit);
    }

    return leaderboard;
  }

  async createSubmission({
    userId,
    hackathonId,
    title,
    description,
    submissionData,
  }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid hackathon id");
    }

    if (!title?.trim()) {
      throw new BadRequestError("Submission title is required.");
    }

    if (!description?.trim()) {
      throw new BadRequestError("Provide a description for your submission.");
    }

    if (!submissionData || typeof submissionData !== "object") {
      throw new BadRequestError("Submission data is required.");
    }

    const currentTime = getNowUTC();

    const hackathon = await this.hackathonRepository.getActiveSubmissionPhase(
      hackathonId,
      currentTime
    );

    if (!hackathon) {
      throw new BadRequestError(
        "Seems like there is no active submission phase for this hackathon"
      );
    }

    const activePhase = hackathon.phases[0];

    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        hackathonId
      );

    if (!registration) {
      throw new BadRequestError(
        "Kindly register for the hackathon before submitting"
      );
    }

    validateSubmissionData(submissionData, activePhase.submissionForm);

    let participant = null;
    let team = null;
    let teamDoc = null;

    if (hackathon.participationType === "TEAM") {
      if (!registration.team) {
        throw new BadRequestError(
          "This hackathon requires team participation. Kindly join a team before submitting"
        );
      }

      teamDoc = await this.teamRepository.findById(registration.team);

      if (!teamDoc) {
        throw new NotFoundError(
          "Seems like your team details are missing. Kindly contact support"
        );
      }

      if (teamDoc.leader.toString() !== userId.toString()) {
        throw new ForbiddenError(
          "Submission can only be made by the team leader"
        );
      }

      const existingSubmission =
        await this.submissionRepository.findByTeamAndPhase(
          teamDoc._id,
          hackathonId,
          activePhase._id
        );

      if (existingSubmission) {
        throw new BadRequestError("Submission already exists for this phase");
      }

      team = teamDoc._id;
    } else {
      const existingSubmission =
        await this.submissionRepository.findByParticipantAndPhase(
          userId,
          hackathonId,
          activePhase._id
        );

      if (existingSubmission) {
        throw new BadRequestError("Submission already exists for this phase");
      }

      participant = userId;
    }

    try {
      const submission = await this.submissionRepository.create({
        participant,
        team,
        hackathon: hackathonId,
        phaseId: activePhase._id,
        title: title.trim(),
        description: description.trim(),
        submissionData,
      });

      let usersToNotify = [];

      if (hackathon.participationType === "TEAM") {
        usersToNotify = [teamDoc.leader, ...teamDoc.members];
      } else {
        usersToNotify = [userId];
      }

      for (const memberId of usersToNotify) {
        await this.notificationClient.createNotification({
          userId: memberId,
          title: "Submission Successful",
          message:
            hackathon.participationType === "TEAM"
              ? `${teamDoc.name} submitted successfully for ${hackathon.title}.`
              : `Your submission for ${hackathon.title} has been received.`,
          type: "SUBMISSION",
          actionUrl: `/submissions/${submission._id}`,
          metadata: {
            submissionId: submission._id.toString(),
            hackathonId: hackathon._id.toString(),
          },
        });
      }

      this.logger.info(
        {
          submissionId: submission._id,
          hackathonId,
          phaseId: activePhase._id,
          userId,
        },
        "Submission created"
      );

      return {
        success: true,
        message: "Submission created successfully",
        submission,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestError("Submission already exists for this phase");
      }

      throw error;
    }
  }

  async getMySubmissions(userId, hackathonId) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid hackathon id");
    }

    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        hackathonId
      );

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    const hackathon = await this.hackathonRepository.getPhases(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    let submissions;

    if (hackathon.participationType === "TEAM") {
      if (!registration.team) {
        throw new NotFoundError("Team not found");
      }

      submissions = await this.submissionRepository.getMyTeamSubmissions(
        registration.team,
        hackathonId
      );
    } else {
      submissions = await this.submissionRepository.getMyIndividualSubmissions(
        userId,
        hackathonId
      );
    }

    const submissionMap = new Map();

    submissions.forEach((submission) => {
      if (!submission.phaseId) return;
      submissionMap.set(submission.phaseId.toString(), submission);
    });

    const now = new Date();

    const phases = hackathon.phases
      .filter((phase) => phase?._id && phase.phaseType === "SUBMISSION")
      .map((phase) => {
        const existing = submissionMap.get(phase._id.toString());

        let canSubmit = false;

        if (phase.phaseType === "SUBMISSION" && phase.isActive) {
          canSubmit = now >= phase.startDate && now <= phase.endDate;
        }

        return {
          phaseId: phase._id,
          phaseName: phase.phaseName,
          phaseType: phase.phaseType,
          submitted: !!existing,
          submissionId: existing?._id || null,
          submittedAt: existing?.submittedAt || null,
          canSubmit,
        };
      });

    return {
      phases,
    };
  }

  async deleteReplacedFiles(oldSubmissionData, newSubmissionData) {
    if (!oldSubmissionData || !newSubmissionData) {
      return;
    }

    for (const field of Object.keys(oldSubmissionData)) {
      const oldValue = oldSubmissionData[field];

      const newValue = newSubmissionData[field];

      if (!oldValue || !newValue) {
        continue;
      }

      if (oldValue?.key && newValue?.key && oldValue.key !== newValue.key) {
        await this.mediaServiceClient.deleteFile(oldValue.key);
      }

      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        const newKeys = new Set(
          newValue.filter((f) => f?.key).map((f) => f.key)
        );

        for (const file of oldValue) {
          if (file?.key && !newKeys.has(file.key)) {
            await this.mediaServiceClient.deleteFile(file.key);
          }
        }
      }
    }
  }

  async updateSubmission({
    userId,
    hackathonId,
    submissionId,
    title,
    description,
    submissionData,
  }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid hackathon id");
    }

    const submission = await this.submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    if (submission.hackathon.toString() !== hackathonId) {
      throw new ForbiddenError("Unauthorized");
    }

    const currentTime = new Date();

    const hackathon = await this.hackathonRepository.getActiveSubmissionPhase(
      hackathonId,
      currentTime
    );

    if (!hackathon) {
      throw new ForbiddenError("Submission phase is closed");
    }

    const activePhase = hackathon.phases[0];

    if (String(submission.phaseId) !== String(activePhase?._id)) {
      throw new ForbiddenError("Submission phase is closed");
    }

    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        hackathonId
      );

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    if (hackathon.participationType === "TEAM") {
      const team = await this.teamRepository.findById(registration.team);

      if (!team) {
        throw new NotFoundError("Team not found");
      }

      if (team.leader.toString() !== userId.toString()) {
        throw new ForbiddenError("Only team leader can update submission");
      }

      if (submission.team.toString() !== team._id.toString()) {
        throw new ForbiddenError("Unauthorized");
      }
    } else {
      if (submission.participant.toString() !== userId.toString()) {
        throw new ForbiddenError("Unauthorized");
      }
    }

    if (!title?.trim()) {
      throw new BadRequestError("Title is required");
    }

    if (!description?.trim()) {
      throw new BadRequestError("Description is required");
    }

    if (!submissionData || typeof submissionData !== "object") {
      throw new BadRequestError("Submission data is required");
    }

    validateSubmissionData(submissionData, activePhase.submissionForm);

    await this.deleteReplacedFiles(submission.submissionData, submissionData);

    const updatedSubmission = await this.submissionRepository.update(
      submissionId,
      {
        title: title.trim(),

        description: description.trim(),

        submissionData,
      }
    );

    this.logger.info(
      {
        submissionId,
        userId,
        hackathonId,
      },
      "Submission updated"
    );

    return {
      success: true,
      message: "Submission updated successfully",
      submission: updatedSubmission,
    };
  }

  async getSubmissionById(submissionId, userId) {
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      throw new BadRequestError("Invalid submission id");
    }

    const submissionDoc = await this.submissionRepository.getSubmissionById(
      submissionId
    );

    if (!submissionDoc) {
      throw new NotFoundError("Submission not found");
    }

    // Individual submission
    if (submissionDoc.participant) {
      if (submissionDoc.participant._id.toString() !== userId.toString()) {
        throw new ForbiddenError("Access denied");
      }
    } else if (submissionDoc.team) {
      // Team submission
      const team = await this.teamRepository.findById(submissionDoc.team._id);

      if (!team) {
        throw new NotFoundError("Team not found");
      }

      const isLeader = team.leader.toString() === userId.toString();

      const isMember = team.members.some(
        (memberId) => memberId.toString() === userId.toString()
      );

      if (!isLeader && !isMember) {
        throw new ForbiddenError("Access denied");
      }
    } else {
      throw new ForbiddenError("Access denied");
    }

    const submission = submissionDoc.toObject();

    // Score/feedback only ever leaves this endpoint once the organizer has
    // explicitly released results (same double-gate as the public results
    // leaderboard: hackathon actually over, and showResult on). Without
    // this, a participant could see their score the moment a single judge
    // finishes reviewing — while the hackathon is still active and other
    // judges haven't scored yet — which is exactly the premature,
    // inconsistent disclosure this gate exists to prevent.
    const hackathonId = submission.hackathon?._id || submission.hackathon;
    const hackathon = await this.hackathonRepository.getResultVisibility(
      hackathonId
    );
    const resultsReleased =
      !!hackathon &&
      getLifecycleStatus(hackathon) === "COMPLETED" &&
      !!hackathon.showResult;

    if (resultsReleased) {
      submission.reviews =
        await this.submissionReviewRepository.getPublicReviewsForSubmission(
          submissionId
        );
    } else {
      delete submission.averageScore;
      delete submission.reviewCount;
      delete submission.resultStatus;
      delete submission.hackathonPoints;
      submission.reviews = [];
    }

    return submission;
  }
}
