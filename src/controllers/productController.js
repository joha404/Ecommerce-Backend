import fs from "fs";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import cloudinary from "../utils/cloudinary.js";

async function createProduct(req, res) {
  try {
    let { name, description, price, oldPrice, stock, categoryName, features } =
      req.body;

    // Parse features once here
    try {
      features = typeof features === "string" ? JSON.parse(features) : features;
      if (!Array.isArray(features)) features = [];
    } catch {
      features = [];
    }

    price = parseFloat(price);

    if (!name || !description || !price || !categoryName) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    if (isNaN(price) || price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a valid positive number" });
    }

    oldPrice = oldPrice ? parseFloat(oldPrice) : null;
    stock = stock === "true" || stock === true;

    // Find or create category
    let category = await Category.findOne({ name: categoryName });
    if (!category) {
      category = await Category.create({ name: categoryName });
    }

    if (!req.files || !req.files.length) {
      return res
        .status(400)
        .json({ message: "At least one image file is required" });
    }

    // Upload multiple images to Cloudinary
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path, { folder: "products" })
    );
    const uploadResults = await Promise.all(uploadPromises);

    // Remove temp files
    req.files.forEach((file) => fs.unlinkSync(file.path));

    // Extract URLs
    const images = uploadResults.map((result) => result.secure_url);

    const newProduct = await Product.create({
      name,
      description,
      price,
      oldPrice,
      stock,
      images,
      features,
      category: category._id,
    });

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
}

// Get all products with category names
async function allProducts(req, res) {
  try {
    const products = await Product.find().populate("category", "name");
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
}

// Get a single product by ID
async function singleProduct(req, res) {
  const { id } = req.params;

  try {
    const product = await Product.findById(id).populate("category", "name");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product retrieved successfully", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving product", error: error.message });
  }
}
//  Get Product By CategoryId
async function getProductsByCategoryId(req, res) {
  const category = req.params.id;

  if (!category) {
    return res.status(400).json({ message: "Category ID is required" });
  }

  try {
    const products = await Product.find({ category }).populate(
      "category",
      "name"
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("Error retrieving products by category:", error);
    res.status(500).json({
      message: "Error retrieving product",
      error: error.message,
    });
  }
}

// Update a product, support optional new images and features
async function updateProduct(req, res) {
  const { id } = req.params;
  const updateData = { ...req.body };

  try {
    // Parse features if sent as JSON string
    if (updateData.features && typeof updateData.features === "string") {
      try {
        updateData.features = JSON.parse(updateData.features);
        if (!Array.isArray(updateData.features)) updateData.features = [];
      } catch {
        updateData.features = [];
      }
    }

    // Handle categoryName update
    if (updateData.categoryName) {
      let category = await Category.findOne({ name: updateData.categoryName });
      if (!category) {
        category = await Category.create({ name: updateData.categoryName });
      }
      updateData.category = category._id;
      delete updateData.categoryName;
    }

    // If new images uploaded, upload them and update images array
    if (req.files && req.files.length) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "products" })
      );
      const uploadResults = await Promise.all(uploadPromises);
      req.files.forEach((file) => fs.unlinkSync(file.path));
      updateData.images = uploadResults.map((r) => r.secure_url);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("category", "name");

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
}

// Delete a product
async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
}

// Search products by name or description (case-insensitive)
async function searchProducts(req, res) {
  try {
    const { query } = req.query;
    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Query is required" });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    }).populate("category", "name");

    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found" });
    }

    res.status(200).json({ success: true, data: products });
  } catch (err) {
    console.error("Error during search:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export default {
  createProduct,
  allProducts,
  singleProduct,
  getProductsByCategoryId,
  updateProduct,
  deleteProduct,
  searchProducts,
};
