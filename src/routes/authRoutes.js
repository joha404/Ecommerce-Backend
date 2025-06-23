import express from "express";
import {
  createUser,
  loginUser,
  verifyEmailCode,
  logoutUser,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";

const authRouter = express.Router();

authRouter.post("/signup", createUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.post("/verify-email", verifyEmailCode);
authRouter.post("/resend-verification-code", resendVerificationCode);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/change-password", resetPassword);

export default authRouter;
