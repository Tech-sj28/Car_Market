// pages/AdminTestDriveRequests.jsx
import React, { useState, useEffect } from "react";
import "../../assets/css/TestDriveRequests.css";

const AdminTestDriveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [suggestedDate, setSuggestedDate] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/test-drive/admin-requests", {
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

  const suggestDate = async () => {
    if (!suggestedDate) {
      setError("Please select a date");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/test-drive/suggest-date/${selectedRequest.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ suggestedDate, adminMessage })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Date suggested successfully!");
        setShowDateModal(false);
        setSuggestedDate("");
        setAdminMessage("");
        fetchRequests();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to suggest date");
    }
  };

  const getFilteredRequests = () => {
    if (activeTab === "pending") {
      return requests.filter(r => r.status === "pending");
    }
    if (activeTab === "date_suggested") {
      return requests.filter(r => r.status === "date_suggested");
    }
    if (activeTab === "date_change_requested") {
      return requests.filter(r => r.status === "date_change_requested");
    }
    if (activeTab === "confirmed") {
      return requests.filter(r => r.status === "confirmed");
    }
    return requests;
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "pending": return <span className="td-status-badge td-pending">⏳ Pending</span>;
      case "date_suggested": return <span className="td-status-badge td-suggested">📅 Date Suggested</span>;
      case "date_change_requested": return <span className="td-status-badge td-warning">🔄 Date Change Requested</span>;
      case "confirmed": return <span className="td-status-badge td-confirmed">✅ Confirmed</span>;
      default: return <span className="td-status-badge td-pending">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="td-container">
        <div className="td-loading-spinner"></div>
        <p>Loading requests...</p>
      </div>
    );
  }

  const filteredRequests = getFilteredRequests();

  return (
    <div className="td-container">
      <div className="td-header">
        <h1 className=" mt-5">Test Drive Requests Management</h1>
        <p>Manage and schedule test drive requests from buyers</p>
      </div>

      {successMessage && <div className="td-success-message">{successMessage}</div>}
      {error && <div className="td-error-message">{error}</div>}

      <div className="td-admin-tabs">
        <button className={`td-tab ${activeTab === "pending" ? "td-active" : ""}`} onClick={() => setActiveTab("pending")}>
          Pending ({requests.filter(r => r.status === "pending").length})
        </button>
        <button className={`td-tab ${activeTab === "date_suggested" ? "td-active" : ""}`} onClick={() => setActiveTab("date_suggested")}>
          Date Suggested ({requests.filter(r => r.status === "date_suggested").length})
        </button>
        <button className={`td-tab ${activeTab === "date_change_requested" ? "td-active" : ""}`} onClick={() => setActiveTab("date_change_requested")}>
          Date Change Requested ({requests.filter(r => r.status === "date_change_requested").length})
        </button>
        <button className={`td-tab ${activeTab === "confirmed" ? "td-active" : ""}`} onClick={() => setActiveTab("confirmed")}>
          Confirmed ({requests.filter(r => r.status === "confirmed").length})
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="td-no-requests">
          <div className="td-no-requests-icon">📋</div>
          <h3>No {activeTab.replace("_", " ")} requests</h3>
        </div>
      ) : (
        <div className="td-requests-list">
          {filteredRequests.map((req) => (
            <div key={req.id} className="td-request-card td-admin-card">
              <div className="td-request-header">
                <div className="td-car-info">
                  <div>
                    <h3>{req.car_brand} {req.car_model}</h3>
                    <p>Price: ₹{parseInt(req.expected_price).toLocaleString()}</p>
                  </div>
                </div>
                {getStatusBadge(req.status)}
              </div>

              <div className="td-request-details">
                <div className="td-detail-row">
                  <span className="td-label">Buyer:</span>
                  <span>{req.buyer_name} ({req.buyer_email} | {req.buyer_phone})</span>
                </div>
                <div className="td-detail-row">
                  <span className="td-label">Seller:</span>
                  <span>{req.seller_name} ({req.seller_email} | {req.seller_phone})</span>
                </div>
                <div className="td-detail-row">
                  <span className="td-label">Buyer's Message:</span>
                  <span>{req.buyer_message || "No message"}</span>
                </div>
                {req.preferred_date && (
                  <div className="td-detail-row">
                    <span className="td-label">Buyer's Preferred Date:</span>
                    <span>{new Date(req.preferred_date).toLocaleDateString()}</span>
                  </div>
                )}
                {req.suggested_date && (
                  <div className="td-detail-row td-suggested-date">
                    <span className="td-label">Suggested Date:</span>
                    <span className="td-highlight">{new Date(req.suggested_date).toLocaleDateString()}</span>
                  </div>
                )}
                {req.buyer_confirmed === 1 && (
                  <div className="td-detail-row">
                    <span className="td-label">Buyer Confirmed:</span>
                    <span className="td-confirmed-text">✅ Yes</span>
                  </div>
                )}
                {req.seller_confirmed === 1 && (
                  <div className="td-detail-row">
                    <span className="td-label">Seller Confirmed:</span>
                    <span className="td-confirmed-text">✅ Yes</span>
                  </div>
                )}
                {req.requested_new_date && (
                  <div className="td-detail-row">
                    <span className="td-label">Requested New Date:</span>
                    <span>{new Date(req.requested_new_date).toLocaleDateString()}</span>
                    <span className="td-reason">Reason: {req.date_change_reason}</span>
                    <span className="td-requested-by">Requested by: {req.date_change_requested_by}</span>
                  </div>
                )}
              </div>

              <div className="td-request-actions">
                {req.status === "pending" && (
                  <button onClick={() => {
                    setSelectedRequest(req);
                    setShowDateModal(true);
                  }} className="td-schedule-btn">
                    📅 Schedule Test Drive Date
                  </button>
                )}
                {req.status === "date_change_requested" && (
                  <button onClick={() => {
                    setSelectedRequest(req);
                    setShowDateModal(true);
                  }} className="td-schedule-btn">
                    📅 Review & Suggest New Date
                  </button>
                )}
                {(req.status === "date_suggested" || req.status === "date_change_requested") && (
                  <div className="td-status-info">
                    Buyer: {req.buyer_confirmed === 1 ? "✅ Confirmed" : "⏳ Pending"} | 
                    Seller: {req.seller_confirmed === 1 ? "✅ Confirmed" : "⏳ Pending"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Date Modal */}
      {showDateModal && selectedRequest && (
        <div className="td-modal-overlay" onClick={() => setShowDateModal(false)}>
          <div className="td-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="td-modal-header">
              <h2>Schedule Test Drive</h2>
              <button className="td-close-btn" onClick={() => setShowDateModal(false)}>✕</button>
            </div>
            <div className="td-modal-body">
              <p><strong>Car:</strong> {selectedRequest.car_brand} {selectedRequest.car_model}</p>
              <p><strong>Buyer:</strong> {selectedRequest.buyer_name}</p>
              <p><strong>Seller:</strong> {selectedRequest.seller_name}</p>
              
              <div className="td-form-group">
                <label>Select Test Drive Date *</label>
                <input
                  type="date"
                  value={suggestedDate}
                  onChange={(e) => setSuggestedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="td-form-group">
                <label>Message to Both Parties (Optional)</label>
                <textarea
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Add any instructions or notes for both buyer and seller..."
                  rows="3"
                />
              </div>
            </div>
            <div className="td-modal-actions">
              <button className="td-cancel-btn" onClick={() => setShowDateModal(false)}>Cancel</button>
              <button className="td-submit-btn" onClick={suggestDate}>Suggest Date</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestDriveRequests;