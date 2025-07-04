import SSLCommerzPayment from "sslcommerz-lts";
import { v4 as uuidv4 } from "uuid";
import Order from "../models/orderModel.js";

export async function initiatePayment(req, res) {
  try {
    const tran_id = uuidv4();

    const { user, addresses, cart, product, totalAmount, paymentMethod } =
      req.body;

    if (!user || !addresses || addresses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User and address data are required",
      });
    }

    // Get default address or fallback to first address
    const address = addresses.find((a) => a.isDefault) || addresses[0];
    const userInfo = user._id; // Must be ObjectId string
    const addressId = addresses[0]._id; // Use first address's id
    const cartItems = cart; // array of objects with product, quantity, price, total
    const products = product; // array of product ObjectIds

    const newOrder = new Order({
      userInfo,
      addressId,
      cart: cartItems,
      product: products,
      totalAmount,
      tranjectionId: tran_id,
      paymentMethod,
      paidStatus: false,
    });

    await newOrder.save();

    if (paymentMethod !== "SSLCommerz") {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported payment method" });
    }

    const paymentData = {
      total_amount: totalAmount,
      currency: "BDT",
      tran_id,

      success_url: `${process.env.BASE_URL}/api/payment/success/${tran_id}`,
      fail_url: `${process.env.BASE_URL}/api/payment/fail`,
      cancel_url: `${process.env.BASE_URL}/api/payment/cancel`,
      ipn_url: `${process.env.BASE_URL}/api/payment/ipn`,

      shipping_method: "Courier",

      ship_name: address.fullName || `${user.name}`,
      ship_add1: address.street || "",
      ship_add2: "",
      ship_city: address.city || "",
      ship_state: address.state || "",
      ship_postcode: address.postalCode || "",
      ship_country: address.country || "",

      cus_name: user.name || "",
      cus_email: user.email || "",
      cus_add1: address.street || "",
      cus_add2: "",
      cus_city: address.city || "",
      cus_state: address.state || "",
      cus_postcode: address.postalCode || "",
      cus_country: address.country || "",
      cus_phone: user.number || address.phone || "",

      product_name: "Your Products",
      product_category: "General",
      product_profile: "general",
    };

    const sslcz = new SSLCommerzPayment(
      process.env.STORE_ID,
      process.env.STORE_PASSWORD,
      false
    );

    const response = await sslcz.init(paymentData);

    if (response?.GatewayPageURL) {
      return res
        .status(200)
        .json({ success: true, url: response.GatewayPageURL });
    }

    return res.status(400).json({
      success: false,
      message: "Payment session failed",
      reason: response?.failedreason || "Unknown error",
    });
  } catch (error) {
    console.error("Error in initiatePayment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
