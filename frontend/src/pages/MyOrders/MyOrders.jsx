import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";
import "./MyOrders.css";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewId, setReviewId] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        {
          headers: { token },
        },
      );

      if (response.data.success) {
        setData(response.data.orders || []);
      } else {
        setData([]);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load orders when token changes
  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setData([]);
      setLoading(false);
    }
  }, [token]);

  // Open review form and check whether the user has already reviewed this food
  const openReviewForm = async (food) => {
    setSelectedFood(food);
    setRating(5);
    setComment("");
    setReviewId(null);
    setReviewMessage("");
    setReviewError("");
    setShowReviewForm(true);

    try {
      setReviewLoading(true);

      const response = await axios.get(`${url}/api/review/user/${food._id}`, {
        headers: { token },
      });

      if (response.data.success && response.data.review) {
        const existingReview = response.data.review;

        setReviewId(existingReview._id);
        setRating(existingReview.rating);
        setComment(existingReview.comment);
      }
    } catch (error) {
      console.log("Error fetching user review:", error);
      setReviewError("Could not load your existing review.");
    } finally {
      setReviewLoading(false);
    }
  };

  // Submit a new review or update an existing review
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!selectedFood) return;

    if (comment.trim().length < 3) {
      setReviewError("Please write at least 3 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setReviewError("");
      setReviewMessage("");

      let response;

      if (reviewId) {
        // Update existing review
        response = await axios.put(
          `${url}/api/review/update/${reviewId}`,
          {
            rating,
            comment: comment.trim(),
          },
          {
            headers: { token },
          },
        );
      } else {
        // Add new review
        response = await axios.post(
          `${url}/api/review/add`,
          {
            foodId: selectedFood._id,
            rating,
            comment: comment.trim(),
          },
          {
            headers: { token },
          },
        );
      }

      if (response.data.success) {
        setReviewMessage(
          reviewId
            ? "Your review has been updated!"
            : "Thank you! Your review has been submitted.",
        );

        // Store the returned review ID so the form knows this is now an existing review
        if (response.data.review?._id) {
          setReviewId(response.data.review._id);
        }
      }
    } catch (error) {
      console.log("Review submission error:", error);

      setReviewError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeReviewForm = () => {
    setShowReviewForm(false);
    setSelectedFood(null);
    setReviewMessage("");
    setReviewError("");
  };

  return (
    <div className="my-orders">
      <h2>My Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="container">
          {data.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            data.map((order) => (
              <div key={order._id} className="my-orders-order">
                <img src={assets.parcel_icon} alt="Parcel" />

                <div className="order-food-list">
                  {order.items?.map((item, index) => (
                    <div className="order-food-item" key={item._id || index}>
                      <p>
                        {item.name} x {item.quantity}
                      </p>

                      {order.payment === true &&
                        order.status === "Delivered" && (
                          <button
                            className="review-button"
                            onClick={() => openReviewForm(item)}
                          >
                            Write a Review
                          </button>
                        )}
                    </div>
                  ))}
                </div>

                <p>₹{order.amount}</p>

                <p className="order-status">
                  <span
                    className={order.status === "Delivered" ? "delivered" : ""}
                  >
                    {order.status}
                  </span>
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Review Modal */}
      {showReviewForm && selectedFood && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <button
              className="review-close-button"
              onClick={closeReviewForm}
              type="button"
            >
              ×
            </button>

            <h2>Rate Your Food</h2>
            <h3>{selectedFood.name}</h3>

            {reviewLoading ? (
              <p>Loading review...</p>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <label>How would you rate this food?</label>

                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={star <= rating ? "active" : ""}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <p className="rating-text">{rating} out of 5 stars</p>

                <label htmlFor="review-comment">Share your experience</label>

                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked or disliked..."
                  minLength={3}
                  maxLength={500}
                  required
                />

                <p className="character-count">
                  {comment.length}/500 characters
                </p>

                {reviewError && <p className="review-error">{reviewError}</p>}

                {reviewMessage && (
                  <p className="review-success">{reviewMessage}</p>
                )}

                <button
                  type="submit"
                  className="review-submit-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : reviewId
                      ? "Update Review"
                      : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
