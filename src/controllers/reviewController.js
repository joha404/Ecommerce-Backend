import Review from "../models/reviewModel.js";
import cloudinary from "../utils/cloudinary.js";

// CREATE REVIEW
export const createReview = async (req, res) => {
  try {
    const { product, user, rating, comment } = req.body;
    let imageUrl = "";

    // Upload image if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const newReview = new Review({
      product,
      user,
      rating,
      comment,
      image: imageUrl,
    });

    await newReview.save();

    res.status(201).json({ message: "Review submitted", review: newReview });
  } catch (error) {
    res.status(500).json({ message: "Error submitting review", error });
  }
};

// GET ALL REVIEWS FOR A PRODUCT
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
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

    // Optional: delete associated image from cloudinary
    if (review.image) {
      const publicId = review.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error });
  }
};
