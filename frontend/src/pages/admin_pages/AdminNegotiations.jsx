// pages/AdminNegotiations.jsx
import React, { useState, useEffect } from "react";
import "../../assets/css/AdminNegotiations.css";

const AdminNegotiations = () => {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const token = localStorage.getItem("token");

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/negotiations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNegotiations(data.negotiations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiations();
  }, []);

  const handleAction = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/negotiate/${selectedNegotiation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, adminMessage })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Negotiation ${action}d successfully`);
        setShowModal(false);
        fetchNegotiations();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "pending": return <span className="badge pending">⏳ Pending</span>;
      case "admin_approved": return <span className="badge admin-approved">✅ Admin Approved</span>;
      case "admin_rejected": return <span className="badge rejected">❌ Admin Rejected</span>;
      case "seller_approved": return <span className="badge approved">👍 Seller Approved</span>;
      case "seller_rejected": return <span className="badge rejected">👎 Seller Rejected</span>;
      default: return <span className="badge pending">{status}</span>;
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-negotiations">
      <div className="container">
        <h1 className=" mt-5 mb-3">Price Negotiation Requests</h1>
        
        <div className="negotiations-list">
          {negotiations.map(neg => (
            <div key={neg.id} className="negotiation-card">
              <div className="card-header">
                <h3>{neg.car_brand} {neg.car_model}</h3>
                {getStatusBadge(neg.status)}
              </div>
              <div className="card-body">
                <p><strong>Buyer:</strong> {neg.buyer_name} ({neg.buyer_email})</p>
                <p><strong>Seller:</strong> {neg.seller_name} ({neg.seller_email})</p>
                <p><strong>Original Price:</strong> ₹{parseInt(neg.original_price).toLocaleString()}</p>
                <p><strong>Offered Price:</strong> <span className="offered">₹{parseInt(neg.offered_price).toLocaleString()}</span></p>
                <p><strong>Difference:</strong> ₹{(neg.original_price - neg.offered_price).toLocaleString()} saved</p>
              </div>
              {neg.status === "pending" && (
                <div className="card-actions">
                  <button onClick={() => { setSelectedNegotiation(neg); setAction("approve"); setShowModal(true); }} className="approve-btn">
                    ✅ Approve
                  </button>
                  <button onClick={() => { setSelectedNegotiation(neg); setAction("reject"); setShowModal(true); }} className="reject-btn">
                    ❌ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{action === "approve" ? "Approve Negotiation" : "Reject Negotiation"}</h3>
            <textarea
              placeholder="Add message to buyer and seller (optional)"
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              rows="3"
            />
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleAction} className={action === "approve" ? "approve" : "reject"}>
                {action === "approve" ? "Yes, Approve" : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNegotiations;