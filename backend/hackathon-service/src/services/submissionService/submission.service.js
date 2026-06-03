import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { REDIS_KEYS } from "../../config/redisKeys.js";
import { validateSubmissionData } from "../../utils/validateSubmissionData.js";

export class SubmissionService {
  constructor(
    submissionRepository,
    hackathonRepository,
    teamRepository,
    registrationRepository,
    uploadService,
    cacheService,
    logger
  ) {
    this.submissionRepository = submissionRepository;
    this.hackathonRepository = hackathonRepository;
    this.teamRepository = teamRepository;
    this.registrationRepository = registrationRepository;
    this.uploadService = uploadService;
    this.cacheService = cacheService;
    this.logger = logger;
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

    if (!hackathon.showResult) {
      throw new ForbiddenError("Results are not public");
    }

    const cacheKey = REDIS_KEYS.RESULTS(hackathonId);

    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        this.logger.info({ hackathonId }, "Results cache hit");

        return cachedData;
      }
    } catch (error) {
      this.logger.error({ error }, "Redis read failed");
    }

    this.logger.info({ hackathonId }, "Results cache miss");

    const results = await this.submissionRepository.getTopResults(hackathonId);

    try {
      await this.cacheService.set(cacheKey, results, 86400);
    } catch (error) {
      this.logger.error({ error }, "Redis write failed");
    }

    return results;
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

    const currentTime = new Date();

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

    if (hackathon.participationType === "TEAM") {
      if (!registration.team) {
        throw new BadRequestError(
          "This hackathon requires team participation. Kindly join a team before submitting"
        );
      }

      const teamDoc = await this.teamRepository.findById(registration.team);

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
      submissionMap.set(submission.phaseId.toString(), submission);
    });

    const now = new Date();

    const phases = hackathon.phases.map((phase) => {
      const existing = submissionMap.get(phase._id.toString());

      let canSubmit = false;

      if (phase.submissionStartDate && phase.submissionEndDate) {
        canSubmit =
          now >= phase.submissionStartDate && now <= phase.submissionEndDate;
      }

      return {
        phaseId: phase._id,

        phaseName: phase.name,

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

    for (const key of Object.keys(oldSubmissionData)) {
      const oldValue = oldSubmissionData[key];

      const newValue = newSubmissionData[key];

      if (!oldValue || !newValue) {
        continue;
      }

      // Single file
      if (
        oldValue?.public_id &&
        newValue?.public_id &&
        oldValue.public_id !== newValue.public_id
      ) {
        await this.uploadService.deleteFile(oldValue.public_id);
      }

      // Multiple files
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        const newPublicIds = new Set(
          newValue
            .filter((file) => file?.public_id)
            .map((file) => file.public_id)
        );

        for (const file of oldValue) {
          if (file?.public_id && !newPublicIds.has(file.public_id)) {
            await this.uploadService.deleteFile(file.public_id);
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

    if (submission.phaseId.toString() !== activePhase._id.toString()) {
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

    const submission = await this.submissionRepository.getSubmissionById(
      submissionId
    );

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    // Individual submission
    if (submission.participant) {
      if (submission.participant._id.toString() !== userId.toString()) {
        throw new ForbiddenError("Access denied");
      }

      return submission;
    }

    // Team submission
    if (submission.team) {
      const team = await this.teamRepository.findById(submission.team._id);

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

      return submission;
    }

    throw new ForbiddenError("Access denied");
  }
}
