import { logger } from "../../utils/logger.js";
import { UserRepository } from "../../repositories/user.repository.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { WishlistService } from "./wishlist.service.js";

const userRepository = new UserRepository();

const hackathonRepository = new HackathonRepository();

export const wishlistService = new WishlistService(
  userRepository,
  hackathonRepository,
  logger
);
