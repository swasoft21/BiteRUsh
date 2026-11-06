import { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItem, addToCart, removeFromCart, url, token } =
    useContext(StoreContext);

  const [message, setMessage] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch actual food rating
  useEffect(() => {
    const fetchRating = async () => {
      try {
        setRatingLoading(true);

        const response = await axios.get(`${url}/api/review/food/${id}`);

        if (response.data.success) {
          setAverageRating(response.data.averageRating || 0);
          setTotalReviews(response.data.totalReviews || 0);
        }
      } catch (error) {
        console.error("Food rating error:", error);
        setAverageRating(0);
        setTotalReviews(0);
      } finally {
        setRatingLoading(false);
      }
    };

    fetchRating();
  }, [url, id]);

  const handleAddToCart = () => {
    if (!token) {
      setMessage("Please login first!");
      return;
    }

    setMessage("");
    addToCart(id);
  };

  const handleNutritionClick = () => {
    navigate(`/nutrition/${id}`);
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
          src={url + "/images/" + image}
          alt={name}
          className="food-item-image"
        />

        {!cartItem[id] ? (
          <img
            className="add"
            onClick={handleAddToCart}
            src={assets.add_icon_white}
            alt="Add"
          />
        ) : (
          <div className="food-item-Counter">
            <img
              onClick={() => removeFromCart(id)}
              src={assets.remove_icon_red}
              alt="Remove"
            />

            <p>{cartItem[id]}</p>

            <img
              onClick={handleAddToCart}
              src={assets.add_icon_green}
              alt="Add"
            />
          </div>
        )}
      </div>

      {message && <p className="login-error">{message}</p>}

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>

          <div className="food-rating">
            {ratingLoading ? (
              <span className="rating-count">Loading...</span>
            ) : totalReviews > 0 ? (
              <>
                <span className="rating-star">★</span>
                <span className="rating-value">{averageRating.toFixed(1)}</span>
                <span className="rating-count">({totalReviews})</span>
              </>
            ) : (
              <span className="rating-count">No reviews</span>
            )}
          </div>
        </div>

        <p className="food-item-desc">{description}</p>

        <p className="food-item-price">₹{price}</p>

        <button className="view-nutrition-btn" onClick={handleNutritionClick}>
          ✦ View Nutrition
        </button>
      </div>
    </div>
  );
};

export default FoodItem;
