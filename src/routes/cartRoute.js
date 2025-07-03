import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.post("/add", addToCart);
cartRouter.get("/:userId", getCart);
cartRouter.put("/update", updateCartItem);
cartRouter.delete("/remove", removeCartItem);
cartRouter.delete("/clear", clearCart);

export default cartRouter;
