import orderModel from "../models/orderModel.js";
import userModel from "../models/userModal.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.stripe_secret_key);

// Place Order
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";

  try {
    // Create order
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    await newOrder.save();

    // Create Stripe line items
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",

        product_data: {
          name: item.name,
        },

        unit_amount: Math.round(item.price * 100),
      },

      quantity: item.quantity,
    }));

    // Add delivery charge
    line_items.push({
      price_data: {
        currency: "usd",

        product_data: {
          name: "Delivery Charges",
        },

        unit_amount: 300,
      },

      quantity: 1,
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,

      mode: "payment",

      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,

      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    // Clear user's cart
    await userModel.findByIdAndUpdate(req.body.userId, {
      cartData: {},
    });

    // Send response
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      session_url: session.url,
    });
  } catch (error) {
    console.error("Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Error placing order",
      error: error.message,
    });
  }
};

// Verify Order
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, {
        payment: true,
      });

      return res.status(200).json({
        success: true,
        message: "Payment successful and order verified",
      });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({
        success: false,
        message: "Payment failed or cancelled, order deleted",
      });
    }

    // Payment failed or cancelled
  } catch (error) {
    console.error("Order Verification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error verifying order",
      error: error.message,
    });
  }
};

//user order for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user orders",
      error: error.message,
    });
  }
};

// Get all orders for admin
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ _id: -1 });

    res.json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching all orders",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const allowedStatuses = [
      "Food Processing",
      "Food Packed",
      "On the Way",
      "Delivered",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
    });
  }
};

const getSalesAnalytics = async (req, res) => {
  try {
    const period = req.query.period || "7days";

    const now = new Date();
    let startDate = new Date(now);

    if (period === "7days") {
      startDate.setUTCDate(startDate.getUTCDate() - 6);
    } else if (period === "30days") {
      startDate.setUTCDate(startDate.getUTCDate() - 29);
    } else if (period === "12months") {
      startDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1),
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid period",
      });
    }

    const orders = await orderModel
      .find({
        date: { $gte: startDate, $lte: now },
      })
      .lean();

    const paidOrders = orders.filter((order) => order.payment === true);

    const totalRevenue = paidOrders.reduce(
      (total, order) => total + Number(order.amount || 0),
      0,
    );

    const totalOrders = orders.length;
    const paidOrderCount = paidOrders.length;
    const averageOrderValue =
      paidOrderCount > 0 ? totalRevenue / paidOrderCount : 0;

    // Prepare chart buckets
    const salesMap = new Map();
    const orderMap = new Map();

    const getKey = (date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");

      if (period === "12months") {
        return `${year}-${month}`;
      }

      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const cursor = new Date(startDate);

    if (period === "12months") {
      cursor.setUTCDate(1);
      while (cursor <= now) {
        const key = getKey(cursor);
        salesMap.set(key, 0);
        orderMap.set(key, 0);
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }
    } else {
      cursor.setUTCHours(0, 0, 0, 0);
      while (cursor <= now) {
        const key = getKey(cursor);
        salesMap.set(key, 0);
        orderMap.set(key, 0);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
    }

    // Count all orders and revenue from paid orders
    orders.forEach((order) => {
      const key = getKey(new Date(order.date));

      if (orderMap.has(key)) {
        orderMap.set(key, orderMap.get(key) + 1);
      }

      if (order.payment === true && salesMap.has(key)) {
        salesMap.set(key, salesMap.get(key) + Number(order.amount || 0));
      }
    });

    const sales = Array.from(salesMap, ([date, revenue]) => ({
      date,
      revenue,
      orders: orderMap.get(date) || 0,
    }));

    // Top 5 food items from paid orders
    const productMap = new Map();

    paidOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.name || "Unknown Item";
        const quantity = Number(item.quantity || 0);

        if (!productMap.has(name)) {
          productMap.set(name, {
            name,
            quantity: 0,
            revenue: 0,
          });
        }

        const product = productMap.get(name);
        product.quantity += quantity;
        product.revenue += Number(item.price || 0) * quantity;
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Order status breakdown
    const statusMap = {};

    orders.forEach((order) => {
      const status = order.status || "Food Processing";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    res.json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        paidOrders: paidOrderCount,
        averageOrderValue,
        sales,
        topProducts,
        statusBreakdown: Object.entries(statusMap).map(([status, count]) => ({
          status,
          count,
        })),
      },
    });
  } catch (error) {
    console.error("Sales Analytics Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sales analytics",
    });
  }
};

export {
  placeOrder,
  verifyOrder,
  userOrders,
  allOrders,
  updateOrderStatus,
  getSalesAnalytics,
};
