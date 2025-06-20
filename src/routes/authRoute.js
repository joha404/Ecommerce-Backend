import express from "express";
import passport from "../auth/googleAuth";
const authRoute = express.Router();

// Google OAuth routes
authRoute.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

authRoute.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:5173/",
    failureRedirect: "/auth/google/failure",
  })
);

authRoute.get("/google/failure", (req, res) => {
  res.send("Failed to authenticate..");
});

authRoute.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy();
    res.send("Goodbye!");
  });
});

export default authRoute;
