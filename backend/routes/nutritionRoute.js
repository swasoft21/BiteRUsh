import express from "express";
import { getFoodNutrition } from "../controllers/nutritionController.js";

const nutritionRouter = express.Router();

nutritionRouter.get("/:foodId", getFoodNutrition);

export default nutritionRouter;
