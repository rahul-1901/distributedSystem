import { wishlistService } from "../services/wishlistServices/wishlist.service.instance.js";
import { hackathonService } from "../services/hackathonServices/hackathon.service.instance.js";
import { submissionService } from "../services/submissionServices/submission.service.instance.js";

export const getActiveHackathons = async (req, res, next) => {
  try {
    const allHackathons = await hackathonService.getActiveHackathons();

    return res.status(200).json({
      allHackathons,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpiredHackathons = async (req, res, next) => {
  try {
    const expiredHackathons = await hackathonService.getExpiredHackathons();

    return res.status(200).json({
      expiredHackathons,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingHackathons = async (req, res, next) => {
  try {
    const upcomingHackathons = await hackathonService.getUpcomingHackathons();

    return res.status(200).json({
      upcomingHackathons,
    });
  } catch (error) {
    next(error);
  }
};

export const getHackathonById = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.getHackathonById(req.params.id);

    return res.status(200).json(hackathon);
  } catch (error) {
    next(error);
  }
};

export const getHackathonResults = async (req, res, next) => {
  try {
    const results = await submissionService.getHackathonResults(req.params.id);

    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export const getHackathonGallery = async (req, res, next) => {
  try {
    const gallery = await hackathonService.getHackathonGallery(
      req.params.hackathonId
    );

    return res.status(200).json({
      success: true,
      gallery,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleHackathonWishlist = async (req, res, next) => {
  try {
    const { hackathonId } = req.body;

    const result = await wishlistService.toggleHackathonWishlist(
      req.user?._id,
      hackathonId
    );

    return res.status(result.liked ? 201 : 200).json({
      success: true,
      liked: result.liked,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserHackathonWishlist = async (req, res, next) => {
  try {
    const result = await wishlistService.getUserWishlist(req.user?._id);

    return res.status(200).json({
      success: true,
      likedHackathons: result.likedHackathons,
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};

export const checkHackathonLiked = async (req, res, next) => {
  try {
    const result = await wishlistService.checkHackathonLiked(
      req.user?._id,
      req.params.hackathonId
    );

    return res.status(200).json({
      success: true,
      liked: result.liked,
    });
  } catch (error) {
    next(error);
  }
};
