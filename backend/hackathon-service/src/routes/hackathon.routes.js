import express from "express";
import { verifyAuth } from "../middlewares/userAuth.js";
import { adminAuth } from "../middlewares/adminAuth.js";
import rateLimit from "express-rate-limit";

import {
  getHackathonById,
  getHackathonResults,
  getHackathonGallery,
  toggleHackathonWishlist,
  getUserHackathonWishlist,
  checkHackathonLiked,
  createHackathon,
  updateHackathon,
  submitForApproval,
  getPendingHackathons,
  rejectHackathon,
  approveHackathon,
  deleteHackathon,
  getPublicHackathons,
  getHackathonBySlug,
  getMyHackathons,
  getAllHackathonsForController,
  getHackathonAdminOverview,
  getEntitySubmissions
} from "../controllers/hackathon.controller.js";

import { 
  registerParticipants, 
  isRegistered,
  getMyRegistration,
  updateMyRegistration,
  getMyRegistrations
} from "../controllers/registration.controller.js";

import {
  createTeam,
  joinTeam,
  handleRequest,
  getPendingRequests,
  getTeamById,
  searchTeamByCode,
  cancelJoinRequest,
  leaveTeam,
  removeMember,
  updateTeam,
  deleteTeam
} from "../controllers/team.controller.js";

import {
  createSubmission,
  getMySubmission,
  updateSubmission,
  getSubmissionById
} from "../controllers/submission.controller.js";

import {
  toggleVote,
  getVotingSubmissions,
  getVotingSubmissionById,
} from "../controllers/voting.controller.js";

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
router.get("/hackathon", getLimiter, getPublicHackathons);
router.get("/my-registrations", verifyAuth, getLimiter, getMyRegistrations);

//hackathon user wishlist — must be registered before the generic "/:id"
//route below, otherwise Express matches "/:id" first and treats the
//literal "wishlist" segment as a hackathon id.
router.post("/wishlist/toggle", verifyAuth, getLimiter, toggleHackathonWishlist);
router.get("/wishlist", verifyAuth, getLimiter, getUserHackathonWishlist);
router.get("/wishlist/check/:hackathonId", verifyAuth, getLimiter, checkHackathonLiked);

router.get("/:id", getLimiter, getHackathonById);
router.get("/:id/results", getLimiter, getHackathonResults);
router.get("/:hackathonId/gallery", getLimiter, getHackathonGallery);
router.post("/:submissionId/vote", verifyAuth, strictLimiter, toggleVote);
router.get("/:hackathonId/voting-submissions", getLimiter, getVotingSubmissions);
router.get("/voting-submissions/:submissionId", getLimiter, getVotingSubmissionById);
router.get("/slug/:slug", getLimiter, getHackathonBySlug);

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
router.delete("/teams/:teamId/revert-request", verifyAuth, strictLimiter, cancelJoinRequest);
router.delete("/teams/:teamId/leaveTeam", verifyAuth, strictLimiter, leaveTeam);
router.delete("/teams/:teamId/members/:userId", verifyAuth, strictLimiter, removeMember);
router.patch("/teams/:teamId/updateTeam", verifyAuth, strictLimiter, updateTeam);
router.delete("/teams/:teamId/deleteTeam", verifyAuth, strictLimiter, deleteTeam);

//hackathon submission routes
router.post("/:hackathonId/creatSubmission", verifyAuth, createSubmission);
router.get("/:hackathonId/my-submission", verifyAuth, getLimiter, getMySubmission);
router.get("/submissions/:submissionId", verifyAuth, getLimiter, getSubmissionById);
router.patch("/:hackathonId/submission/:submissionId", verifyAuth, strictLimiter, updateSubmission);

//hackathon admin routes
router.post("/admin/createHackathon",adminAuth,createHackathon);
router.patch("/admin/updateHackathon/:id", adminAuth, updateHackathon);
router.post("/admin/:id/submitHackathon", adminAuth, submitForApproval);
router.get("/admin/pendingHackathon", adminAuth, getPendingHackathons);
router.get("/admin/all-hackathons", adminAuth, getAllHackathonsForController);
router.post("/admin/:id/approveHackathon", adminAuth, approveHackathon);
router.post("/admin/:id/rejectHackathon", adminAuth, rejectHackathon);
router.delete("/admin/:id/deleteHackathon", adminAuth, deleteHackathon);
router.get("/admin/hackathons/:id/overview", adminAuth, getHackathonAdminOverview);
router.get(
  "/admin/hackathons/:id/submissions/:entityType/:entityId",
  adminAuth,
  getEntitySubmissions
);
router.get("/admin/my-hackathons", adminAuth, getMyHackathons);

export default router;