import express from "express";

import { verifyAuth }
  from "../middlewares/userAuth.js";

import { upload }
  from "../middlewares/upload.middleware.js";

import {
  uploadFile,
} from "../controllers/upload.controller.js";

const router =
  express.Router();

router.post(
  "/",
  verifyAuth,
  upload.single("file"),
  uploadFile
);

export default router;