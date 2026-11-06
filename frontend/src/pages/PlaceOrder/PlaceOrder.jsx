import { useContext, useState } from "react";
import axios from "axios";
import "./PlaceOrder.css";
import { StoreContext } from "../../Context/StoreContext";

const PlaceOrder = () => {
  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItem,
    url
  } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: ""
  });

  // Handle input changes
  const onChangeHandler = (event) => {
    const { name, value } = event.target;

    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Place Order
  const placeOrder = async (event) => {
    event.preventDefault();

    try {
      // Create order items
      let orderItems = [];

      food_list.forEach((item) => {
        if (cartItem[item._id]) {
          const itemInfo = {
            ...item,
            quantity: cartItem[item._id]
          };

          orderItems.push(itemInfo);
        }
      });

      // Create order data
      const orderData = {
        address: data,
        items: orderItems,
        amount:
          getTotalCartAmount() === 0
            ? 0
            : Number(getTotalCartAmount()) + 3
      };

      console.log("Order Data:", orderData);

      // Send order to backend
      const response = await axios.post(
        `${url}/api/order/place`,
        orderData,
        {
          headers: {
            token
          }
        }
      );

      // Redirect to payment
      if (response.data.success) {
        const { session_url } = response.data;

        window.location.replace(session_url);
      } else {
        console.log("Order failed:", response.data.message);
      }

    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <form onSubmit={placeOrder} className="place-order">

      {/* Delivery Information */}
      <div className="place-order-left">

        <p className="title">Delivery Information</p>

        <div className="multi-fields">

          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder="First name"
          />

          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder="Last name"
          />

        </div>

        <input
          required
          name="email"
          type="email"
          onChange={onChangeHandler}
          value={data.email}
          placeholder="Email Address"
        />

        <input
          required
          name="street"
          type="text"
          onChange={onChangeHandler}
          value={data.street}
          placeholder="Street"
        />

        <div className="multi-fields">

          <input
            required
            name="city"
            type="text"
            onChange={onChangeHandler}
            value={data.city}
            placeholder="City"
          />

          <input
            required
            name="state"
            type="text"
            onChange={onChangeHandler}
            value={data.state}
            placeholder="State"
          />

        </div>

        <div className="multi-fields">

          <input
            required
            name="zipCode"
            type="text"
            onChange={onChangeHandler}
            value={data.zipCode}
            placeholder="Zip Code"
          />

          <input
            required
            name="country"
            type="text"
            onChange={onChangeHandler}
            value={data.country}
            placeholder="Country"
          />

        </div>

        <input
          required
          name="phone"
          type="text"
          onChange={onChangeHandler}
          value={data.phone}
          placeholder="Phone"
        />

      </div>

      {/* Order Summary */}
      <div className="place-order-right">

        <div className="cart-total">

          <div>

            {/* Subtotal */}
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>

            <hr />

            {/* Delivery Fee */}
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>
                ${getTotalCartAmount() > 0 ? 3 : 0}
              </p>
            </div>

            <hr />

            {/* Total */}
            <div className="cart-total-details">
              <p>Total</p>

              <p>
                $
                {getTotalCartAmount() === 0
                  ? 0
                  : Number(getTotalCartAmount()) + 3}
              </p>
            </div>

          </div>

          <button type="submit">
            PROCEED TO PAYMENT
          </button>

        </div>

      </div>

    </form>
  );
};

export default PlaceOrder;