import userModel from "../models/userModal.js";

//add item to user cart


// Add item to user cart
const addToCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);

    let cartData = userData.cartData;

    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }

    await userModel.findByIdAndUpdate(req.body.userId, { cartData });

    res.json({
      success: true,
      message: "Item added to cart",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};   // <-- THIS WAS MISSING

// Remove item from cart
const removeFromCart = async (req, res) => {

};

// Fetch user cart
const getCartItems = async (req, res) => {

};

export { addToCart, removeFromCart, getCartItems };
//remove item from user cart
