import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";

export class ProfileService {
  constructor(profileRepository, mediaServiceClient, logger) {
    this.profileRepository = profileRepository;
    this.mediaServiceClient = mediaServiceClient;
    this.logger = logger;
  }

  async getMyProfile(userId) {
    const user = await this.profileRepository.getById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async getPublicProfile(userName) {
    const user = await this.profileRepository.getPublicProfile(userName);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user.publicProfile;
  }

  async updateProfile(userId, payload) {
    const { name, userName, bio, location, contactNumber } = payload;

    const updatedUser = await this.profileRepository.updateProfile(userId, {
      name,
      userName,
      bio,
      location,
      contactNumber,
    });

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    this.logger.info(
      {
        userId,
      },
      "Profile updated"
    );

    return updatedUser;
  }

  async addEducation(userId, payload) {
    const { institute, passOutYear, department, location } = payload;

    if (!institute || !passOutYear || !department || !location) {
      throw new BadRequestError("All education fields are required");
    }

    const user = await this.profileRepository.addEducation(userId, payload);

    return user.education;
  }

  async updateEducation(userId, educationId, payload) {
    if (!mongoose.Types.ObjectId.isValid(educationId)) {
      throw new BadRequestError("Invalid education id");
    }

    const user = await this.profileRepository.updateEducation(
      userId,
      educationId,
      payload
    );

    if (!user) {
      throw new NotFoundError("Education not found");
    }

    return user.education;
  }

  async removeEducation(userId, educationId) {
    if (!mongoose.Types.ObjectId.isValid(educationId)) {
      throw new BadRequestError("Invalid education id");
    }

    const user = await this.profileRepository.removeEducation(
      userId,
      educationId
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user.education;
  }

  async addConnectedApp(userId, payload) {
    const { appName, appURL } = payload;

    if (!appName || !appURL) {
      throw new BadRequestError("App name and URL are required");
    }

    const user = await this.profileRepository.addConnectedApp(userId, payload);

    return user.connectedApps;
  }

  async updateConnectedApp(userId, appId, payload) {
    if (!mongoose.Types.ObjectId.isValid(appId)) {
      throw new BadRequestError("Invalid app id");
    }

    const user = await this.profileRepository.updateConnectedApp(
      userId,
      appId,
      payload
    );

    if (!user) {
      throw new NotFoundError("Connected app not found");
    }

    return user.connectedApps;
  }

  async removeConnectedApp(userId, appId) {
    if (!mongoose.Types.ObjectId.isValid(appId)) {
      throw new BadRequestError("Invalid app id");
    }

    const user = await this.profileRepository.removeConnectedApp(userId, appId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user.connectedApps;
  }

  async updateSkills(userId, skills) {
    if (!Array.isArray(skills)) {
      throw new BadRequestError("Skills must be an array");
    }

    const user = await this.profileRepository.updateSkills(userId, skills);

    return user.skills;
  }

  async updateLanguages(userId, languages) {
    if (!Array.isArray(languages)) {
      throw new BadRequestError("Languages must be an array");
    }

    const user = await this.profileRepository.updateLanguages(
      userId,
      languages
    );

    return user.languages;
  }

  async updateAvatar(userId, image) {
    if (!image?.url || !image?.key) {
      throw new BadRequestError("Invalid image");
    }

    const existingUser = await this.profileRepository.findById(userId);

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if (existingUser.image?.key && existingUser.image.key !== image.key) {
      try {
        await this.mediaServiceClient.deleteFile(existingUser.image.key);
      } catch (error) {
        this.logger.error(
          {
            err: error,
            userId,
          },
          "Failed to delete old avatar"
        );
      }
    }

    const user = await this.profileRepository.updateAvatar(userId, image);

    return user.image;
  }
}
