// pages/BuyerNegotiations.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/BuyerNegotiations.css";

const BuyerNegotiations = () => {
  const navigate = useNavigate();
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const token = localStorage.getItem("token");

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/buyer/negotiations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log("Buyer negotiations:", data);
      if (data.success) {
        setNegotiations(data.negotiations);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch negotiations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNegotiations();
    } else {
      setLoading(false);
      setError("Please login to view your negotiations");
    }
  }, [token]);

  const getStatusBadge = (status, adminApproved, sellerApproved) => {
    if (status === "seller_approved") {
      return (
        <div className="status-card approved">
          <span className="status-icon">✅</span>
          <div>
            <strong>Offer Accepted!</strong>
            <p>Seller has accepted your offer. You can now book at the negotiated price.</p>
          </div>
        </div>
      );
    }
    if (status === "admin_approved") {
      return (
        <div className="status-card waiting">
          <span className="status-icon">⏳</span>
          <div>
            <strong>Admin Approved - Waiting for Seller</strong>
            <p>Admin has approved your offer. Waiting for seller to respond.</p>
          </div>
        </div>
      );
    }
    if (status === "seller_rejected") {
      return (
        <div className="status-card rejected">
          <span className="status-icon">❌</span>
          <div>
            <strong>Offer Rejected</strong>
            <p>Seller has rejected your offer. You can still book at the original price.</p>
          </div>
        </div>
      );
    }
    if (status === "admin_rejected") {
      return (
        <div className="status-card rejected">
          <span className="status-icon">❌</span>
          <div>
            <strong>Offer Rejected by Admin</strong>
            <p>Admin has rejected your offer. You can still book at the original price.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="status-card pending mt-5">
        <span className="status-icon">⏳</span>
        <div>
          <strong>Pending Review</strong>
          <p>Your offer is waiting for admin approval.</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="buyer-negotiations-container">
        <div className="loading-spinner"></div>
        <p>Loading your offers...</p>
      </div>
    );
  }

  return (
    <div className="buyer-negotiations-container">
      <div className="buyer-negotiations-header">
        <h1 className=" mt-5">My Price Negotiations</h1>
        <p>Track the status of your offers on cars</p>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      {negotiations.length === 0 ? (
        <div className="no-negotiations">
          <div className="no-negotiations-icon">🤝</div>
          <h3>No negotiation requests yet</h3>
          <p>When you make an offer on a car, it will appear here</p>
          <button onClick={() => navigate("/cars")} className="browse-cars-btn">
            Browse Cars
          </button>
        </div>
      ) : (
        <div className="negotiations-list">
          {negotiations.map((neg) => (
            <div key={neg.id} className="negotiation-card">
              <div className="car-header">
                <img 
                  src={neg.car_images && neg.car_images[0] ? `http://localhost:5000${neg.car_images[0]}` : "https://via.placeholder.com/80"}
                  alt={neg.car_model}
                />
                <div className="car-title">
                  <h3>{neg.car_brand} {neg.car_model}</h3>
                  <p>Seller: {neg.seller_name}</p>
                </div>
              </div>

              <div className="price-details">
                <div className="price-row">
                  <span>Original Price:</span>
                  <span className="original">₹{parseInt(neg.original_price).toLocaleString()}</span>
                </div>
                <div className="price-row highlight">
                  <span>Your Offer:</span>
                  <span className="offer">₹{parseInt(neg.offered_price).toLocaleString()}</span>
                </div>
                <div className="price-row">
                  <span>You Save:</span>
                  <span className="saving">₹{(neg.original_price - neg.offered_price).toLocaleString()}</span>
                </div>
              </div>

              {getStatusBadge(neg.status, neg.admin_approved, neg.seller_approved)}

              {neg.status === "seller_approved" && (
                <div className="action-buttons">
                  <button 
                    className="book-now-btn"
                    onClick={() => {
                      navigate("/my-test-drives");
                    }}
                  >
                    📖 Go to Test Drives & Book
                  </button>
                </div>
              )}

              {(neg.status === "seller_rejected" || neg.status === "admin_rejected") && (
                <div className="action-buttons">
                  <button 
                    className="book-original-btn"
                    onClick={() => {
                      navigate("/my-test-drives");
                    }}
                  >
                    💰 Book at Original Price
                  </button>
                </div>
              )}

              {neg.admin_message && (
                <div className="admin-message">
                  <strong>📝 Admin Note:</strong>
                  <p>{neg.admin_message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerNegotiations;