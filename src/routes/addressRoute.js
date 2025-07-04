import express from "express";
import {
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
  getSingleUserAddress,
} from "../controllers/addressController.js";

const addressRouter = express.Router();
addressRouter.post("/add", addAddress);
addressRouter.get("/:userId", getUserAddresses);
addressRouter.get("/single/:addressId", getSingleUserAddress);
addressRouter.put("/update/:id", updateAddress);
addressRouter.delete("/delete/:id", deleteAddress);

export default addressRouter;
