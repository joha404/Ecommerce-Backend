import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  oldPrice: String,
  stock: Boolean,
  price: { type: String, required: true },
  discount: { type: String, required: false },

  images: [{ type: String, required: true }],

  features: [{ type: String }],

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("product", productSchema);
export default Product;
