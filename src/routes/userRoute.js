import express from "express";
import userController from "../controllers/userController.js";

const userRouter = express.Router();

// Signup
userRouter.post("/signup", userController.CreateUser);

// Login
userRouter.post("/login", userController.LoginUser);

// Logout
userRouter.post("/logout", userController.LogoutUser);

// Get all users
userRouter.get("/", userController.getAllUser);

// Get single user by ID
userRouter.get("/:userId", userController.getSingleUser);

// Update user by ID
userRouter.put("/:userId", userController.updateUser);

// Delete user by ID
userRouter.delete("/:userId", userController.deleteUser);

export default userRouter;
