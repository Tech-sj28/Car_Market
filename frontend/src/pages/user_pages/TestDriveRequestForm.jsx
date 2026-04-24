// pages/TestDriveRequestForm.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../assets/css/TestDriveRequests.css";

const TestDriveRequestForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { car, sellerId, message: initialMessage } = location.state || {};
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState(initialMessage || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("Location state:", location.state);
    console.log("Car:", car);
    console.log("Seller ID from state:", sellerId);
    console.log("Car seller_id:", car?.seller_id);
    
    if (!car) {
      setError("No car information found");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!preferredDate) {
      setError("Please select a preferred date");
      return;
    }
    
    // Get seller ID from state or from car object
    const finalSellerId = sellerId || car?.seller_id;
    
    console.log("Final Seller ID:", finalSellerId);
    
    if (!finalSellerId) {
      setError("Seller information missing. Please go back and try again.");
      return;
    }
    
    if (!car?.id) {
      setError("Car information missing. Please go back and try again.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const requestBody = {
        carId: car.id,
        sellerId: finalSellerId,
        preferredDate: preferredDate,
        message: message
      };
      
      console.log("Sending request:", requestBody);
      
      const response = await fetch("http://localhost:5000/api/test-drive/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      console.log("Response:", data);
      
      if (data.success) {
        alert("Test drive request sent successfully! Admin will review and suggest a date.");
        navigate("/my-test-drives");
      } else {
        setError(data.message || "Failed to send request");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!car) {
    return (
      <div className="td-container">
        <div className="td-header">
          <h1>Error</h1>
          <p>No car information found. Please go back and try again.</p>
        </div>
        <button onClick={() => navigate("/cars")} className="td-browse-btn">Back to Cars</button>
      </div>
    );
  }

  return (
    <div className="td-container">
      <div className="td-header">
        <h1 className=" mt-5">Request Test Drive</h1>
        <p>Schedule a test drive for {car.car_brand} {car.car_model}</p>
      </div>
      
      {error && <div className="td-error-message">{error}</div>}
      
      <div className="td-requests-list" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="td-request-card">
          <div className="td-car-info" style={{ marginBottom: "1rem" }}>
            <img 
              src={car.car_images && car.car_images[0] ? `http://localhost:5000${car.car_images[0]}` : "https://via.placeholder.com/80"}
              alt={car.car_model}
            />
            <div>
              <h3>{car.car_brand} {car.car_model}</h3>
              <p>Price: ₹{parseInt(car.expected_price).toLocaleString()}</p>
              <p>Location: {car.cityname}</p>
              <p>Seller ID: {car.seller_id}</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="td-form-group">
              <label>Preferred Test Drive Date *</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="td-form-group">
              <label>Message to Seller (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="3"
                placeholder="Any specific questions or requests for the seller..."
              />
            </div>
            <div className="td-request-actions">
              <button type="button" className="td-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="td-submit-btn" disabled={loading}>
                {loading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestDriveRequestForm;