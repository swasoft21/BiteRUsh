import Navbar from "./components/Navbar/Navbar"
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from 'react-router-dom';
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Order from "./pages/Orders/Order";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const App = () => {
  const url = "http://localhost:4000";
  return (
    <div>
    <ToastContainer
        position="top-right"
        autoClose={3000}
      />
      <Navbar/>
      <hr/>
      <div className="app-content">
        <Sidebar/>
        <Routes>
          <Route path="/add" element={<Add url={url}/>}></Route>
          <Route path="/list" element={<List url={url}/>}></Route>
          <Route path="/order" element={<Order url={url}/>}></Route>

        </Routes>
      </div>
    </div>
  )
}

export default App
