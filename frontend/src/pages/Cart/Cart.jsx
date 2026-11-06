import { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItem, food_list, removeFromCart, getTotalCartAmount, url } =
    useContext(StoreContext);

  const navigate = useNavigate();

  const totalAmount = getTotalCartAmount();
  const isCartEmpty = totalAmount === 0;

  return (
    <div className="cart">
      <div className="cart-item">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>

        <br />
        <hr />

        {isCartEmpty ? (
          <div className="empty-cart">
            <h2>Your Cart is Empty!</h2>
            <p>Add some delicious food to continue.</p>
            <button onClick={() => navigate("/")}>Explore Food</button>
          </div>
        ) : (
          food_list.map((item) => {
            if (cartItem[item._id] > 0) {
              return (
                <div key={item._id}>
                  <div className="cart-items-title cart-items-item">
                    <img src={url + "/images/" + item.image} alt={item.name} />

                    <p>{item.name}</p>

                    <p>₹{item.price}</p>

                    <p>{cartItem[item._id]}</p>

                    <p>₹{item.price * cartItem[item._id]}</p>

                    <p
                      onClick={() => removeFromCart(item._id)}
                      className="cross"
                    >
                      x
                    </p>
                  </div>
                  <hr />
                </div>
              );
            }

            return null;
          })
        )}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{totalAmount}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{totalAmount > 0 ? 3 : 0}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{totalAmount === 0 ? 0 : totalAmount + 3}</b>
            </div>
          </div>

          <button disabled={isCartEmpty} onClick={() => navigate("/order")}>
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
