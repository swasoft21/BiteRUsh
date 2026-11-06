/* eslint-disable react-refresh/only-export-components */

import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = "http://localhost:4000";

  const [food_list, setFoodList] = useState([]);
  const [cartItem, setCartItem] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || "");

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

  // Load Cart Data
  const loadCartData = async (userToken) => {
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        {},
        {
          headers: {
            token: userToken,
          },
        },
      );

      if (response.data.success) {
        setCartItem(response.data.cartData || {});
      }
    } catch (error) {
      console.log("Error loading cart:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setToken("");
        setCartItem({});
      }
    }
  };

  // Load Initial Data
  useEffect(() => {
    fetchFoodList();

    if (token) {
      loadCartData(token);
    }
  }, []);

  // Add Item to Cart
  const addToCart = async (itemId) => {
    setCartItem((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          {
            headers: { token },
          },
        );
      } catch (error) {
        console.log("Error adding to cart:", error);
      }
    }
  };

  // Remove Item from Cart
  const removeFromCart = async (itemId) => {
    setCartItem((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          {
            headers: { token },
          },
        );
      } catch (error) {
        console.log("Error removing from cart:", error);
      }
    }
  };

  // Calculate Total Cart Amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItem) {
      if (cartItem[item] > 0) {
        const itemInfo = food_list.find((product) => product._id === item);

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
    loadCartData,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
