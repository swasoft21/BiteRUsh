import express from "express";
import authMiddleware from "../middleware/auth.js";

import {
  addReview,
  getFoodReviews,
  getUserReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// Public: get all reviews for a food item
reviewRouter.get("/food/:foodId", getFoodReviews);

// Customer: get their own review
reviewRouter.get("/user/:foodId", authMiddleware, getUserReview);

// Customer: add a review
reviewRouter.post("/add", authMiddleware, addReview);

// Customer: update their review
reviewRouter.put("/update/:reviewId", authMiddleware, updateReview);

// Customer: delete their review
reviewRouter.delete("/delete/:reviewId", authMiddleware, deleteReview);

export default reviewRouter;
