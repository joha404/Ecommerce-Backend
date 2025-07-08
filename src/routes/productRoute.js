import express from "express";
import multer from "multer";
import productController from "../controllers/productController.js";

const productRoute = express.Router();

// Multer setup for multiple image uploads (max 5 images)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Create product (multiple images)
productRoute.post(
  "/create",
  upload.array("images", 5),
  productController.createProduct
);

// Get all products
productRoute.get("/all", productController.allProducts);

// Search products by query param ?query=
productRoute.get("/search", productController.searchProducts);

// Get products by category ID (make sure your controller uses req.params.id)
productRoute.get("/category/:id", productController.getProductsByCategoryId);

// Get single product by ID (dynamic route — put LAST)
productRoute.get("/:id", productController.singleProduct);

// Update product by ID (optional multiple new images)
productRoute.put(
  "/update/:id",
  upload.array("images", 5),
  productController.updateProduct
);

// Delete product by ID
productRoute.delete("/delete/:id", productController.deleteProduct);

export default productRoute;
