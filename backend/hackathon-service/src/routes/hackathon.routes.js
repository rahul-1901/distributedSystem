import express from "express";
import { verifyAuth } from "../middlewares/userAuth.js";
import rateLimit from "express-rate-limit";

import {
  getActiveHackathons,
  getExpiredHackathons,
  getUpcomingHackathons,
  getHackathonById,
  getHackathonResults,
  getHackathonGallery,
  toggleHackathonWishlist,
  getUserHackathonWishlist,
  checkHackathonLiked
} from "../controllers/hackathon.controllers.js";

import { 
  registerParticipants, 
  isRegistered,
  getMyRegistration,
  updateMyRegistration
} from "../controllers/registration.controller.js";

import {
  createTeam,
  joinTeam,
  handleRequest,
  getPendingRequests,
  getTeamById,
  searchTeamByCode
} from "../controllers/team.controllers.js";

const router = express.Router();

const getLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 700,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

//hackathon public routes
router.get("/activeHackathons", getLimiter, getActiveHackathons);
router.get("/expiredHackathons", getLimiter, getExpiredHackathons);
router.get("/upcomingHackathons", getLimiter, getUpcomingHackathons);
router.get("/:id", getLimiter, getHackathonById);
router.get("/:id/results", getLimiter, getHackathonResults);
router.get("/:hackathonId/gallery", getLimiter, getHackathonGallery);

//hackathon user wishlist
router.post("/wishlist/toggle", verifyAuth, getLimiter, toggleHackathonWishlist);
router.get("/wishlist", verifyAuth, getLimiter, getUserHackathonWishlist);
router.get("/wishlist/check/:hackathonId", verifyAuth, getLimiter, checkHackathonLiked);

//hackathon registration routes
router.post("/:hackathonId/register", verifyAuth, strictLimiter, registerParticipants);
router.get("/:hackathonId/registration-status", verifyAuth, getLimiter, isRegistered);
router.get("/:hackathonId/my-registration", verifyAuth, getLimiter, getMyRegistration);
router.patch("/:hackathonId/my-registration", verifyAuth, strictLimiter, updateMyRegistration);

//hackathon team routes
router.post("/teams/:hackathonId/createTeam", verifyAuth, getLimiter, createTeam);
router.post("/teams/joinTeam", verifyAuth, strictLimiter, joinTeam);
router.patch("/teams/:teamId/handleRequests", verifyAuth, strictLimiter, handleRequest);
router.get("/teams/:teamId/pending-requests", verifyAuth, getLimiter, getPendingRequests)
router.get("/teams/:teamId", verifyAuth, getLimiter, getTeamById)
router.get("/teams/code/:secretCode", verifyAuth, getLimiter, searchTeamByCode);


export default router;

// router.post("/:hackathonId/gallery", adminAuth, strictLimiter, uploadGalleryImages, addGalleryImages);
// router.delete("/:hackathonId/gallery", adminAuth, strictLimiter, deleteGalleryImage);