import express from "express";
import multer from "multer";

import {
  addFood,
  listFood,
  removeFood,
  updateFood,
} from "../controllers/foodController.js";

const foodRouter = express.Router();

// Image storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.post("/update", (req, res) => {
  console.log("Update route reached!");
  updateFood(req, res);
});

export default foodRouter;
