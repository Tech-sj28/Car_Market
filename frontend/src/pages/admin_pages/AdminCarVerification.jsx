// pages/AdminCarVerification.jsx
import React, { useState, useEffect } from "react";
import "../../assets/css/AdminCarVerification.css";

const AdminCarVerification = () => {
  const [pendingCars, setPendingCars] = useState([]);
  const [approvedCars, setApprovedCars] = useState([]);
  const [rejectedCars, setRejectedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedCar, setSelectedCar] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationDate, setVerificationDate] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [viewCarModal, setViewCarModal] = useState(false);
  const [viewingCar, setViewingCar] = useState(null);

  // Fetch all cars
  const fetchAllCars = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/admin/cars", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("All cars:", data);

      if (data.success) {
        // Separate cars by status
        setPendingCars(data.cars.filter(car => car.status === "pending"));
        setApprovedCars(data.cars.filter(car => car.status === "approved"));
        setRejectedCars(data.cars.filter(car => car.status === "rejected"));
      } else {
        setError("Failed to fetch cars");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCars();
  }, []);

  // Schedule verification date
  const handleScheduleVerification = async () => {
    if (!verificationDate) {
      setError("Please select a verification date");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/cars/${selectedCar.id}/schedule-verification`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ verificationDate }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(
          `Verification scheduled for ${new Date(
            verificationDate
          ).toLocaleDateString()}`
        );
        setShowVerifyModal(false);
        setVerificationDate("");
        setSelectedCar(null);
        fetchAllCars();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.message || "Failed to schedule verification");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again.");
    }
  };

  // Approve car
  const handleApprove = async (car) => {
    // Check if verification date is passed
    if (car.verification_date && new Date(car.verification_date) > new Date()) {
      setError(
        `Cannot approve before verification date: ${new Date(
          car.verification_date
        ).toLocaleDateString()}`
      );
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/cars/${car.id}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Car approved successfully!");
        fetchAllCars();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.message || "Failed to approve car");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again.");
    }
  };

  // Open reject modal
  const handleRejectClick = (car) => {
    // Check if verification date is passed
    if (car.verification_date && new Date(car.verification_date) > new Date()) {
      setError(
        `Cannot reject before verification date: ${new Date(
          car.verification_date
        ).toLocaleDateString()}`
      );
      return;
    }
    setSelectedCar(car);
    setShowRejectModal(true);
  };

  // Confirm reject
  const handleRejectConfirm = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/cars/${selectedCar.id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Car rejected successfully!");
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedCar(null);
        fetchAllCars();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.message || "Failed to reject car");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again.");
    }
  };

  // View car details
  const handleViewCar = async (car) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/cars/${car.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setViewingCar(data.car);
        setViewCarModal(true);
      } else {
        setError("Failed to load car details");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again.");
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="status-badge pending">⏳ Pending</span>;
      case "approved":
        return <span className="status-badge approved">✅ Approved</span>;
      case "rejected":
        return <span className="status-badge rejected">❌ Rejected</span>;
      default:
        return <span className="status-badge pending">{status}</span>;
    }
  };

  // Check if verification is pending
  const isVerificationPending = (car) => {
    return car.verification_date && new Date(car.verification_date) > new Date();
  };

  // Render car card
  const renderCarCard = (car) => (
    <div key={car.id} className="admin-car-card">
      <div className="car-card-header">
        <h3>
          {car.car_brand} {car.car_model}
        </h3>
        {getStatusBadge(car.status)}
      </div>
      <div className="car-card-body">
        <div className="car-info-row">
          <span className="info-label">Seller:</span>
          <span>{car.seller_name || "Unknown"}</span>
        </div>
        <div className="car-info-row">
          <span className="info-label">Price:</span>
          <span className="price">
            ₹{parseInt(car.expected_price).toLocaleString()}
          </span>
        </div>
        <div className="car-info-row">
          <span className="info-label">Year:</span>
          <span>{car.manufacturing_year}</span>
        </div>
        <div className="car-info-row">
          <span className="info-label">City:</span>
          <span>{car.cityname || car.city_name || "-"}</span>
        </div>
        {car.verification_date && (
          <div className="car-info-row">
            <span className="info-label">Verification Date:</span>
            <span>
              {new Date(car.verification_date).toLocaleDateString()}
              {new Date(car.verification_date) > new Date() && (
                <span className="verification-pending"> (Pending)</span>
              )}
            </span>
          </div>
        )}
      </div>
      <div className="car-card-actions">
        <button className="view-btn" onClick={() => handleViewCar(car)}>
          👁️ View Details
        </button>
        {car.status === "pending" && (
          <>
            {!car.verification_date && (
              <button
                className="schedule-btn"
                onClick={() => {
                  setSelectedCar(car);
                  setShowVerifyModal(true);
                }}
              >
                📅 Schedule Verification
              </button>
            )}
            {car.verification_date && new Date(car.verification_date) <= new Date() && (
              <>
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(car)}
                >
                  ✅ Approve
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleRejectClick(car)}
                >
                  ❌ Reject
                </button>
              </>
            )}
            {car.verification_date && new Date(car.verification_date) > new Date() && (
              <div className="verification-message">
                ⏳ Waiting for verification date:{" "}
                {new Date(car.verification_date).toLocaleDateString()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-verification">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-verification">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className=" mt-5">Car Verification Dashboard</h1>
          <p>Manage and verify car listings from sellers</p>
        </div>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        {error && <div className="error-message">{error}</div>}

        <div className="tabs">
          <button
            className={`tab ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending ({pendingCars.length})
          </button>
          <button
            className={`tab ${activeTab === "approved" ? "active" : ""}`}
            onClick={() => setActiveTab("approved")}
          >
            Approved ({approvedCars.length})
          </button>
          <button
            className={`tab ${activeTab === "rejected" ? "active" : ""}`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected ({rejectedCars.length})
          </button>
        </div>

        <div className="cars-list">
          {activeTab === "pending" &&
            (pendingCars.length > 0 ? (
              pendingCars.map(renderCarCard)
            ) : (
              <div className="no-cars">No pending cars</div>
            ))}
          {activeTab === "approved" &&
            (approvedCars.length > 0 ? (
              approvedCars.map(renderCarCard)
            ) : (
              <div className="no-cars">No approved cars</div>
            ))}
          {activeTab === "rejected" &&
            (rejectedCars.length > 0 ? (
              rejectedCars.map(renderCarCard)
            ) : (
              <div className="no-cars">No rejected cars</div>
            ))}
        </div>
      </div>

      {/* Schedule Verification Modal */}
      {showVerifyModal && selectedCar && (
        <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Verification Date</h2>
              <button
                className="close-btn"
                onClick={() => setShowVerifyModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Car:</strong> {selectedCar.car_brand}{" "}
                {selectedCar.car_model}
              </p>
              <p>
                <strong>Seller:</strong> {selectedCar.seller_name || "Unknown"}
              </p>
              <div className="form-group">
                <label>Verification Date *</label>
                <input
                  type="date"
                  value={verificationDate}
                  onChange={(e) => setVerificationDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
                <small>
                  Select a date for physical verification. Admin can only
                  approve/reject after this date.
                </small>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowVerifyModal(false)}
              >
                Cancel
              </button>
              <button
                className="schedule-btn"
                onClick={handleScheduleVerification}
              >
                Schedule Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCar && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Car Listing</h2>
              <button
                className="close-btn"
                onClick={() => setShowRejectModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Car:</strong> {selectedCar.car_brand}{" "}
                {selectedCar.car_model}
              </p>
              <div className="form-group">
                <label>Reason for Rejection (Optional)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button className="reject-btn" onClick={handleRejectConfirm}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Car Details Modal */}
      {viewCarModal && viewingCar && (
        <div className="modal-overlay" onClick={() => setViewCarModal(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {viewingCar.car_brand} {viewingCar.car_model} - Details
              </h2>
              <button className="close-btn" onClick={() => setViewCarModal(false)}>
                ✕
              </button>
            </div>
            <div className="view-details-content">
              {/* Images */}
              <div className="detail-section">
                <h3>📸 Car Images</h3>
                {viewingCar.car_images && viewingCar.car_images.length > 0 ? (
                  <div className="images-grid">
                    {viewingCar.car_images.map((img, idx) => (
                      <div key={idx} className="image-card">
                        <img
                          src={`http://localhost:5000${img}`}
                          alt={`Car ${idx + 1}`}
                          onClick={() => window.open(`http://localhost:5000${img}`, "_blank")}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No images uploaded</p>
                )}
              </div>

              {/* Documents */}
              <div className="detail-section">
                <h3>📄 Documents</h3>
                {viewingCar.documents && viewingCar.documents.length > 0 ? (
                  <div className="documents-list">
                    {viewingCar.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={`http://localhost:5000${doc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="document-link"
                      >
                        📄 {doc.split("/").pop()}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p>No documents uploaded</p>
                )}
              </div>

              {/* Car Details */}
              <div className="detail-section">
                <h3>🚗 Car Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span>Brand:</span> <strong>{viewingCar.car_brand}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Model:</span> <strong>{viewingCar.car_model}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Variant:</span> <strong>{viewingCar.variant || "-"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Year:</span> <strong>{viewingCar.manufacturing_year}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Fuel Type:</span> <strong>{viewingCar.fuel_type || "-"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Transmission:</span>{" "}
                    <strong>{viewingCar.transmission_type || "-"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Ownership:</span>{" "}
                    <strong>{viewingCar.ownership_count || "-"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Price:</span>{" "}
                    <strong className="price">
                      ₹{parseInt(viewingCar.expected_price).toLocaleString()}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>Mileage:</span>{" "}
                    <strong>
                      {viewingCar.mileage
                        ? `${viewingCar.mileage.toLocaleString()} km`
                        : "-"}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>Condition:</span>{" "}
                    <strong>{viewingCar.vehicle_condition || "-"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Accident History:</span>{" "}
                    <strong>{viewingCar.accident_history || "-"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Service History:</span>{" "}
                    <strong>{viewingCar.service_history_available || "-"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Insurance Valid Till:</span>{" "}
                    <strong>{viewingCar.insurance_validity_date || "-"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Location:</span>{" "}
                    <strong>
                      {viewingCar.locality
                        ? `${viewingCar.locality}, `
                        : ""}
                      {viewingCar.cityname || viewingCar.city_name || "-"}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>Owner Name:</span>{" "}
                    <strong>{viewingCar.car_owner_name || "-"}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="close-btn" onClick={() => setViewCarModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCarVerification;