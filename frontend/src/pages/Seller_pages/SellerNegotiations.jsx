// pages/SellerNegotiations.jsx
import React, { useState, useEffect } from "react";
import "../../assets/css/SellerNegotiations.css";

const SellerNegotiations = () => {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/seller/negotiations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log("Seller negotiations:", data);
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
    fetchNegotiations();
  }, []);

  const handleAction = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/seller/negotiate/${selectedNegotiation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`Offer ${action}d successfully!`);
        setShowModal(false);
        fetchNegotiations();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.message || "Failed to process");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "admin_approved":
        return <span className="status-badge admin-approved">✅ Admin Approved - Awaiting Your Response</span>;
      case "seller_approved":
        return <span className="status-badge approved">👍 You Accepted - Buyer Can Book Now</span>;
      case "seller_rejected":
        return <span className="status-badge rejected">❌ You Rejected</span>;
      case "admin_rejected":
        return <span className="status-badge rejected">❌ Admin Rejected</span>;
      default:
        return <span className="status-badge pending">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="seller-negotiations-container">
        <div className="loading-spinner"></div>
        <p>Loading offers...</p>
      </div>
    );
  }

  return (
    <div className="seller-negotiations-container">
      <div className="seller-negotiations-header">
        <h1 className=" mt-5">Price Negotiation Requests</h1>
        <p>Buyers are making offers on your cars. Review and respond.</p>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      {negotiations.length === 0 ? (
        <div className="no-negotiations">
          <div className="no-negotiations-icon">🤝</div>
          <h3>No negotiation requests yet</h3>
          <p>When buyers make offers on your cars, they will appear here</p>
        </div>
      ) : (
        <div className="negotiations-list">
          {negotiations.map((neg) => (
            <div key={neg.id} className="negotiation-card">
              <div className="negotiation-header">
                <div className="car-info">
                  <h3>{neg.car_brand} {neg.car_model}</h3>
                  {getStatusBadge(neg.status)}
                </div>
              </div>

              <div className="negotiation-body">
                <div className="buyer-info">
                  <span className="label">Buyer:</span>
                  <span>{neg.buyer_name}</span>
                  <span className="label">Contact:</span>
                  <span>{neg.buyer_email} | {neg.buyer_phone || "Not provided"}</span>
                </div>
                
                <div className="price-comparison">
                  <div className="original-price">
                    <span className="label">Your Listed Price:</span>
                    <span className="price">₹{parseInt(neg.original_price).toLocaleString()}</span>
                  </div>
                  <div className="offered-price">
                    <span className="label">Buyer's Offer:</span>
                    <span className="offer-amount">₹{parseInt(neg.offered_price).toLocaleString()}</span>
                  </div>
                  <div className="difference">
                    <span className="label">Difference:</span>
                    <span className="saving">₹{(neg.original_price - neg.offered_price).toLocaleString()} less</span>
                  </div>
                </div>

                {neg.admin_message && (
                  <div className="admin-note">
                    <strong>📝 Admin Note:</strong>
                    <p>{neg.admin_message}</p>
                  </div>
                )}
              </div>

              <div className="negotiation-footer">
                {neg.status === "admin_approved" && (
                  <div className="action-buttons">
                    <button 
                      className="accept-btn"
                      onClick={() => {
                        setSelectedNegotiation(neg);
                        setAction("approve");
                        setShowModal(true);
                      }}
                    >
                      ✅ Accept Offer
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => {
                        setSelectedNegotiation(neg);
                        setAction("reject");
                        setShowModal(true);
                      }}
                    >
                      ❌ Reject Offer
                    </button>
                  </div>
                )}
                {neg.status === "seller_approved" && (
                  <div className="info-message">
                    🎉 You accepted this offer! The buyer can now book the car at ₹{parseInt(neg.offered_price).toLocaleString()}
                  </div>
                )}
                {neg.status === "seller_rejected" && (
                  <div className="info-message rejected">
                    You rejected this offer. The buyer can book at original price if still interested.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && selectedNegotiation && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{action === "approve" ? "Accept Offer" : "Reject Offer"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p><strong>Car:</strong> {selectedNegotiation.car_brand} {selectedNegotiation.car_model}</p>
              <p><strong>Buyer:</strong> {selectedNegotiation.buyer_name}</p>
              <p><strong>Original Price:</strong> ₹{parseInt(selectedNegotiation.original_price).toLocaleString()}</p>
              <p><strong>Offered Price:</strong> ₹{parseInt(selectedNegotiation.offered_price).toLocaleString()}</p>
              {action === "approve" ? (
                <p className="confirm-text">Are you sure you want to accept this offer? The buyer will be able to book the car at ₹{parseInt(selectedNegotiation.offered_price).toLocaleString()}.</p>
              ) : (
                <p className="confirm-text">Are you sure you want to reject this offer? The buyer can still book at the original price if interested.</p>
              )}
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className={`confirm-btn ${action}`} onClick={handleAction}>
                {action === "approve" ? "Yes, Accept" : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerNegotiations;