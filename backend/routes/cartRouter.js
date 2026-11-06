import express from "express";
import { addToCart, getCartItems, removeFromCart } from "../controllers/cartController.js";

import authMiddleware from "../middleware/auth.js";
const cartRouter = express.Router();

cartRouter.post("/test", (req, res) => {
  res.json({
    success: true,
    message: "Cart route is working"
  });
});
console.log("🔥 CART ROUTER FILE LOADED");

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.post("/get", authMiddleware, getCartItems);
cartRouter.post("/remove", authMiddleware, removeFromCart);


export default cartRouter;