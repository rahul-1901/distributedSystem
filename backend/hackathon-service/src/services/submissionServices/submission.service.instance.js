import { logger } from "../../utils/logger.js";
import { SubmissionRepository } from "../../repositories/submission.repository.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { SubmissionService } from "./submission.service.js";
import { cacheService } from "../cacheService/cache.service.instance.js";

const submissionRepository =
  new SubmissionRepository();

const hackathonRepository =
  new HackathonRepository();

export const submissionService =
  new SubmissionService(
    submissionRepository,
    hackathonRepository,
    cacheService,
    logger
  );