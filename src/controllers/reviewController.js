import Review from "../models/reviewModel.js";
import cloudinary from "../utils/cloudinary.js";

// CREATE REVIEW
export const createReview = async (req, res) => {
  try {
    const { product, user, rating, comment } = req.body;

    if (!product || !user || !rating) {
      return res
        .status(400)
        .json({ message: "Product, user and rating are required." });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5." });
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
      imagePublicId = result.public_id; // save public_id for later deletion if needed
    }

    const newReview = new Review({
      product,
      user,
      rating,
      comment,
      image: imageUrl,
      imagePublicId, // store this in your schema if possible
    });

    await newReview.save();

    res.status(201).json({ message: "Review submitted", review: newReview });
  } catch (error) {
    console.error("Error creating review:", error);
    res
      .status(500)
      .json({ message: "Error submitting review", error: error.message });
  }
};

// GET ALL REVIEWS FOR A PRODUCT
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};

// DELETE REVIEW BY ID
export const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Delete associated image from cloudinary (if public_id stored)
    if (review.imagePublicId) {
      await cloudinary.uploader.destroy(review.imagePublicId);
    } else if (review.image) {
      // fallback: fragile way to parse publicId (not recommended)
      const segments = review.image.split("/");
      const lastSegment = segments[segments.length - 1];
      const publicId = lastSegment.split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res
      .status(500)
      .json({ message: "Error deleting review", error: error.message });
  }
};
