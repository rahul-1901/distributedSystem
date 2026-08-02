import mongoose from "mongoose";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { REDIS_KEYS } from "../../config/redisKeys.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

export class HackathonService {
  constructor(
    hackathonRepository,
    submissionRepository,
    registrationRepository,
    adminRepository,
    logger,
    cacheService,
    mediaServiceClient
  ) {
    this.hackathonRepository = hackathonRepository;
    this.submissionRepository = submissionRepository;
    this.registrationRepository = registrationRepository;
    this.adminRepository = adminRepository;
    this.logger = logger;
    this.cacheService = cacheService;
    this.mediaServiceClient = mediaServiceClient;
  }

  async deleteHackathonImage(hackathon, payload) {
    if (
      payload.image &&
      hackathon.image?.key &&
      payload.image.key !== hackathon.image.key
    ) {
      try {
        await this.mediaServiceClient.deleteFile(hackathon.image.key);
      } catch (error) {
        this.logger.error(
          {
            err: error,
            hackathonId: hackathon._id,
          },
          "Failed to delete old hackathon image"
        );
      }
    }
  }

  async deleteRemovedGalleryImages(hackathon, payload) {
    if (!payload.gallery) {
      return;
    }

    const newKeys = new Set(
      payload.gallery.filter((img) => img?.key).map((img) => img.key)
    );

    for (const image of hackathon.gallery || []) {
      if (image?.key && !newKeys.has(image.key)) {
        try {
          await this.mediaServiceClient.deleteFile(image.key);
        } catch (error) {
          this.logger.error(
            {
              err: error,
              hackathonId: hackathon._id,
              key: image.key,
            },
            "Failed to delete gallery image"
          );
        }
      }
    }
  }

