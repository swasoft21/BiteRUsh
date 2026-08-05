import { assets } from "../../assets/assets"
import './Footer.css'


const Footer = () => {
    return (
        <div className="footer" id="footer">
            <div className="footer-content">
                <div className="footer-content-left">
                    <img src={assets.logo} alt="" />
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos voluptate rem, obcaecati asperiores fugiat consectetur, hic ipsum corporis porro vel culpa tenetur quae tempora labore facere eaque soluta at deserunt.</p>
                    <div className="footer-social-icon">
                        <img src={assets.facebook_icon} alt="" />
                        <img src={assets.linkedin_icon} alt="" />
                        <img src={assets.twitter_icon} alt="" />
                    </div>
                </div>
                <div className="footer-content-center">
                    <h2>COMPANY</h2>
                    <ul>
                        <li>Home</li>
                        <li>About</li>
                        <li>Delivery</li>
                        <li>Privacy Policy</li>
                    </ul>
                </div>
                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <li>+91 9663912110</li>
                        <li>biterush@gmail.com</li>
                        
                    </ul>

                </div>
            </div>
            <hr />
            <p className="footer-copyright">Copyright 2026 BiteRush.com - All RightReserved</p>
        </div>
    )
}

export default Footer
