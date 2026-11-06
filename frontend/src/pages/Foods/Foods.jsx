import { useContext, useEffect, useMemo, useState } from "react";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import "./Foods.css";

// Shuffle food items using Fisher-Yates algorithm
const shuffleFoods = (foods) => {
  const shuffled = [...foods];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const Foods = () => {
  const { food_list } = useContext(StoreContext);

  const [shuffledFoods, setShuffledFoods] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("default");

  // Shuffle whenever food data loads or changes
  useEffect(() => {
    if (food_list.length > 0) {
      setShuffledFoods(shuffleFoods(food_list));
    } else {
      setShuffledFoods([]);
    }
  }, [food_list]);

  // Get categories from food database
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(food_list.map((food) => food.category).filter(Boolean)),
    ];
  }, [food_list]);

  // Search, filter and sort food items
  const filteredFoods = useMemo(() => {
    let result = [...shuffledFoods];

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((food) => food.category === selectedCategory);
    }

    // Search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase().trim();

      result = result.filter((food) =>
        `${food.name} ${food.description || ""}`.toLowerCase().includes(search),
      );
    }

    // Sorting
    if (sortOption === "low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "high-low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [shuffledFoods, selectedCategory, searchText, sortOption]);

  return (
    <div className="foods-page">
      {/* Page Heading */}
      <div className="foods-page-header">
        <span>DISCOVER YOUR FAVOURITE</span>
        <h1>Explore All Foods</h1>
        <p>Find delicious meals for every mood and every moment.</p>
      </div>

      {/* Search and Sort */}
      <div className="foods-toolbar">
        <div className="foods-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search your favourite food..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="foods-sort">
          <label htmlFor="food-sort">Sort by:</label>

          <select
            id="food-sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Sidebar and Food Items */}
      <div className="foods-layout">
        {/* Category Sidebar */}
        <aside className="foods-sidebar">
          <h3>Categories</h3>

          {categories.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? "category-option active"
                  : "category-option"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </aside>

        {/* Food Results */}
        <main className="foods-results">
          <div className="foods-results-heading">
            <h2>
              {selectedCategory === "All" ? "All Food Items" : selectedCategory}
            </h2>

            <p>{filteredFoods.length} items found</p>
          </div>

          {filteredFoods.length > 0 ? (
            <div className="foods-grid">
              {filteredFoods.map((item) => (
                <FoodItem
                  key={item._id}
                  id={item._id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                />
              ))}
            </div>
          ) : (
            <div className="foods-empty">
              <h3>No food items found</h3>

              <p>Try another search or select a different category.</p>

              <button
                onClick={() => {
                  setSearchText("");
                  setSelectedCategory("All");
                  setSortOption("default");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Foods;
