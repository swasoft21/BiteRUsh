import foodModel from "../models/food_model.js";
import fs from "fs";

// Add food item

const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a food image",
      });
    }

    const ingredients = req.body.ingredients
      ? JSON.parse(req.body.ingredients)
      : [];

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: req.file.filename,
      ingredients,
    });

    await food.save();

    res.json({
      success: true,
      message: "Food Added Successfully",
      data: food,
    });
  } catch (error) {
    console.log("Add Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Error adding food",
    });
  }
};

// List food items
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);

    if (!food) {
      return res.json({
        success: false,
        message: "Food item not found",
      });
    }

    fs.unlink(`uploads/${food.image}`, () => {});

    await foodModel.findByIdAndDelete(req.body.id);

    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Update food item
const updateFood = async (req, res) => {
  try {
    const { id, name, description, price, category } = req.body;

    const updatedFood = await foodModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category,
      },
      { new: true, runValidators: true },
    );

    if (!updatedFood) {
      return res.json({
        success: false,
        message: "Food item not found",
      });
    }

    res.json({
      success: true,
      message: "Food Updated Successfully",
      data: updatedFood,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error updating food",
    });
  }
};

export { addFood, listFood, removeFood, updateFood };
