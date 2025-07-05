import Order from "../models/orderModel.js";

// Create Order
export async function createOrder(req, res) {
  try {
    const {
      userInfo,
      addressId,
      cartId,
      product,
      cart,
      totalAmount,
      tranjectionId,
      paymentMethod,
    } = req.body;

    if (!userInfo || !addressId || !totalAmount || !tranjectionId) {
      return res.status(400).json({
        message:
          "userInfo, addressId, totalAmount, and tranjectionId are required",
      });
    }

    const hasCartItems = cart && cart.length > 0;
    const hasProducts = product && product.length > 0;

    if (!hasCartItems && !hasProducts) {
      return res.status(400).json({
        message: "At least one of 'cart' or 'product' must be provided.",
      });
    }

    // Optional: Validate cart items quantity, price etc. here if needed.

    const newOrder = await Order.create({
      userInfo,
      addressId,
      cartId: cartId || null,
      product: product || [],
      cart: cart || [],
      totalAmount,
      tranjectionId,
      paymentMethod,
    });

    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Order creation error:", error);
    res
      .status(500)
      .json({ message: "Order creation failed", error: error.message });
  }
}

// Get All Orders
export async function getAllOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate("userInfo", "name email")
      .populate("addressId")
      .populate("cart.product")
      .populate("product");

    res.status(200).json({ message: "Orders fetched successfully", orders });
  } catch (error) {
    console.error("Get all orders error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
}

// Get Single Order
export async function getSingleOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("userInfo", "name email")
      .populate("addressId")
      .populate("cart.product")
      .populate("product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order fetched successfully", order });
  } catch (error) {
    console.error("Get order error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch order", error: error.message });
  }
}

// get order by userId
export const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate and find orders by userId (userInfo field)
    const orders = await Order.find({ userInfo: userId }).sort({
      createdAt: -1,
    });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({
      message: "Orders retrieved successfully",
      orders,
    });
  } catch (error) {
    console.error("Get orders by userId error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Order Status
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, deliveryStatus, paidStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status) order.status = status;
    if (deliveryStatus) order.deliveryStatus = deliveryStatus;
    if (typeof paidStatus === "boolean") order.paidStatus = paidStatus;

    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Update order status error:", error);
    res
      .status(500)
      .json({ message: "Status update failed", error: error.message });
  }
}

// Cancel Order (within 24 hours & if status pending)
export async function cancelOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const hoursPassed =
      (Date.now() - new Date(order.createdAt)) / (1000 * 60 * 60);
    if (hoursPassed > 24) {
      return res
        .status(403)
        .json({ message: "Cannot cancel order after 24 hours" });
    }

    if (order.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    }

    order.status = "Rejected";
    order.deliveryStatus = "Cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Cancel order error:", error);
    res
      .status(500)
      .json({ message: "Error cancelling order", error: error.message });
  }
}

// Optional: Delete Order (admin only, maybe)
export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;

    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res
      .status(500)
      .json({ message: "Error deleting order", error: error.message });
  }
}
