import express from "express";
import { addToCart, getCartItems, removeFromCart } from "../controllers/cartController.js";

import authMiddleware from "../middleware/auth.js";
const cartRouter = express.Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.get("/get", authMiddleware, getCartItems);
cartRouter.delete("/remove/:id", authMiddleware, removeFromCart);

export default cartRouter;