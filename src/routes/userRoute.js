import express from "express";
import {
  getSingleUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";

const userRouter = express.Router();

// Get all users
userRouter.get("/", verifyToken, isAdmin, getAllUsers);

// Get single user by ID
userRouter.get("/:userId", getSingleUser);

// Update user by ID
userRouter.put("/:userId", updateUser);

// Delete user by ID
userRouter.delete("/:userId", deleteUser);

export default userRouter;
