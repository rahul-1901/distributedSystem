import express from "express";
import { verifyUploader } from "../middlewares/verifyUploader.js";
import { verifyInternalService } from "../middlewares/internalAuth.js";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadFile, deleteFile } from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/", verifyUploader, upload.single("file"), uploadFile);
router.delete("/", verifyInternalService,  deleteFile);

export default router;