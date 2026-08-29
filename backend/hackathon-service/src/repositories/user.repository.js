import UserModel from "../models/user.model.js";

export class UserRepository {
  async getById(id) {
    return UserModel.findById(id).lean();
  }

  async getWishlist(userId) {
    return UserModel.findById(userId)
      .populate({
        path: "wishlist",
        select:
          "title subTitle description image difficulty category tags phases lifecycleStatus slug",
      })
      .lean();
  }

  async getWishlistIds(userId) {
    return UserModel.findById(userId).select("wishlist").lean();
  }

  async getWishlistedUserIds(hackathonId) {
    return UserModel.find({ wishlist: hackathonId }).select("_id").lean();
  }

  async getAllUserIds() {
    return UserModel.find({}).select("_id").lean();
  }

  async addToWishlist(userId, hackathonId) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          wishlist: hackathonId,
        },
      },
      {
        new: true,
      }
    );
  }

  async removeFromWishlist(userId, hackathonId) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          wishlist: hackathonId,
        },
      },
      {
        new: true,
      }
    );
  }

  async addTeam(userId, hackathonId, teamId, session = null) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          teams: {
            hackathon: hackathonId,
            team: teamId,
          },
        },
      },
      {
        new: true,
        session,
      }
    );
  }

  async leaveTeam(userId, hackathonId, session = null) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          teams: {
            hackathon: hackathonId,
          },
        },
      },
      {
        new: true,
        session,
      }
    );
  }

  async removeTeam(userId, hackathonId, session = null) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          teams: {
            hackathon: hackathonId,
          },
        },
      },
      {
        new: true,
        session,
      }
    );
  }
}
