import categorySchema from "../models/categoryModel.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "Name and description are required" });
    }

    const existingCategory = await categorySchema.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "categories",
    });

    fs.unlinkSync(req.file.path);

    const newCategory = await categorySchema.create({
      name,
      description,
      image: result.secure_url,
    });

    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Cloudinary upload or DB error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Get All Categories
async function allCategory(req, res) {
  const findCategory = await categorySchema.find();
  res.status(200).json(findCategory);
}

// Get Single  Categories
async function singleCategory(req, res) {
  try {
    const { categoryId } = req.params;

    const category = await categorySchema.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Find the existing category first
    const category = await categorySchema.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    let imageUrl = category.image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
      });
      imageUrl = result.secure_url;

      // Remove temp file
      fs.unlinkSync(req.file.path);
    }

    // Update fields
    category.name = name || category.name;
    category.description = description || category.description;
    category.image = imageUrl;

    const updatedCategory = await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
// Delete Category
async function deleteCategory(req, res) {
  const { id } = req.body;

  try {
    const removeCategory = await categorySchema.findByIdAndDelete(id);

    if (!removeCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error deleting category", error: err.message });
  }
}

export default {
  createCategory,
  allCategory,
  singleCategory,
  updateCategory,
  deleteCategory,
};
