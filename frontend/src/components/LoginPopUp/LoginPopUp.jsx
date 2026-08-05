import { assets } from "../../assets/assets";
import "./LoginPopUp.css";
import { useState,useContext } from "react";
import {StoreContext} from "../../Context/StoreContext"
import axios from "axios";

const LoginPopUp = ({setShowLogin}) => {
  const {url,setToken} =useContext(StoreContext)
    const [currentState,setCurrentState] =useState("Login")
    const [data,setData] = useState({
      name:"",
      email:"",
      password:""
    })

    const onChangeHandler = (event)=>{
      const name= event.target.name;
      const value = event.target.value;
      setData(prevData => ({
        ...prevData,
        [name]: value
      }));

    }
    const onLogin = async (event)=>{
      event.preventDefault();
      let newUrl = url;
      if(currentState==="Login"){
        newUrl+="/api/user/login"
      }
      else{
        newUrl+="/api/user/register"
      }
      const response = await axios.post(newUrl,data );
      if(response.data.success){
        setToken(response.data.token);
        localStorage.setItem("token",response.data.token);
        setShowLogin(false);
      }else{
        alert(response.data.message)
      }
    }
  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
            <h2>{currentState}</h2>
            <img onClick={()=>{setShowLogin(false)}} src={assets.cross_icon} alt="" />
        </div>
        <div className="login-popup-inputs">
        {currentState==="Login"?<></>:<input type="text" onChange={onChangeHandler} name="name" value={data.name} placeholder="Your Name" required />}
            
            <input type="email" onChange={onChangeHandler} name="email" value={data.email} placeholder="Your email" required/>
            <input type="password" onChange={onChangeHandler} name="password" value={data.password} placeholder="Password" required/>
        </div>
        <button type="submit">{currentState==="Sign Up"?"Create account":"Login"}</button>
        <div className="login-popup-condition">
            <input type="checkbox"  required/>
            <p>By continuing, i agree to the terms of use & privacy policy.</p>
        </div>
        {
            currentState==='Login'        
            ?<p>Create a new Account? <span onClick={()=>setCurrentState("Sign Up")}>Click here</span></p>
            :<p>Already havean Account? <span onClick={()=>setCurrentState("Login")}>Login here</span></p>
        }
      </form>
    </div>
  )
}

export default LoginPopUp
