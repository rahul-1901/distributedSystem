import { ResultService } from "./result.service.js";

import { SubmissionRepository } from "../../repositories/submission.repository.js";

import { HackathonRepository } from "../../repositories/hackathon.repository.js";

const submissionRepository =
  new SubmissionRepository();

const hackathonRepository =
  new HackathonRepository();

export const resultService =
  new ResultService(
    submissionRepository,
    hackathonRepository
  );