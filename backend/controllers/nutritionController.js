import foodModel from "../models/food_model.js";
import { generateNutrition } from "../services/nutritionService.js";

const getFoodNutrition = async (req, res) => {
  try {
    const { foodId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    const food = await foodModel.findById(foodId);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const nutrition = await generateNutrition(food);

    return res.json({
      success: true,

      food: {
        _id: food._id,
        name: food.name,
        description: food.description,
        price: food.price,
        image: food.image,
      },

      nutrition,
    });
  } catch (error) {
    console.error("Nutrition Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to calculate nutrition",
    });
  }
};

export { getFoodNutrition };
