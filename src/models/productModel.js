import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    oldPrice: String,
    price: { type: String, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Boolean, default: true },
    stockCount: { type: Number, default: 0 },
    brand: { type: String },
    images: [{ type: String, required: true }],
    features: [{ type: String }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    ratings: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        name: { type: String },
        comment: { type: String },
        rating: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("product", productSchema);
export default Product;
