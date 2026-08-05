
import './Home.css';
import { useState } from 'react';
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisply from '../../components/FoodDisplay/FoodDisply';
import AppDownload from '../../components/AppDownload.jsx/AppDownload';
const Home = () => {
    const [category,setCategory] = useState("All")
  return (
    <div>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisply category={category}/>
      <AppDownload/>
      
    </div>
  )
}

export default Home;
