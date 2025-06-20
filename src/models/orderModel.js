import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
      required: true,
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cart",
      required: false,
    },
    product: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
    ],
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    tranjectionId: {
      type: String,
      required: true,
    },
    paidStatus: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Card", "SSLCommerz", "CashOnDelivery"],
      default: "SSLCommerz",
    },
    deliveryStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Custom validation to ensure at least one of product or cart has data
orderSchema.pre("validate", function (next) {
  const hasCartItems = this.cart && this.cart.length > 0;
  const hasProducts = this.product && this.product.length > 0;

  if (!hasCartItems && !hasProducts) {
    return next(
      new Error(
        "Validation failed: At least one of 'cart' or 'product' must be provided."
      )
    );
  }
  next();
});

export default mongoose.model("order", orderSchema);
