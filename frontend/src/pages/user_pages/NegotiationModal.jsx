// components/NegotiationModal.jsx
import React, { useState } from "react";
import "../../assets/css/Modal.css";

const NegotiationModal = ({ car, onClose, onSuccess }) => {
  const [offeredPrice, setOfferedPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!offeredPrice || parseFloat(offeredPrice) <= 0) {
      setError("Please enter a valid price");
      return;
    }
    
    if (parseFloat(offeredPrice) >= parseFloat(car.expected_price)) {
      setError("Offered price should be less than the original price");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:5000/api/negotiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          carId: car.id,
          offeredPrice: offeredPrice
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("Negotiation request sent to admin!");
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(data.message || "Failed to send negotiation request");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Negotiate Price</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="car-info-modal">
            <h3>{car.car_brand} {car.car_model}</h3>
            <p>Original Price: ₹{parseInt(car.expected_price).toLocaleString()}</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Offer Price (₹) *</label>
              <input
                type="number"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
                placeholder="Enter your offer price"
                required
              />
              <small>Offer must be less than ₹{parseInt(car.expected_price).toLocaleString()}</small>
            </div>
            
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Sending..." : "Send Negotiation Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NegotiationModal;