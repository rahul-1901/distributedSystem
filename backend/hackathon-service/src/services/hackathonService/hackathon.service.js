import mongoose from "mongoose";
import { getNowUTC } from "../../utils/dateUtils.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { REDIS_KEYS } from "../../config/redisKeys.js";

export class HackathonService {
  constructor(
    hackathonRepository,
    submissionRepository,
    registrationRepository,
    adminRepository,
    logger,
    cacheService
  ) {
    this.hackathonRepository = hackathonRepository;
    this.submissionRepository = submissionRepository;
    this.registrationRepository = registrationRepository;
    this.adminRepository = adminRepository;
    this.logger = logger;
    this.cacheService = cacheService;
  }

  async getActiveHackathons() {
    const cacheKey = REDIS_KEYS.ACTIVE_HACKATHONS;

    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        this.logger?.info("Active hackathons cache hit");

        return cachedData;
      }
    } catch (error) {
      this.logger?.warn({ error }, "Redis read failed");
    }

    this.logger?.info("Active hackathons cache miss");

    const now = getNowUTC();

    const hackathons = await this.hackathonRepository.getActiveHackathons(now);

    try {
      await this.cacheService.set(cacheKey, hackathons, 300);
    } catch (error) {
      this.logger?.warn({ error }, "Redis write failed");
    }

    return hackathons;
  }

  async getExpiredHackathons() {
    const cacheKey = REDIS_KEYS.EXPIRED_HACKATHONS;

    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        this.logger.info("Expired hackathons cache hit");

        return cachedData;
      }
    } catch (error) {
      this.logger.error({ error }, "Redis read failed");
    }

    this.logger.info("Expired hackathons cache miss");

    const now = getNowUTC();

    const hackathons = await this.hackathonRepository.getExpiredHackathons(now);

    try {
      await this.cacheService.set(cacheKey, hackathons, 86400);
    } catch (error) {
      this.logger.error({ error }, "Redis write failed");
    }

    return hackathons;
  }

  async getUpcomingHackathons() {
    const cacheKey = REDIS_KEYS.UPCOMING_HACKATHONS;

    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        this.logger.info("Upcoming hackathons cache hit");

        return cachedData;
      }
    } catch (error) {
      this.logger.error({ error }, "Redis read failed");
    }

    this.logger.info("Upcoming hackathons cache miss");

    const now = getNowUTC();

    const hackathons = await this.hackathonRepository.getUpcomingHackathons(
      now
    );

    try {
      await this.cacheService.set(cacheKey, hackathons, 600);
    } catch (error) {
      this.logger.error({ error }, "Redis write failed");
    }

    return hackathons;
  }

  async getHackathonById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid hackathon id");
    }

    const cacheKey = REDIS_KEYS.HACKATHON(id);

    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        this.logger.info({ hackathonId: id }, "Hackathon cache hit");

        return cachedData;
      }
    } catch (error) {
      this.logger.error({ error }, "Redis read failed");
    }

    this.logger.info({ hackathonId: id }, "Hackathon cache miss");

    const hackathon = await this.hackathonRepository.getById(id);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    try {
      await this.cacheService.set(cacheKey, hackathon, 300);
    } catch (error) {
      this.logger.error({ error }, "Redis write failed");
    }

    return hackathon;
  }

  async getHackathonGallery(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid hackathon id");
    }

    const hackathon = await this.hackathonRepository.getGallery(id);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    return hackathon.gallery || [];
  }

  async invalidatePublicCaches(hackathonId) {
    try {
      await this.cacheService.delMany([
        ...PUBLIC_HACKATHON_KEYS,
        REDIS_KEYS.HACKATHON(hackathonId),
      ]);

      this.logger.info(
        {
          hackathonId,
        },
        "Hackathon cache invalidated"
      );
    } catch (error) {
      this.logger.error({ error }, "Cache invalidation failed");
    }
  }

  async createHackathon({ adminId, payload }) {
    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    if (!admin.profileCompleted) {
      throw new ForbiddenError("Complete profile first");
    }

    if (!admin.isVerified || admin.verificationStatus !== "APPROVED") {
      throw new ForbiddenError("Organizer verification required");
    }

    const existingHackathon = await this.hackathonRepository.findByTitle(
      payload.title
    );

    if (existingHackathon) {
      throw new BadRequestError("Hackathon title already exists");
    }

    if (payload.participationType === "TEAM" && payload.maxTeamSize < 2) {
      throw new BadRequestError("Team hackathon must have maxTeamSize >= 2");
    }

    if (!payload.phases || payload.phases.length === 0) {
      throw new BadRequestError("At least one phase is required");
    }

    const hackathon = await this.hackathonRepository.create({
      ...payload,

      createdBy: adminId,

      status: "DRAFT",
    });

    return hackathon;
  }

  async getMyHackathons(adminId) {
    return this.hackathonRepository.findByCreator(adminId);
  }

  async updateHackathon({ hackathonId, adminId, payload }) {
    const hackathon = await this.hackathonRepository.findById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    if (hackathon.createdBy.toString() !== adminId.toString()) {
      throw new ForbiddenError("Not your hackathon");
    }

    if (hackathon.status !== "DRAFT" && hackathon.status !== "REJECTED") {
      throw new ForbiddenError(
        "Only draft or rejected hackathons can be edited"
      );
    }

    if (payload.participationType === "TEAM" && payload.maxTeamSize < 2) {
      throw new BadRequestError("Team hackathon must have maxTeamSize >= 2");
    }

    if (payload.phases && payload.phases.length === 0) {
      throw new BadRequestError("At least one phase is required");
    }

    return this.hackathonRepository.update(hackathonId, payload);
  }

  async updateHackathon({ hackathonId, adminId, payload }) {
    const hackathon = await this.hackathonRepository.findById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    if (hackathon.createdBy.toString() !== adminId.toString()) {
      throw new ForbiddenError("Not your hackathon");
    }

    if (hackathon.status === "COMPLETED") {
      throw new ForbiddenError("Completed hackathons cannot be edited");
    }

    const [registrationCount, submissionCount] = await Promise.all([
      this.registrationRepository.countByHackathon(hackathonId),

      this.submissionRepository.countByHackathon(hackathonId),
    ]);

    /**
     * Registration lock
     */

    if (registrationCount > 0) {
      if (
        payload.registrationForm ||
        payload.participationType ||
        payload.maxTeamSize
      ) {
        throw new ForbiddenError(
          "Registration settings cannot be modified after participants have registered"
        );
      }
    }

    /**
     * Submission lock
     */

    if (submissionCount > 0) {
      if (payload.phases || payload.judgingConfig || payload.votingConfig) {
        throw new ForbiddenError(
          "Submission workflow cannot be modified after submissions exist"
        );
      }
    }

    /**
     * Team validation
     */

    if (payload.participationType === "TEAM" && payload.maxTeamSize < 2) {
      throw new BadRequestError("Team hackathon must have maxTeamSize >= 2");
    }

    /**
     * Phase validation
     */

    if (payload.phases && payload.phases.length === 0) {
      throw new BadRequestError("At least one phase is required");
    }

    const updated = await this.hackathonRepository.update(hackathonId, payload);

    this.logger.info(
      {
        hackathonId,
        adminId,
      },
      "Hackathon updated"
    );

    return updated;
  }

  async submitForApproval({ hackathonId, adminId }) {
    const hackathon = await this.hackathonRepository.findById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    if (hackathon.createdBy.toString() !== adminId.toString()) {
      throw new ForbiddenError("Not your hackathon");
    }

    if (hackathon.status === "PENDING_APPROVAL") {
      throw new BadRequestError("Already submitted for approval");
    }

    if (hackathon.status === "COMPLETED") {
      throw new ForbiddenError("Completed hackathon cannot be submitted");
    }

    /**
     * Required validations
     */

    if (!hackathon.title?.trim()) {
      throw new BadRequestError("Title is required");
    }

    if (!hackathon.description?.trim()) {
      throw new BadRequestError("Description is required");
    }

    if (!hackathon.image) {
      throw new BadRequestError("Hackathon image is required");
    }

    if (!hackathon.phases || hackathon.phases.length === 0) {
      throw new BadRequestError("At least one phase is required");
    }

    if (
      !hackathon.registrationForm ||
      hackathon.registrationForm.length === 0
    ) {
      throw new BadRequestError("Registration form is required");
    }

    if (hackathon.participationType === "TEAM" && hackathon.maxTeamSize < 2) {
      throw new BadRequestError("Invalid team size");
    }

    const updated = await this.hackathonRepository.updateStatus(
      hackathonId,
      "PENDING_APPROVAL"
    );

    this.logger.info(
      {
        hackathonId,
        adminId,
      },
      "Hackathon submitted for approval"
    );

    return updated;
  }

  async getPendingHackathons(controllerId) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    return this.hackathonRepository.getPendingHackathons();
  }

  calculateStatusFromPhases(phases) {
    const now = new Date();

    const earliestStart = Math.min(...phases.map((p) => new Date(p.startDate)));

    const latestEnd = Math.max(...phases.map((p) => new Date(p.endDate)));

    if (now < earliestStart) {
      return "UPCOMING";
    }

    if (now >= earliestStart && now <= latestEnd) {
      return "ACTIVE";
    }

    return "COMPLETED";
  }

  async approveHackathon({ hackathonId, controllerId }) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    const hackathon = await this.hackathonRepository.findById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    if (hackathon.status !== "PENDING_APPROVAL") {
      throw new BadRequestError("Hackathon is not pending approval");
    }

    return this.hackathonRepository.update(hackathonId, {
      status:  this.calculateStatusFromPhases(
        hackathon.phases
      ),

      approvedBy: controllerId,

      approvedAt: new Date(),

      rejectionReason: "",
    });
  }

  async rejectHackathon({ hackathonId, controllerId, reason }) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    const hackathon = await this.hackathonRepository.findById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    if (hackathon.status !== "PENDING_APPROVAL") {
      throw new BadRequestError("Hackathon is not pending approval");
    }

    return this.hackathonRepository.update(hackathonId, {
      status: "REJECTED",

      rejectionReason: reason || "",
    });
  }
}
