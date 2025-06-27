import fs from "fs";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import cloudinary from "../utils/cloudinary.js";

// Helper to safely parse JSON arrays
function safeParseArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Create product
async function createProduct(req, res) {
  try {
    let {
      name,
      description,
      price,
      oldPrice,
      discount,
      stock,
      stockCount,
      brand,
      categoryName,
      features,
    } = req.body;

    if (!name || !description || !price || !categoryName) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    price = parseFloat(price);
    oldPrice = oldPrice ? parseFloat(oldPrice) : null;
    discount = discount ? parseFloat(discount) : 0;
    stock = stock === "true" || stock === true;
    stockCount = stockCount ? parseInt(stockCount) : 0;

    if (isNaN(price) || price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }

    features = safeParseArray(features);

    // Find or create category
    let category = await Category.findOne({ name: categoryName });
    if (!category) {
      category = await Category.create({ name: categoryName });
    }

    if (!req.files || !req.files.length) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // Upload images to Cloudinary
    const uploadResults = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "products" })
      )
    );
    req.files.forEach((file) => fs.unlinkSync(file.path)); // delete temp files

    const images = uploadResults.map((r) => r.secure_url);

    const newProduct = await Product.create({
      name,
      description,
      price,
      oldPrice,
      discount,
      stock,
      stockCount,
      brand,
      images,
      features,
      category: category._id,
    });

    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Get all products
async function allProducts(req, res) {
  try {
    const products = await Product.find().populate("category", "name");
    res.status(200).json(products);
  } catch (error) {
    console.error("Fetch all products error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Get single product by ID
async function singleProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Fetch single product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Update product
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert types
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.oldPrice)
      updateData.oldPrice = parseFloat(updateData.oldPrice);
    if (updateData.discount)
      updateData.discount = parseFloat(updateData.discount);
    if (updateData.stockCount)
      updateData.stockCount = parseInt(updateData.stockCount);
    if (updateData.stock) updateData.stock = updateData.stock === "true";

    // Parse arrays
    if (updateData.features && typeof updateData.features === "string") {
      updateData.features = safeParseArray(updateData.features);
    }

    // Handle category change
    if (updateData.categoryName) {
      let category = await Category.findOne({ name: updateData.categoryName });
      if (!category) {
        category = await Category.create({ name: updateData.categoryName });
      }
      updateData.category = category._id;
      delete updateData.categoryName;
    }

    // Handle new images upload
    if (req.files && req.files.length) {
      const uploadResults = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, { folder: "products" })
        )
      );
      req.files.forEach((file) => fs.unlinkSync(file.path));
      updateData.images = uploadResults.map((r) => r.secure_url);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("category", "name");

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res
      .status(200)
      .json({ message: "Product updated", product: updatedProduct });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Delete product
async function deleteProduct(req, res) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Search products
async function searchProducts(req, res) {
  try {
    const { query } = req.query;
    if (!query)
      return res.status(400).json({ message: "Query param required" });

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    }).populate("category", "name");

    if (!products.length)
      return res.status(404).json({ message: "No products found" });

    res.status(200).json(products);
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
// Search products by category name (query param: ?category=CategoryName)
async function searchByCategory(req, res) {
  try {
    const { category } = req.query;
    if (!category) {
      return res
        .status(400)
        .json({ message: "Category query param is required" });
    }

    // Find category by name (case-insensitive)
    const categoryDoc = await Category.findOne({
      name: { $regex: `^${category}$`, $options: "i" },
    });

    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Find products in this category
    const products = await Product.find({ category: categoryDoc._id }).populate(
      "category",
      "name"
    );

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this category" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Search by category error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export default {
  createProduct,
  allProducts,
  singleProduct,
  updateProduct,
  deleteProduct,
  searchByCategory,
  searchProducts,
};
