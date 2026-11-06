import mongoose from "mongoose";
import reviewModel from "../models/reviewModel.js";
import orderModel from "../models/orderModel.js";

// Add a review
const addReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { foodId, rating, comment } = req.body;

    // Validate food ID
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    // Validate rating
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    // Validate comment
    const trimmedComment = typeof comment === "string" ? comment.trim() : "";

    if (trimmedComment.length < 3 || trimmedComment.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comment must contain 3 to 500 characters",
      });
    }

    // Check whether the user has a paid and delivered order containing this food
    const deliveredOrder = await orderModel.findOne({
      userId,
      payment: true,
      status: "Delivered",
      items: {
        $elemMatch: {
          _id: String(foodId),
        },
      },
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        success: false,
        message:
          "You can review this food only after purchasing and receiving it",
      });
    }

    // Check whether the user has already reviewed this food
    const existingReview = await reviewModel.findOne({
      userId,
      foodId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this food",
      });
    }

    const newReview = new reviewModel({
      userId,
      foodId,
      orderId: deliveredOrder._id,
      rating: numericRating,
      comment: trimmedComment,
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    // Handles duplicate review attempts caused by simultaneous requests
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this food",
      });
    }

    console.log("Add review error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add review",
    });
  }
};

// Get all reviews for a food item
const getFoodReviews = async (req, res) => {
  try {
    const { foodId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    const reviews = await reviewModel
      .find({ foodId })
      .select("rating comment createdAt")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating = totalReviews
      ? Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          ).toFixed(1),
        )
      : 0;

    res.json({
      success: true,
      totalReviews,
      averageRating,
      reviews,
    });
  } catch (error) {
    console.log("Get reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get reviews",
    });
  }
};

// Get the logged-in user's review for a food item
const getUserReview = async (req, res) => {
  try {
    const { foodId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    const review = await reviewModel.findOne({
      userId: req.userId,
      foodId,
    });

    res.json({
      success: true,
      review,
    });
  } catch (error) {
    console.log("Get user review error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get your review",
    });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const numericRating = Number(rating);
    const trimmedComment = typeof comment === "string" ? comment.trim() : "";

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    if (trimmedComment.length < 3 || trimmedComment.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comment must contain 3 to 500 characters",
      });
    }

    // userId ensures users can update only their own reviews
    const updatedReview = await reviewModel.findOneAndUpdate(
      {
        _id: reviewId,
        userId: req.userId,
      },
      {
        rating: numericRating,
        comment: trimmedComment,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not allowed to update it",
      });
    }

    res.json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.log("Update review error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update review",
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // userId ensures users can delete only their own reviews
    const deletedReview = await reviewModel.findOneAndDelete({
      _id: reviewId,
      userId: req.userId,
    });

    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not allowed to delete it",
      });
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log("Delete review error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete review",
    });
  }
};

export { addReview, getFoodReviews, getUserReview, updateReview, deleteReview };
