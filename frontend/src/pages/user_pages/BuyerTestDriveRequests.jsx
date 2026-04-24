// pages/BuyerTestDriveRequests.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NegotiationModal from "../user_pages/NegotiationModal";
import "../../assets/css/TestDriveRequests.css";

const BuyerTestDriveRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDateChangeModal, setShowDateChangeModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  
  // Negotiation state
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [selectedCarForNegotiation, setSelectedCarForNegotiation] = useState(null);

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/test-drive/buyer-requests", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await response.json();
      console.log("API Response:", data);
      
      if (data.success) {
        setRequests(data.requests);
      } else {
        setError(data.message || "Failed to fetch requests");
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    } else {
      setLoading(false);
      setError("Please login to view your test drive requests");
    }
  }, [token]);

  const confirmDate = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/test-drive/confirm-date/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Date confirmed successfully!");
        fetchRequests();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to confirm date");
    }
  };

  const requestDateChange = async () => {
    if (!newDate) {
      setError("Please select a new date");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/test-drive/request-date-change/${selectedRequest.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPreferredDate: newDate, reason: changeReason })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Date change request sent to admin!");
        setShowDateChangeModal(false);
        setNewDate("");
        setChangeReason("");
        fetchRequests();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to request date change");
    }
  };

  // Handle Book Now - Navigate to MyBooking page with car data
  // In BuyerTestDriveRequests.jsx, update the handleBookNow function:

  const handleBookNow = (carData) => {
    // Use navigate with replace to prevent going back to the same state
    navigate("/my-bookings", {
      state: {
        car: {
          id: carData.car_id,
          car_brand: carData.car_brand,
          car_model: carData.car_model,
          expected_price: carData.expected_price,
          car_images: carData.car_images
        }
      },
      replace: true  // This prevents the user from coming back to this state
    });
  };

  const getStatusBadge = (status, buyerConfirmed, sellerConfirmed) => {
    if (status === "confirmed") {
      return <span className="td-status-badge td-confirmed">✅ Confirmed - Test Drive Completed</span>;
    }
    if (status === "date_suggested") {
      if (buyerConfirmed === 1 && sellerConfirmed === 1) {
        return <span className="td-status-badge td-confirmed">✅ Both Confirmed</span>;
      }
      if (buyerConfirmed === 1) {
        return <span className="td-status-badge td-partial">👍 You Confirmed - Waiting for Seller</span>;
      }
      return <span className="td-status-badge td-pending">📅 Admin Suggested Date - Please Confirm</span>;
    }
    if (status === "date_change_requested") {
      return <span className="td-status-badge td-warning">🔄 Date Change Requested - Waiting for Admin</span>;
    }
    return <span className="td-status-badge td-pending">⏳ Pending Admin Approval</span>;
  };

  if (loading) {
    return (
      <div className="td-container">
        <div className="td-loading-spinner"></div>
        <p>Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="td-container">
      <div className="td-header">
        <h1 className=" mt-5">My Test Drive Requests</h1>
        <p>Track and manage your test drive requests</p>
      </div>

      {successMessage && <div className="td-success-message">{successMessage}</div>}
      {error && <div className="td-error-message">{error}</div>}

      {requests.length === 0 ? (
        <div className="td-no-requests">
          <div className="td-no-requests-icon">🚗</div>
          <h3>No test drive requests yet</h3>
          <p>Browse cars and request a test drive</p>
          <button onClick={() => navigate("/cars")} className="td-browse-btn">Browse Cars</button>
        </div>
      ) : (
        <div className="td-requests-list">
          {requests.map((req) => (
            <div key={req.id} className="td-request-card">
              <div className="td-request-header">
                <div className="td-car-info">
                  <img 
                    src={req.car_images && req.car_images.length > 0 && req.car_images[0] ? `http://localhost:5000${req.car_images[0]}` : "https://via.placeholder.com/60"}
                    alt={req.car_model}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/60";
                    }}
                  />
                  <div>
                    <h3>{req.car_brand} {req.car_model}</h3>
                    <p>Seller: {req.seller_name}</p>
                    <p>Price: ₹{parseInt(req.expected_price).toLocaleString()}</p>
                  </div>
                </div>
                {getStatusBadge(req.status, req.buyer_confirmed, req.seller_confirmed)}
              </div>

              <div className="td-request-details">
                <div className="td-detail-row">
                  <span className="td-label">Your Message:</span>
                  <span>{req.buyer_message || "No message provided"}</span>
                </div>
                {req.preferred_date && (
                  <div className="td-detail-row">
                    <span className="td-label">Your Preferred Date:</span>
                    <span>{new Date(req.preferred_date).toLocaleDateString()}</span>
                  </div>
                )}
                {req.suggested_date && (
                  <div className="td-detail-row td-suggested-date">
                    <span className="td-label">📅 Admin Suggested Date:</span>
                    <span className="td-highlight">{new Date(req.suggested_date).toLocaleDateString()}</span>
                    {req.admin_message && <span className="td-admin-note">Note: {req.admin_message}</span>}
                  </div>
                )}
                {req.requested_new_date && (
                  <div className="td-detail-row">
                    <span className="td-label">Requested New Date:</span>
                    <span>{new Date(req.requested_new_date).toLocaleDateString()}</span>
                    {req.date_change_reason && <span className="td-reason">Reason: {req.date_change_reason}</span>}
                  </div>
                )}
              </div>

              <div className="td-request-actions">
                {req.status === "date_suggested" && req.buyer_confirmed === 0 && (
                  <>
                    <button onClick={() => confirmDate(req.id)} className="td-confirm-btn">
                      ✅ I'm Comfortable with this Date
                    </button>
                    <button onClick={() => {
                      setSelectedRequest(req);
                      setShowDateChangeModal(true);
                    }} className="td-change-date-btn">
                      📅 Request Date Change
                    </button>
                  </>
                )}
                {req.status === "date_suggested" && req.buyer_confirmed === 1 && req.seller_confirmed === 0 && (
                  <div className="td-waiting-message">
                    ⏳ Waiting for seller to confirm the date...
                  </div>
                )}
                {req.status === "confirmed" && (
                  <>
                    <div className="td-confirmed-message">
                      🎉 Test drive completed! You can now book this car.
                    </div>
                    <div className="td-purchase-buttons">
                      <button 
                        className="td-book-now-btn" 
                        onClick={() => handleBookNow(req)}
                      >
                        💰 Book Now
                      </button>
                      <button 
                        className="td-negotiate-btn" 
                        onClick={() => {
                          setSelectedCarForNegotiation({
                            id: req.car_id,
                            car_brand: req.car_brand,
                            car_model: req.car_model,
                            expected_price: req.expected_price
                          });
                          setShowNegotiationModal(true);
                        }}
                      >
                        🤝 Negotiate Price
                      </button>
                    </div>
                  </>
                )}
                {req.status === "date_change_requested" && (
                  <div className="td-waiting-message">
                    ⏳ Admin is reviewing your date change request...
                  </div>
                )}
                {req.status === "pending" && (
                  <div className="td-waiting-message">
                    ⏳ Request sent to admin. Waiting for admin to suggest a date...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Date Change Modal */}
      {showDateChangeModal && (
        <div className="td-modal-overlay" onClick={() => setShowDateChangeModal(false)}>
          <div className="td-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="td-modal-header">
              <h2>Request Date Change</h2>
              <button className="td-close-btn" onClick={() => setShowDateChangeModal(false)}>✕</button>
            </div>
            <div className="td-modal-body">
              <div className="td-form-group">
                <label>Select New Preferred Date *</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="td-form-group">
                <label>Reason for Date Change *</label>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="Please explain why you need to change the date..."
                  rows="3"
                />
              </div>
            </div>
            <div className="td-modal-actions">
              <button className="td-cancel-btn" onClick={() => setShowDateChangeModal(false)}>Cancel</button>
              <button className="td-submit-btn" onClick={requestDateChange}>Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Negotiation Modal */}
      {showNegotiationModal && selectedCarForNegotiation && (
        <NegotiationModal
          car={selectedCarForNegotiation}
          onClose={() => {
            setShowNegotiationModal(false);
            setSelectedCarForNegotiation(null);
          }}
          onSuccess={() => {
            alert("Negotiation request sent successfully!");
          }}
        />
      )}
    </div>
  );
};

export default BuyerTestDriveRequests;