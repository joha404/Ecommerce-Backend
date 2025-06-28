import express from "express";
import upload from "../middleware/multer.js"; // your multer config for single file upload
import {
  getProfile,
  upsertProfile,
  deleteProfile,
} from "../controllers/profileController.js";

const profileRoute = express.Router();

// Get profile by userId
profileRoute.get("/:userId", getProfile);

// Create or update profile with single avatar image upload (field name: 'avatar')
profileRoute.put("/:userId", upload.single("avatar"), upsertProfile);

// Delete profile by userId
profileRoute.delete("/:userId", deleteProfile);

export default profileRoute;
