import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../Context/StoreContext";
import "./FoodNutrition.css";

const FoodNutrition = () => {
  const { url } = useContext(StoreContext);
  const { foodId } = useParams();
  const navigate = useNavigate();

  const [food, setFood] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchNutrition = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${url}/api/nutrition/${foodId}`);

        if (response.data.success) {
          setFood(response.data.food);
          setNutrition(response.data.nutrition);
        } else {
          setError("Unable to load nutrition details.");
        }
      } catch (error) {
        console.error("Nutrition error:", error);

        setError(
          error.response?.data?.message || "Unable to load nutrition details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNutrition();
  }, [url, foodId]);
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);

        const response = await axios.get(`${url}/api/review/food/${foodId}`);

        if (response.data.success) {
          setReviews(response.data.reviews || []);
          setAverageRating(response.data.averageRating || 0);
          setTotalReviews(response.data.totalReviews || 0);
        }
      } catch (error) {
        console.error("Reviews error:", error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [url, foodId]);
  if (loading) {
    return (
      <div className="nutrition-loading">
        <div className="nutrition-spinner"></div>
        <h3>Preparing your nutrition report...</h3>
        <p>Checking available nutrition data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nutrition-error">
        <h2>Oops!</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  if (!food || !nutrition) return null;

  const values = [
    { label: "Calories", key: "calories", unit: "kcal" },
    { label: "Protein", key: "protein", unit: "g" },
    { label: "Carbohydrates", key: "carbohydrates", unit: "g" },
    { label: "Fat", key: "fat", unit: "g" },
    { label: "Fiber", key: "fiber", unit: "g" },
    { label: "Sugar", key: "sugar", unit: "g" },
  ];

  const isCalculated = nutrition.source === "calculated";
  const isUnavailable = nutrition.source === "unavailable";

  // Ingredient-level nutrition breakdown returned by backend
  const ingredientBreakdown = nutrition.ingredientBreakdown || [];

  const formatValue = (value, unit = "g") => {
    if (value === null || value === undefined) {
      return "N/A";
    }

    return `${Number(value).toFixed(1)} ${unit}`;
  };

  return (
    <div className="nutrition-page">
      <button className="nutrition-back" onClick={() => navigate(-1)}>
        ← Back to Menu
      </button>

      {/* Food information */}
      <div className="nutrition-header">
        <img
          src={`${url}/images/${food.image}`}
          alt={food.name}
          className="nutrition-food-image"
        />

        <div className="nutrition-food-info">
          <span className="ai-label">✦ BiteRush Nutrition Report</span>

          <h1>{food.name}</h1>
          <p>{food.description}</p>
          <h3>₹{food.price}</h3>

          <p>Serving: {nutrition.servingSize || "Not specified"}</p>
        </div>
      </div>

      {/* Nutrition facts */}
      <section className="nutrition-section">
        <h2>Nutrition Facts</h2>

        <div className="nutrition-source">
          <span
            className={isCalculated ? "source-estimated" : "source-unavailable"}
          >
            {isCalculated
              ? "✓ USDA-based nutrition estimate"
              : "Nutrition data unavailable"}
          </span>

          <p>Source: {nutrition.sourceName || "Not available"}</p>
          <p>Values shown {nutrition.basis || "per serving"}.</p>
        </div>

        {isUnavailable ? (
          <p>
            We could not calculate complete nutrition information for this food.
            Please try again later.
          </p>
        ) : (
          <div className="nutrition-grid">
            {values.map((item) => {
              const value = nutrition.nutrition?.[item.key];

              return (
                <div className="nutrition-card" key={item.key}>
                  <p>{item.label}</p>

                  <h2>{formatValue(value, item.unit)}</h2>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Ingredient list */}
      {nutrition.ingredients?.length > 0 && (
        <section className="nutrition-section">
          <h2>Ingredients</h2>

          <div className="nutrition-tags">
            {nutrition.ingredients.map((item, index) => (
              <span key={index}>
                {typeof item === "string" ? item : item.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Ingredient nutrition breakdown */}
      {ingredientBreakdown.length > 0 && (
        <section className="nutrition-section">
          <h2>Ingredient Nutrition Breakdown</h2>

          <p>
            Estimated nutrition contributed by each ingredient according to its
            weight.
          </p>

          <div className="ingredient-breakdown-list">
            {ingredientBreakdown.map((item, index) => (
              <div className="ingredient-breakdown-card" key={index}>
                <div className="ingredient-breakdown-header">
                  <h3>{item.name}</h3>

                  <span>
                    {item.quantity} {item.unit || "g"}
                  </span>
                </div>

                <div className="ingredient-nutrition-grid">
                  <p>
                    Calories:{" "}
                    <strong>
                      {formatValue(item.nutrition?.calories, "kcal")}
                    </strong>
                  </p>

                  <p>
                    Protein:{" "}
                    <strong>{formatValue(item.nutrition?.protein)}</strong>
                  </p>

                  <p>
                    Carbs:{" "}
                    <strong>
                      {formatValue(item.nutrition?.carbohydrates)}
                    </strong>
                  </p>

                  <p>
                    Fat: <strong>{formatValue(item.nutrition?.fat)}</strong>
                  </p>

                  <p>
                    Fiber: <strong>{formatValue(item.nutrition?.fiber)}</strong>
                  </p>

                  <p>
                    Sugar: <strong>{formatValue(item.nutrition?.sugar)}</strong>
                  </p>
                </div>

                {item.matchedFoodName && (
                  <p className="ingredient-source-name">
                    USDA match: {item.matchedFoodName}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nutrition insights */}
      <section className="nutrition-section">
        <h2>Nutrition Insights</h2>

        {nutrition.healthInsights?.length > 0 ? (
          <ul className="nutrition-insights">
            {nutrition.healthInsights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>Nutrition insights are not available.</p>
        )}
      </section>

      {/* Allergens */}
      <section className="nutrition-section">
        <h2>Possible Allergens</h2>

        {nutrition.possibleAllergens?.length > 0 ? (
          <div className="nutrition-tags allergen-tags">
            {nutrition.possibleAllergens.map((item, index) => (
              <span key={index}>{item}</span>
            ))}
          </div>
        ) : (
          <p>
            No allergen information was confirmed. Please check with the
            restaurant.
          </p>
        )}
      </section>

      {/* Disclaimer */}
      <div className="nutrition-disclaimer">
        <strong>Important:</strong>{" "}
        {nutrition.estimateNote ||
          "Nutrition values are estimates and may vary."}{" "}
        Always confirm ingredients and allergens with the restaurant. This
        report is for general information, not medical advice.
      </div>
      {/* Customer Reviews */}
      <section className="nutrition-section reviews-section">
        <h2>Customer Reviews</h2>

        {reviewsLoading ? (
          <p>Loading customer reviews...</p>
        ) : (
          <>
            <div className="reviews-summary">
              <div className="reviews-average">
                <h1>{averageRating.toFixed(1)}</h1>

                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= Math.round(averageRating) ? "active" : ""
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>

                <p>{totalReviews} customer reviews</p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="no-reviews">
                <h3>No reviews yet</h3>
                <p>Be the first customer to review this food!</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div className="review-card" key={review._id}>
                    <div className="review-card-header">
                      <h3>Customer</h3>

                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= review.rating ? "active" : ""}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default FoodNutrition;
