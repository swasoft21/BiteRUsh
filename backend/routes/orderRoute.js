import express from "express";
import {
  placeOrder,
  verifyOrder,
  userOrders,
  allOrders,
  updateOrderStatus,
  getSalesAnalytics,
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", authMiddleware, verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);

// Admin: get all orders
orderRouter.get("/list", allOrders);
// Update order status
orderRouter.post("/status", (req, res) => {
  console.log("STATUS ROUTE REACHED");
  console.log("Request body:", req.body);

  updateOrderStatus(req, res);
});

orderRouter.get("/analytics", getSalesAnalytics);
export default orderRouter;
