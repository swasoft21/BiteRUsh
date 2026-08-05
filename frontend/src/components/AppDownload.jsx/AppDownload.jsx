import { assets } from '../../assets/assets'
import './AppDownload.css'
const AppDownload = () => {
  return (
    <div className='app-download' id="app-downlaod">
        <p>For Better Experience Download <br/>BiteRush</p>
        <div className="app-download-platforms">
            <img src={assets.play_store} alt="" />
            <img src={assets.app_store} alt="" />
        </div>
        
      
    </div>
  )
}

export default AppDownload
