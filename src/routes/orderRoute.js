import express from "express";
import {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getOrdersByEmail,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Create a new order
orderRouter.post("/create", createOrder);

// Get all orders
orderRouter.get("/", getAllOrders);

// Get a single order by ID
orderRouter.get("/:id", getSingleOrder);

// Get a single order by user Email

orderRouter.get("/orders/:userId", getOrdersByEmail);

// Update order status, deliveryStatus, or paidStatus
orderRouter.put("/status/:id", updateOrderStatus);

// Cancel order (within 24 hours and status Pending)
orderRouter.put("/cancel/:id", cancelOrder);

// Delete an order (optional, admin)
orderRouter.delete("/delete/:id", deleteOrder);

export default orderRouter;