  async invalidatePublicCaches(hackathonId, slug = null) {
    try {
      const keys = [
        REDIS_KEYS.PUBLIC_HACKATHONS,
        REDIS_KEYS.HACKATHON(hackathonId),
      ];

      if (slug) {
        keys.push(REDIS_KEYS.HACKATHON_SLUG(slug));
      }

      await this.cacheService.delMany(keys);
    } catch (error) {
      this.logger.error({ error }, "Cache invalidation failed");
    }
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

  async createHackathon({ adminId, payload }) {
    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError(
        "Seems like there isn't any account associated with this email"
      );
    }

    if (!admin.profileCompleted) {
      throw new ForbiddenError("Complete your profile to proceed");
    }

    if (!admin.isVerified || admin.verificationStatus !== "APPROVED") {
      throw new ForbiddenError("Organizer has not been verified yet");
    }

    const existingHackathon = await this.hackathonRepository.findByTitle(
      payload.title
    );

    if (existingHackathon) {
      throw new BadRequestError("Hackathon with this title already exist");
    }

    if (payload.participationType === "TEAM" && payload.maxTeamSize < 2) {
      throw new BadRequestError("Team hackathon must have maxTeamSize >= 2");
    }

    if (!payload.phases || payload.phases.length === 0) {
      throw new BadRequestError("At least one phase is required");
    }

    const createPayload = {
      image: payload.image,
      title: payload.title,
      subTitle: payload.subTitle,
      venue: payload.venue,
      description: payload.description,
      detailsContent: payload.detailsContent,

      category: payload.category,
      techStacks: payload.techStacks,
      gallery: payload.gallery,
      difficulty: payload.difficulty,

      contacts: payload.contacts,
      resources: payload.resources,
      faqs: payload.faqs,

      prizes: payload.prizes,

      votingConfig: payload.votingConfig,
      judgingConfig: payload.judgingConfig,

      showResult: payload.showResult,
      publicLeaderboardLimit: payload.publicLeaderboardLimit,

      registrationForm: payload.registrationForm,
      phases: payload.phases,

      participationType: payload.participationType,
      maxTeamSize: payload.maxTeamSize,

      tags: payload.tags,

      createdBy: adminId,

      status: "DRAFT",
    };

    Object.keys(createPayload).forEach((key) => {
      if (createPayload[key] === undefined) {
        delete createPayload[key];
      }
    });

    const hackathon = await this.hackathonRepository.create(createPayload);

    await this.invalidatePublicCaches(hackathon._id.toString());

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

    const isOwner = hackathon.createdBy.toString() === adminId.toString();

    if (!isOwner) {
      const admin = await this.adminRepository.getById(adminId);

      if (!admin?.controller) {
        throw new ForbiddenError("Not your hackathon");
      }
    }

    if (hackathon.lifecycleStatus === "COMPLETED") {
      throw new ForbiddenError("Completed hackathons cannot be edited");
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

    await this.deleteHackathonImage(hackathon, payload);

    await this.deleteRemovedGalleryImages(hackathon, payload);

    const updatePayload = {
      image: payload.image,
      title: payload.title,
      subTitle: payload.subTitle,
      venue: payload.venue,
      description: payload.description,
      detailsContent: payload.detailsContent,

      category: payload.category,
      techStacks: payload.techStacks,
      gallery: payload.gallery,
      difficulty: payload.difficulty,

      contacts: payload.contacts,
      resources: payload.resources,
      faqs: payload.faqs,

      prizes: payload.prizes,

      votingConfig: payload.votingConfig,
      judgingConfig: payload.judgingConfig,

      showResult: payload.showResult,
      publicLeaderboardLimit: payload.publicLeaderboardLimit,

      phases: payload.phases,
      registrationForm: payload.registrationForm,

      participationType: payload.participationType,
      maxTeamSize: payload.maxTeamSize,

      tags: payload.tags,
    };

    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const updated = await this.hackathonRepository.update(
      hackathonId,
      updatePayload
    );

    await this.invalidatePublicCaches(hackathonId, hackathon.slug);

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

    if (hackathon.lifecycleStatus === "COMPLETED") {
      throw new ForbiddenError("Completed hackathons cannot be edited");
    }

    if (hackathon.status !== "APPROVED") {
      throw new BadRequestError("Hackathon already approved");
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

    if (!hackathon.image?.url || !hackathon.image?.key) {
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

  async getAllHackathonsForController(controllerId) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    return this.hackathonRepository.getAllHackathonsForController();
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

    const updated = await this.hackathonRepository.update(hackathonId, {
      status: "APPROVED",
      approvedBy: controllerId,
      approvedAt: new Date(),
      rejectionReason: "",
    });

    await this.invalidatePublicCaches(hackathonId, updated.slug);

    return updated;
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

    const rejected = await this.hackathonRepository.update(hackathonId, {
      status: "REJECTED",
      rejectionReason: reason || "",
    });

    await this.invalidatePublicCaches(hackathonId);

    return rejected;
  }

  async getOrganizerHackathon({ hackathonId, adminId }) {
    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    const isOwner = hackathon.createdBy._id.toString() === adminId.toString();

    const admin = await this.adminRepository.getById(adminId);

    if (!isOwner && !admin?.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    return hackathon;
  }

  async deleteHackathon({ hackathonId, adminId }) {
    const hackathon = await this.hackathonRepository.findById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    const admin = await this.adminRepository.getById(adminId);

    const isController = admin?.controller;

    const ownerId = hackathon.createdBy._id
      ? hackathon.createdBy._id.toString()
      : hackathon.createdBy.toString();

    const isOwner = ownerId === adminId.toString();
    const slug = hackathon.slug;

    if (!isOwner && !isController) {
      throw new ForbiddenError("Unauthorized");
    }

    if (!isController) {
      const allowedStatuses = ["DRAFT", "REJECTED"];

      if (!allowedStatuses.includes(hackathon.status)) {
        throw new ForbiddenError(
          "Only draft or rejected hackathons can be deleted"
        );
      }
    }

    if (hackathon.image?.key) {
      try {
        await this.mediaServiceClient.deleteFile(hackathon.image.key);
      } catch (error) {
        this.logger.error(
          {
            err: error,
            hackathonId,
          },
          "Failed to delete hackathon image"
        );
      }
    }

    for (const image of hackathon.gallery || []) {
      if (!image?.key) {
        continue;
      }

      try {
        await this.mediaServiceClient.deleteFile(image.key);
      } catch (error) {
        this.logger.error(
          {
            err: error,
            hackathonId,
            key: image.key,
          },
          "Failed to delete gallery image"
        );
      }
    }

    await this.hackathonRepository.delete(hackathonId);

    await this.invalidatePublicCaches(hackathonId, slug);

    this.logger.info(
      {
        hackathonId,
        adminId,
      },
      "Hackathon deleted"
    );

    return {
      success: true,
      message: "Hackathon deleted successfully",
    };
  }

  getLifecycleStatus(hackathon) {
    if (hackathon.status !== "APPROVED") {
      return hackathon.status;
    }

    const now = new Date();

    if (!hackathon.phases || hackathon.phases.length === 0) {
      return "UPCOMING";
    }

    const activePhases = hackathon.phases.filter(
      (phase) => phase.isActive !== false
    );

    if (activePhases.length === 0) {
      return "UPCOMING";
    }

    const earliest = new Date(
      Math.min(
        ...activePhases.map((phase) => new Date(phase.startDate).getTime())
      )
    );

    const latest = new Date(
      Math.max(
        ...activePhases.map((phase) => new Date(phase.endDate).getTime())
      )
    );

    if (now < earliest) {
      return "UPCOMING";
    }

    if (now <= latest) {
      return "ACTIVE";
    }

    return "COMPLETED";
  }

  async getPublicHackathons(query) {
    const cacheKey = REDIS_KEYS.PUBLIC_HACKATHONS;

    const cached = await this.cacheService.get(cacheKey);

    let hackathons;

    if (cached) {
      hackathons = cached;
    } else {
      hackathons = await this.hackathonRepository.getApprovedHackathons();
      await this.cacheService.set(cacheKey, hackathons, 300);
    }

    hackathons = hackathons.map((hackathon) => ({
      ...(hackathon.toObject ? hackathon.toObject() : hackathon),
      lifecycleStatus: this.getLifecycleStatus(hackathon),
    }));

    const {
      status,
      category,
      difficulty,
      tag,
      search,
      page = 1,
      limit = 12,
    } = query;

    if (status) {
      hackathons = hackathons.filter((h) => h.lifecycleStatus === status);
    }

    if (category) {
      hackathons = hackathons.filter((h) =>
        h.category?.some((c) => c.toLowerCase() === category.toLowerCase())
      );
    }

    if (difficulty) {
      hackathons = hackathons.filter((h) => h.difficulty === difficulty);
    }

    if (tag) {
      hackathons = hackathons.filter((h) =>
        h.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
      );
    }

    if (typeof search === "string" && search.trim()) {
      const term = search.toLowerCase();

      hackathons = hackathons.filter(
        (h) =>
          h.title?.toLowerCase().includes(term) ||
          h.description?.toLowerCase().includes(term)
      );
    }

    const total = hackathons.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    hackathons.sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        Number(a.featuredOrder || 0) - Number(b.featuredOrder || 0)
    );

    const data = hackathons.slice(skip, skip + limitNum);

    return {
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        hasNext: skip + data.length < total,
      },
    };
  }

  async getHackathonBySlug(slug) {
    const cacheKey = REDIS_KEYS.HACKATHON_SLUG(slug);

    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const hackathon = await this.hackathonRepository.findBySlug(slug);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    await this.cacheService.set(cacheKey, hackathon, 300);

    return hackathon;
  }
}
