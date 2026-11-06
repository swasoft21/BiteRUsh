import { useContext, useEffect } from "react";
import axios from "axios";
import "./Verify.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";

const Verify = () => {
  const [searchParams] = useSearchParams();

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await axios.post(
          `${url}/api/order/verify`,
          {
            orderId: orderId,
            success: success,
          },
          {
            headers: {
              token: token,
            },
          },
        );

        console.log("Verify response:", response.data);

        if (response.data.success) {
          navigate("/myorders");
        } else {
          navigate("/cart");
        }
      } catch (error) {
        console.log("Payment verification error:", error);
        navigate("/cart");
      }
    };

    if (orderId && success && token) {
      verifyPayment();
    }
  }, [orderId, success, token, url, navigate]);

  return (
    <div className="verify">
      <div className="spinner"></div>
      <p>Verifying your payment...</p>
    </div>
  );
};

export default Verify;
