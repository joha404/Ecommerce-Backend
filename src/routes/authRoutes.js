import express from "express";
import {
  createUser,
  loginUser,
  verifyEmailCode,
  logoutUser,
  resendVerificationCode,
} from "../controllers/userController.js";

const authRouter = express.Router();

authRouter.post("/signup", createUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.post("/verify-email", verifyEmailCode);
authRouter.post("/resend-verification-code", resendVerificationCode);

export default authRouter;
