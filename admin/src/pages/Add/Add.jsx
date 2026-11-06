import { useState } from "react";
import { assets } from "../../assets/assets";
import "./Add.css";
import axios from "axios";
import { toast } from "react-toastify";

const Add = ({ url }) => {
  const [image, setImage] = useState(null);

  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
  });

  // Saved ingredients
  const [ingredients, setIngredients] = useState([]);

  // Ingredient modal visibility
  const [showIngredientModal, setShowIngredientModal] = useState(false);

  // Temporary ingredient rows
  const [ingredientRows, setIngredientRows] = useState([
    { name: "", quantity: "", unit: "g" },
  ]);

  // Handle food input changes
  const onChangeHandle = (event) => {
    const { name, value } = event.target;

    setData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle ingredient input changes
  const onIngredientChange = (index, field, value) => {
    setIngredientRows((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  // Add another ingredient row
  const addIngredientRow = () => {
    setIngredientRows((previous) => [
      ...previous,
      { name: "", quantity: "", unit: "g" },
    ]);
  };

  // Remove ingredient row
  const removeIngredientRow = (index) => {
    setIngredientRows((previous) => previous.filter((_, i) => i !== index));
  };

  // Save ingredients
  const saveIngredients = () => {
    const validIngredients = ingredientRows.map((item) => ({
      name: item.name.trim(),
      quantity: Number(item.quantity),
      unit: "g",
    }));

    const hasInvalidIngredient = validIngredients.some(
      (item) =>
        !item.name || !Number.isFinite(item.quantity) || item.quantity <= 0,
    );

    if (hasInvalidIngredient) {
      toast.error("Please enter valid ingredient names and weights.");
      return;
    }

    setIngredients(validIngredients);
    setShowIngredientModal(false);

    toast.success("Ingredients added successfully");
  };

  // Open ingredient modal
  const openIngredientModal = () => {
    setIngredientRows(
      ingredients.length > 0
        ? ingredients.map((item) => ({ ...item }))
        : [{ name: "", quantity: "", unit: "g" }],
    );

    setShowIngredientModal(true);
  };

  // Submit food details
  const onSubmitHandle = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error("Please upload a food image.");
      return;
    }

    if (ingredients.length === 0) {
      toast.error("Please add at least one ingredient.");
      return;
    }

    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("category", data.category);
    formData.append("image", image);

    // Send ingredient details as JSON
    formData.append("ingredients", JSON.stringify(ingredients));

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);

      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad",
        });

        setImage(null);
        setIngredients([]);
        setIngredientRows([{ name: "", quantity: "", unit: "g" }]);

        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Add food error:", error);

      toast.error(error.response?.data?.message || "Unable to add food");
    }
  };

  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandle}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>

          <label htmlFor="image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt="Food preview"
            />
          </label>

          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            accept="image/*"
            hidden
            required
          />

          {/* Food name */}
          <div className="add-product-name flex-col">
            <p>Product name</p>

            <input
              onChange={onChangeHandle}
              value={data.name}
              type="text"
              name="name"
              placeholder="Type here"
              required
            />
          </div>

          {/* Food description */}
          <div className="add-product-description flex-col">
            <p>Product Description</p>

            <textarea
              onChange={onChangeHandle}
              value={data.description}
              name="description"
              rows="6"
              placeholder="Write Content here"
              required
            />
          </div>

          {/* Add ingredients */}
          <div className="ingredient-button-section">
            <button
              type="button"
              className="ingredient-open-btn"
              onClick={openIngredientModal}
            >
              + Add Ingredients
            </button>

            {ingredients.length > 0 && (
              <p>{ingredients.length} ingredient(s) added</p>
            )}
          </div>

          {/* Food category and price */}
          <div className="add-category-price">
            <div className="add-category flex-col">
              <p>Product Category</p>

              <select
                name="category"
                value={data.category}
                onChange={onChangeHandle}
              >
                <option value="Salad">Salad</option>
                <option value="Rolls">Rolls</option>
                <option value="Deserts">Deserts</option>
                <option value="Sandwich">Sandwich</option>
                <option value="Cake">Cake</option>
                <option value="Pure veg">Pure veg</option>
                <option value="Pasta">Pasta</option>
                <option value="Noodles">Noodle</option>
              </select>
            </div>

            <div className="add-price flex-col">
              <p>Product Price</p>

              <input
                onChange={onChangeHandle}
                value={data.price}
                type="number"
                name="price"
                placeholder="120"
                min="0"
                required
              />
            </div>
          </div>

          <button type="submit" className="add-btn">
            ADD
          </button>
        </div>
      </form>

      {/* Ingredient Modal */}
      {showIngredientModal && (
        <div className="ingredient-modal-overlay">
          <div className="ingredient-modal">
            <h2>Add Food Ingredients</h2>

            <p className="ingredient-modal-description">
              Enter each ingredient and its weight in grams.
            </p>

            {ingredientRows.map((ingredient, index) => (
              <div className="ingredient-row" key={index}>
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) =>
                    onIngredientChange(index, "name", e.target.value)
                  }
                />

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Weight in grams"
                  value={ingredient.quantity}
                  onChange={(e) =>
                    onIngredientChange(index, "quantity", e.target.value)
                  }
                />

                <span className="ingredient-unit">g</span>

                {ingredientRows.length > 1 && (
                  <button
                    type="button"
                    className="ingredient-remove-btn"
                    onClick={() => removeIngredientRow(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="ingredient-add-more-btn"
              onClick={addIngredientRow}
            >
              + Add More
            </button>

            <div className="ingredient-modal-actions">
              <button
                type="button"
                className="ingredient-save-btn"
                onClick={saveIngredients}
              >
                Save Ingredients
              </button>

              <button
                type="button"
                className="ingredient-cancel-btn"
                onClick={() => setShowIngredientModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Add;
