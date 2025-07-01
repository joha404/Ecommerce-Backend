// src/routes/profileRoutes.js

import express from "express";
import {
  createOrUpdateProfile,
  deleteMyProfile,
  getAllProfiles,
  getMyProfile,
  getProfileByUserId,
} from "../controllers/profileController.js";
import protect from "../middleware/protect.js";

const profileRouter = express.Router();

// ✅ Protected and public routes
profileRouter.post("/", protect, createOrUpdateProfile);

profileRouter.get("/me", protect, getMyProfile); // Admin only
profileRouter.get("/user/:userId", getProfileByUserId); // Public
profileRouter.delete("/", deleteMyProfile); // Admin only

export default profileRouter;
