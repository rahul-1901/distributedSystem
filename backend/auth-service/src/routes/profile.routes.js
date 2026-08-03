import { Router } from "express";
import {
  getMyProfile,
  getPublicProfile,
  searchProfiles,
  updateProfile,
  addEducation,
  updateEducation,
  removeEducation,
  addConnectedApp,
  updateConnectedApp,
  removeConnectedApp,
  updateSkills,
  updateLanguages,
  updateAvatar
} from "../controllers/profile.controller.js";
import { verifyAuth } from "../middlewares/userAuth.js";

const router = Router();

router.get("/me", verifyAuth, getMyProfile);
router.patch("/me", verifyAuth, updateProfile);
router.get("/search", searchProfiles);
router.get("/:userName", getPublicProfile);
router.post("/me/education", verifyAuth, addEducation);
router.patch("/me/education/:id", verifyAuth, updateEducation);
router.delete("/me/education/:id", verifyAuth, removeEducation);
router.post("/me/apps", verifyAuth, addConnectedApp);
router.patch("/me/apps/:id", verifyAuth, updateConnectedApp);
router.delete("/me/apps/:id", verifyAuth, removeConnectedApp);
router.put("/me/skills", verifyAuth, updateSkills);
router.put("/me/languages", verifyAuth, updateLanguages);
router.patch("/me/avatar", verifyAuth, updateAvatar);

export default router;
