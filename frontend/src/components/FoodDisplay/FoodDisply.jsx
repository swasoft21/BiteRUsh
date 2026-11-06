import { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { useNavigate } from "react-router-dom";

const FoodDisply = ({ category, setShowLogin }) => {
  const { food_list, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const filteredFoods = food_list.filter((item) => {
    return category === "All" || category === item.category;
  });

  const displayedFoods = filteredFoods.slice(0, 8);

  return (
    <div className="food-display" id="food-display">
      {/* Hero Section */}

      {/* Food Heading */}
      <div className="food-display-heading">
        <div>
          <span className="food-section-tag">OUR MENU</span>
          <h2>Top dishes near you</h2>
          <p>Explore our most popular and delicious dishes.</p>
        </div>
      </div>

      {/* Food Grid */}
      <div className="food-display-list">
        {displayedFoods.map((item) => (
          <FoodItem
            key={item._id}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
            setShowLogin={setShowLogin}
          />
        ))}
      </div>

      {filteredFoods.length === 0 && (
        <p className="no-food-message">No food items found.</p>
      )}

      {/* View All Button */}
      {filteredFoods.length > 8 && (
        <div className="view-all-container">
          <button
            className="view-all-foods-btn"
            onClick={() => navigate("/foods")}
          >
            View All Foods
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodDisply;
