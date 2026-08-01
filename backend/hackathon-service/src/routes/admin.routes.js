import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";

import {
  assignJudge,
  getHackathonJudges,
  removeJudge,
  getAssignedHackathons,
} from "../controllers/judgeAssignment.controller.js";

import {
  reviewSubmission,
  getHackathonSubmissionsForJudge,
  getSubmissionDetailsForJudge,
  getSubmissionReviews,
} from "../controllers/submissionReview.controller.js";

import {
  getProfile,
  updateProfile,
  submitVerificationRequest,
  getPendingVerificationRequests,
  approveVerification,
  rejectVerification,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/hackathons/:hackathonId/judges", adminAuth, assignJudge);
router.get("/hackathons/:hackathonId/judges", adminAuth, getHackathonJudges);
router.delete(
  "/hackathons/:hackathonId/judges/:judgeId",
  adminAuth,
  removeJudge
);
router.get("/judges/assigned-hackathons", adminAuth, getAssignedHackathons);

router.get(
  "/judges/hackathons/:hackathonId/submissions",
  adminAuth,
  getHackathonSubmissionsForJudge
);
router.get(
  "/judges/submissions/:submissionId",
  adminAuth,
  getSubmissionDetailsForJudge
);
router.post(
  "/judges/submissions/:submissionId/review",
  adminAuth,
  reviewSubmission
);
router.get(
  "/judges/submissions/:submissionId/reviews",
  adminAuth,
  getSubmissionReviews
);

router.get("/profile", adminAuth, getProfile);
router.patch("/profile", adminAuth, updateProfile);
router.post("/verification-request", adminAuth, submitVerificationRequest);
router.get("/verification-requests", adminAuth, getPendingVerificationRequests);
router.post("/admins/:adminId/approve", adminAuth, approveVerification);
router.post("/admins/:adminId/reject", adminAuth, rejectVerification);

export default router;
