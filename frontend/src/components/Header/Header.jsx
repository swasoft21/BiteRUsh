import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import "./Header.css";

const Header = () => {
  const { food_list, url } = useContext(StoreContext);
  const navigate = useNavigate();

  return (
    <div
      className="food-hero"
      style={
        food_list.length > 0
          ? {
              backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.82), rgba(0,0,0,0.2)), url("${url}/images/${food_list[0].image}")`,
            }
          : {}
      }
    >
      <div className="food-hero-content">
        <span className="food-hero-tag">FRESH • TASTY • DELICIOUS</span>

        <h1>Good Food, Good Mood!</h1>

        <p>
          Discover delicious meals made fresh for you. Order your favourites and
          enjoy every bite.
        </p>

        <button onClick={() => navigate("/foods")}>Explore All Foods</button>
      </div>
    </div>
  );
};

export default Header;
