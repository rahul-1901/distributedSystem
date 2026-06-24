import DiscussionModel from "../models/discussion.model.js";

export class DiscussionRepository {
  async create(data) {
    return DiscussionModel.create(data);
  }

  async findById(id) {
    return DiscussionModel.findById(id);
  }

  async getHackathonMessages(hackathonId, page = 1, limit = 50) {
    return DiscussionModel.find({
      hackathon: hackathonId,
      parentMessage: null,
      isDeleted: false,
    })
      .populate("sender", "name profilePicture")
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  async getReplies(messageId) {
    return DiscussionModel.find({
      parentMessage: messageId,
      isDeleted: false,
    })
      .populate("sender", "name profilePicture")
      .sort({
        createdAt: 1,
      })
      .lean();
  }

  async softDelete(id) {
    return DiscussionModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        content: "[deleted]",
      },
      {
        new: true,
      }
    );
  }
}
