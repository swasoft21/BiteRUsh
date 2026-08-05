import "./List.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash, FaEdit } from "react-icons/fa";

const List = ({url}) => {
  
  const [list, setList] = useState([]);

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

  const removeFood = async(foodId)=>{
    const response =await axios.post(`${url}/api/food/remove`,{id:foodId});
    await fetchList();
    if(response.data.success){
      toast.success("Food item removed successfully");
    }else{
      toast.error("Failed to remove food item");
    }
  }
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
        </div>

        {list.map((item, index) => (
          <div className="list-table-format" key={index}>
            <img
              src={`${url}/images/${item.image}`}
              alt={item.name}
            />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>₹{item.price}</p>
            <p>{item.description}</p>
            <div className="action-icons">
              <FaEdit  className="edit-icon" />
              <FaTrash onClick = {()=>removeFood(item._id)} className="delete-icon" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;