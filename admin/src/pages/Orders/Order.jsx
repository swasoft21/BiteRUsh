import "./Order.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Order = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState("");

  const selectedOrder = orders.find((order) => order._id === selectedOrderId);

  // Fetch all orders
  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);

      if (response.data.success) {
        const orderData = response.data.orders || [];

        setOrders(orderData);

        if (orderData.length > 0) {
          setSelectedOrderId((currentId) => {
            const stillExists = orderData.some(
              (order) => order._id === currentId,
            );

            return stillExists ? currentId : orderData[0]._id;
          });
        }
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrder(orderId);

      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status,
      });

      if (response.data.success) {
        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order._id === orderId ? { ...order, status } : order,
          ),
        );

        toast.success("Order status updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpdatingOrder("");
    }
  };

  // Format order date
  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchAllOrders();
  }, [url]);

  return (
    <div className="admin-orders">
      <h2>Order History</h2>

      {loading ? (
        <p className="orders-message">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="orders-message">No orders found.</p>
      ) : (
        <div className="orders-layout">
          {/* LEFT SIDE: ORDER LIST */}
          <div className="orders-list-panel">
            <h3>All Orders ({orders.length})</h3>

            <div className="orders-list">
              {orders.map((order) => {
                const isSelected = selectedOrderId === order._id;
                const firstItem = order.items?.[0];

                return (
                  <div
                    className={`order-list-card ${
                      isSelected ? "selected" : ""
                    }`}
                    key={order._id}
                    onClick={() => setSelectedOrderId(order._id)}
                  >
                    <div className="order-list-top">
                      <h4>Order #{order._id.slice(-8)}</h4>

                      <span
                        className={
                          order.payment
                            ? "payment-badge paid"
                            : "payment-badge unpaid"
                        }
                      >
                        {order.payment ? "Paid" : "Pending"}
                      </span>
                    </div>

                    <p className="order-list-product">
                      {firstItem?.name || "Food item"}
                      {order.items?.length > 1
                        ? ` + ${order.items.length - 1} more`
                        : ""}
                    </p>

                    <div className="order-list-bottom">
                      <span>{formatDate(order.date)}</span>
                      <strong>₹{order.amount}</strong>
                    </div>

                    <p className="order-list-status">
                      {order.status || "Food Processing"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE: SELECTED ORDER DETAILS */}
          <div className="order-details-panel">
            {!selectedOrder ? (
              <p>Select an order to see its details.</p>
            ) : (
              <>
                <h3>Order Details</h3>

                <div className="order-detail-card">
                  {/* Order Header */}
                  <div className="detail-header">
                    <div>
                      <h3>Order #{selectedOrder._id.slice(-8)}</h3>
                      <p>{formatDate(selectedOrder.date)}</p>
                    </div>

                    <span
                      className={
                        selectedOrder.payment
                          ? "payment-badge paid"
                          : "payment-badge unpaid"
                      }
                    >
                      {selectedOrder.payment
                        ? "Payment Completed"
                        : "Payment Pending"}
                    </span>
                  </div>

                  {/* Customer and Payment Information */}
                  <div className="customer-payment-details">
                    <div className="delivery-address">
                      <h4>Delivery Address</h4>

                      <p className="customer-name">
                        {selectedOrder.address?.firstName}{" "}
                        {selectedOrder.address?.lastName}
                      </p>

                      <p>{selectedOrder.address?.street}</p>

                      <p>
                        {selectedOrder.address?.city},{" "}
                        {selectedOrder.address?.state}
                      </p>

                      <p>
                        {selectedOrder.address?.country} -{" "}
                        {selectedOrder.address?.zipCode}
                      </p>

                      <p>Phone: {selectedOrder.address?.phone}</p>

                      <p>
                        Email: {selectedOrder.address?.email || "Not provided"}
                      </p>
                    </div>

                    <div className="payment-details">
                      <h4>Payment Details</h4>

                      <p>
                        Payment Status:{" "}
                        <strong>
                          {selectedOrder.payment ? "Paid" : "Pending"}
                        </strong>
                      </p>

                      <p>
                        Order Status:{" "}
                        <strong>
                          {selectedOrder.status || "Food Processing"}
                        </strong>
                      </p>

                      <p>Order ID: {selectedOrder._id}</p>
                    </div>
                  </div>

                  {/* Ordered Products */}
                  <div className="ordered-products">
                    <h4>Ordered Products</h4>

                    {selectedOrder.items?.map((item, index) => (
                      <div className="ordered-product" key={index}>
                        <div className="ordered-product-info">
                          {item.image ? (
                            <img
                              src={`${url}/images/${item.image}`}
                              alt={item.name}
                              className="ordered-product-image"
                            />
                          ) : (
                            <div className="no-product-image">No Image</div>
                          )}

                          <div>
                            <h4>{item.name}</h4>
                            <p>Quantity: {item.quantity}</p>
                            <p>Price: ₹{item.price}</p>
                          </div>
                        </div>

                        <strong>
                          ₹{Number(item.price) * Number(item.quantity)}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {/* Total Amount */}
                  <div className="order-total">
                    <span>Total Amount</span>
                    <strong>₹{selectedOrder.amount}</strong>
                  </div>

                  {/* Update Status */}
                  <div className="order-status-section">
                    <label htmlFor="order-status">Update Order Status</label>

                    <select
                      id="order-status"
                      value={selectedOrder.status || "Food Processing"}
                      onChange={(e) =>
                        handleStatusChange(selectedOrder._id, e.target.value)
                      }
                      disabled={updatingOrder === selectedOrder._id}
                    >
                      <option value="Food Processing">Food Processing</option>

                      <option value="Food Packed">Food Packed</option>

                      <option value="On the Way">On the Way</option>

                      <option value="Delivered">Delivered</option>
                    </select>

                    {updatingOrder === selectedOrder._id && (
                      <span>Updating...</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
