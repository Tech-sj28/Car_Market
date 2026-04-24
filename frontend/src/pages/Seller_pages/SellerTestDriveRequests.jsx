// pages/SellerTestDriveRequests.jsx
import React, { useState, useEffect } from "react";
import "../../assets/css/TestDriveRequests.css";

const SellerTestDriveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDateChangeModal, setShowDateChangeModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/test-drive/seller-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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

  const getStatusBadge = (status, buyerConfirmed, sellerConfirmed) => {
    if (status === "confirmed") {
      return <span className="td-status-badge td-confirmed">✅ Confirmed - Test Drive Scheduled</span>;
    }
    if (status === "date_suggested") {
      if (buyerConfirmed === 1 && sellerConfirmed === 1) {
        return <span className="td-status-badge td-confirmed">✅ Both Confirmed</span>;
      }
      if (sellerConfirmed === 1) {
        return <span className="td-status-badge td-partial">👍 You Confirmed - Waiting for Buyer</span>;
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
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="td-container">
      <div className="td-header">
        <h1 className=" mt-5">Test Drive Requests</h1>
        <p>Manage test drive requests from buyers</p>
      </div>

      {successMessage && <div className="td-success-message">{successMessage}</div>}
      {error && <div className="td-error-message">{error}</div>}

      {requests.length === 0 ? (
        <div className="td-no-requests">
          <div className="td-no-requests-icon">🚗</div>
          <h3>No test drive requests yet</h3>
          <p>When buyers request test drives, they will appear here</p>
        </div>
      ) : (
        <div className="td-requests-list">
          {requests.map((req) => (
            <div key={req.id} className="td-request-card">
              <div className="td-request-header">
                <div className="td-car-info">
                  <img 
                    src={req.car_images && req.car_images[0] ? `http://localhost:5000${req.car_images[0]}` : "https://via.placeholder.com/60"}
                    alt={req.car_model}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/60";
                    }}
                  />
                  <div>
                    <h3>{req.car_brand} {req.car_model}</h3>
                    <p>Buyer: {req.buyer_name}</p>
                    <p>Contact: {req.buyer_phone || req.buyer_email}</p>
                  </div>
                </div>
                {getStatusBadge(req.status, req.buyer_confirmed, req.seller_confirmed)}
              </div>

              <div className="td-request-details">
                <div className="td-detail-row">
                  <span className="td-label">Buyer's Message:</span>
                  <span>{req.buyer_message || "No message provided"}</span>
                </div>
                {req.preferred_date && (
                  <div className="td-detail-row">
                    <span className="td-label">Buyer's Preferred Date:</span>
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
                {req.status === "date_suggested" && req.seller_confirmed === 0 && (
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
                {req.status === "date_suggested" && req.seller_confirmed === 1 && req.buyer_confirmed === 0 && (
                  <div className="td-waiting-message">
                    ⏳ Waiting for buyer to confirm the date...
                  </div>
                )}
                {req.status === "confirmed" && (
                  <div className="td-confirmed-message">
                    🎉 Test drive confirmed! Buyer will visit on {req.suggested_date ? new Date(req.suggested_date).toLocaleDateString() : "the scheduled date"}
                  </div>
                )}
                {req.status === "date_change_requested" && (
                  <div className="td-waiting-message">
                    ⏳ Admin is reviewing the date change request...
                  </div>
                )}
                {req.status === "pending" && (
                  <div className="td-waiting-message">
                    ⏳ Waiting for admin to suggest a date...
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
    </div>
  );
};

export default SellerTestDriveRequests;