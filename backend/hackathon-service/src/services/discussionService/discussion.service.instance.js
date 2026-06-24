import { DiscussionRepository } from "../../repositories/discussion.repository.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { DiscussionService } from "./discussion.service.js";
import { logger } from "../../utils/logger.js";

export const discussionService =
  new DiscussionService(
    new DiscussionRepository(),
    new HackathonRepository(),
    logger
  );