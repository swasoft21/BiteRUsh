import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:4000";

  const [food_list, setFoodList] = useState([]);
  const [cartItem, setCartItem] = useState({});
  const [token, setToken] = useState("");

  // Fetch Food List
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);

      if (response.data.success) {
        setFoodList(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching food list:", error);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await fetchFoodList();

      const savedToken = localStorage.getItem("token");

      if (savedToken) {
        setToken(savedToken);
      }
    };

    loadData();
  }, []);

  // Add item to cart
  const addToCart = (itemId) => {
    if (!cartItem[itemId]) {
      setCartItem((prev) => ({
        ...prev,
        [itemId]: 1,
      }));
    } else {
      setCartItem((prev) => ({
        ...prev,
        [itemId]: prev[itemId] + 1,
      }));
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItem((prev) => ({
      ...prev,
      [itemId]: prev[itemId] - 1,
    }));
  };

  // Total Cart Amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItem) {
      if (cartItem[item] > 0) {
        const itemInfo = food_list.find(
          (product) => product._id === item
        );

        if (itemInfo) {
          totalAmount += itemInfo.price * cartItem[item];
        }
      }
    }

    return totalAmount;
  };

  const contextValue = {
    food_list,
    cartItem,
    setCartItem,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    fetchFoodList,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;