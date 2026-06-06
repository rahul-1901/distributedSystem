import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

export class VoteService {
  constructor(
    submissionVoteRepository,
    submissionRepository,
    registrationRepository,
    hackathonRepository,
    teamRepository,
    cacheService,
    logger
  ) {
    this.submissionVoteRepository = submissionVoteRepository;

    this.submissionRepository = submissionRepository;

    this.registrationRepository = registrationRepository;

    this.hackathonRepository = hackathonRepository;

    this.teamRepository = teamRepository;

    this.cacheService = cacheService;

    this.logger = logger;
  }

  async toggleVote({ submissionId, userId }) {
    const submission = await this.submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    const hackathon = await this.hackathonRepository.getById(
      submission.hackathon
    );

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    if (!hackathon.votingConfig?.enabled) {
      throw new ForbiddenError("Voting is disabled");
    }

    if (hackathon.votingConfig?.onlyParticipantsCanVote) {
      const registration =
        await this.registrationRepository.findByUserAndHackathon(
          userId,
          hackathon._id
        );

      if (!registration) {
        throw new ForbiddenError("Only registered participants can vote");
      }
    }

    if (!hackathon.votingConfig?.allowSelfVote) {
      if (
        submission.participant &&
        submission.participant.toString() === userId.toString()
      ) {
        throw new ForbiddenError("You cannot vote for your own submission");
      }

      if (submission.team) {
        const team = await this.teamRepository.findById(submission.team);

        const isMember =
          team.leader.toString() === userId.toString() ||
          team.members.some(
            (memberId) => memberId.toString() === userId.toString()
          );

        if (isMember) {
          throw new ForbiddenError("You cannot vote for your own submission");
        }
      }
    }

    const existingVote = await this.submissionVoteRepository.findVote(
      submissionId,
      userId
    );

    let voted = false;

    if (existingVote) {
      await this.submissionVoteRepository.deleteVote(existingVote._id);
    } else {
      await this.submissionVoteRepository.create({
        submission: submissionId,

        hackathon: hackathon._id,

        voter: userId,
      });

      voted = true;
    }

    const voteCount = await this.submissionVoteRepository.getVoteCount(
      submissionId
    );

    await this.submissionRepository.updateVoteCount(submissionId, voteCount);

    try {
      await this.cacheService.del(REDIS_KEYS.RESULTS(hackathon._id.toString()));
    } catch (error) {
      this.logger.error({ error }, "Failed to invalidate results cache");
    }

    this.logger.info(
      {
        submissionId,
        userId,
        voted,
      },
      "Submission vote toggled"
    );

    return {
      voted,
      voteCount,
    };
  }

  async getVotingSubmissions(hackathonId) {
    const hackathon = await this.hackathonRepository.getPhases(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    if (!hackathon.votingConfig?.enabled) {
      throw new ForbiddenError("Voting is disabled");
    }

    const finalPhase = hackathon.phases[hackathon.phases.length - 1];

    return this.submissionRepository.getVotingSubmissions(
      hackathonId,
      finalPhase._id
    );
  }

  async getVotingSubmissionById(submissionId) {
    const submission = await this.submissionRepository.getVotingSubmissionById(
      submissionId
    );

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    const hackathon = await this.hackathonRepository.getPhases(
      submission.hackathon
    );

    if (!hackathon.votingConfig?.enabled) {
      throw new ForbiddenError("Voting is disabled");
    }

    const finalPhase = hackathon.phases[hackathon.phases.length - 1];

    if (submission.phaseId.toString() !== finalPhase._id.toString()) {
      throw new ForbiddenError("Submission not available for voting");
    }

    return submission;
  }
}
