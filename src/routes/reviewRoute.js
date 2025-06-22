import express from "express";

import multer from "multer";
import {
  createReview,
  deleteReview,
  getProductReviews,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();
const upload = multer({ dest: "uploads/" });
reviewRouter.post("/create", upload.single("image"), createReview);
reviewRouter.get("/:productId", getProductReviews);
reviewRouter.delete("/delete/:reviewId", deleteReview);

export default reviewRouter;
