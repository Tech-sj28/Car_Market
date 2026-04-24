// components/BookingModal.jsx
import React, { useState, useEffect } from "react";
import "../../assets/css/Modal.css";

const BookingModal = ({ car, negotiatedPrice, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const finalPrice = negotiatedPrice || parseFloat(car.expected_price);
  const bookingAmount = finalPrice * 0.10; // 10% commission
  const remainingAmount = finalPrice - bookingAmount;

  const handleBooking = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:5000/api/create-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          carId: car.id,
          finalPrice: finalPrice,
          useNegotiatedPrice: !!negotiatedPrice
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBooking(data);
        
        // Simulate payment (in production, integrate Razorpay/PayTM)
        alert(`Booking created! Please pay ₹${data.bookingAmount.toLocaleString()} to confirm your booking.\n\nSeller Details for remaining payment:\nName: ${data.sellerDetails.name}\nEmail: ${data.sellerDetails.email}\nPhone: ${data.sellerDetails.phone}`);
        
        // Record payment (in production, this would be after successful payment)
        await fetch(`http://localhost:5000/api/booking/payment/${data.bookingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ paymentId: "DEMO_PAYMENT_" + Date.now() })
        });
        
        alert("Booking confirmed! You can now contact the seller for delivery.");
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(data.message || "Failed to create booking");
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
          <h2>Book This Car</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="car-info-modal">
            <h3>{car.car_brand} {car.car_model}</h3>
            <p>Final Price: ₹{finalPrice.toLocaleString()}</p>
            {negotiatedPrice && <p className="negotiated-badge">✨ Negotiated Price</p>}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="payment-summary">
            <h3>Payment Summary</h3>
            <div className="payment-row">
              <span>Car Price:</span>
              <span>₹{finalPrice.toLocaleString()}</span>
            </div>
            <div className="payment-row">
              <span>Platform Commission (10%):</span>
              <span>₹{bookingAmount.toLocaleString()}</span>
            </div>
            <div className="payment-row total">
              <span>Booking Amount (Pay Now):</span>
              <span className="highlight">₹{bookingAmount.toLocaleString()}</span>
            </div>
            <div className="payment-row">
              <span>Remaining Amount (Pay to Seller at Delivery):</span>
              <span>₹{remainingAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="info-box">
            <p>📌 <strong>How it works:</strong></p>
            <ul>
              <li>Pay booking amount online to confirm your booking</li>
              <li>Platform commission is included in booking amount</li>
              <li>Remaining amount to be paid directly to seller at delivery</li>
              <li>You'll receive seller's contact details after booking</li>
            </ul>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="button" className="submit-btn" onClick={handleBooking} disabled={loading}>
              {loading ? "Processing..." : `Pay ₹${bookingAmount.toLocaleString()} & Book`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;