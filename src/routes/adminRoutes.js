import express from "express";
import {
  loginAdmin,
  logoutAdmin,
  createAdmin,
  getAllAdmins,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// Admin Auth Routes
adminRouter.post("/login", loginAdmin);
adminRouter.post("/logout", logoutAdmin);

// Admin Management
adminRouter.post("/create", createAdmin);
adminRouter.get("/all", getAllAdmins);

export default adminRouter;
