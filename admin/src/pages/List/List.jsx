import "./List.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash, FaEdit, FaTimes } from "react-icons/fa";

const List = ({ url }) => {
  const [list, setList] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Selected food details
  const [editFood, setEditFood] = useState({
    id: "",
    name: "",
    category: "",
    price: "",
    description: "",
  });

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);

      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Failed to fetch data");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Open edit modal and fill existing food details
  const handleEdit = (item) => {
    setEditFood({
      id: item._id,
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
    });

    setShowModal(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditFood((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update food details
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${url}/api/food/update`, editFood);

      if (response.data.success) {
        toast.success("Food item updated successfully");
        setShowModal(false);
        fetchList();
      } else {
        toast.error(response.data.message || "Failed to update food item");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Remove food
  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, {
        id: foodId,
      });

      if (response.data.success) {
        toast.success("Food item removed successfully");
        fetchList();
      } else {
        toast.error("Failed to remove food item");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list add flex-col">
      <h2>All Food Items</h2>

      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Description</b>
          <b>Action</b>
        </div>

        {list.map((item) => (
          <div className="list-table-format" key={item._id}>
            <img src={`${url}/images/${item.image}`} alt={item.name} />

            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>₹{item.price}</p>
            <p>{item.description}</p>

            <div className="action-icons">
              <FaEdit className="edit-icon" onClick={() => handleEdit(item)} />

              <FaTrash
                onClick={() => removeFood(item._id)}
                className="delete-icon"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Edit Food Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Food Item</h2>

              <FaTimes
                className="close-icon"
                onClick={() => setShowModal(false)}
              />
            </div>

            <form onSubmit={handleUpdate}>
              <label>Food Name</label>
              <input
                type="text"
                name="name"
                value={editFood.name}
                onChange={handleChange}
                required
              />

              <label>Category</label>
              <input
                type="text"
                name="category"
                value={editFood.category}
                onChange={handleChange}
                required
              />

              <label>Price</label>
              <input
                type="number"
                name="price"
                value={editFood.price}
                onChange={handleChange}
                min="0"
                required
              />

              <label>Description</label>
              <textarea
                name="description"
                value={editFood.description}
                onChange={handleChange}
                required
              />

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="update-btn">
                  Update Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
