// pages/SellerDashboard.jsx
import React, { useState, useEffect } from "react";
import "../../assets/css/SellerDashboard.css";

const SellerDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [features, setFeatures] = useState({});
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingCar, setViewingCar] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Feature list for checkboxes
  const featureList = [
    { key: "ac", label: "AC" },
    { key: "powerSteering", label: "Power Steering" },
    { key: "powerWindows", label: "Power Windows" },
    { key: "airbags", label: "Airbags" },
    { key: "abs", label: "ABS" },
    { key: "centralLocking", label: "Central Locking" },
    { key: "alloyWheels", label: "Alloy Wheels" },
    { key: "bluetooth", label: "Bluetooth" },
    { key: "androidAuto", label: "Android Auto" },
    { key: "appleCarPlay", label: "Apple CarPlay" },
    { key: "reverseCamera", label: "Reverse Camera" },
    { key: "parkingSensors", label: "Parking Sensors" },
    { key: "sunroof", label: "Sunroof" },
    { key: "cruiseControl", label: "Cruise Control" },
    { key: "navigationSystem", label: "Navigation System" },
    { key: "musicSystem", label: "Music System" },
  ];

  // Fetch seller's listings
  const fetchListings = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/cars/my-listings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("Listings data:", data);

      if (data.success) {
        setListings(data.listings);
      } else {
        setError("Failed to fetch listings");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Fetch full car details including images and documents
  const fetchCarDetails = async (carId) => {
    const token = localStorage.getItem("token");

    try {
      console.log("Fetching details for car ID:", carId);
      const response = await fetch(`http://localhost:5000/api/cars/${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Car details response:", data);

      if (data.success) {
        return data.car;
      } else {
        console.error("Error from server:", data.message);
        return null;
      }
    } catch (err) {
      console.error("Error fetching car details:", err);
      return null;
    }
  };

  // View full car details with images and documents
  const handleViewDetails = async (car) => {
    setLoadingDetails(true);
    const token = localStorage.getItem('token');
    
    console.log("=== VIEW DETAILS ===");
    console.log("Car object:", car);
    
    try {
      const response = await fetch(`http://localhost:5000/api/cars/${car.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log("API Response:", data);
      
      if (data.success) {
        console.log("City value from backend:", data.car.cityname);
        console.log("Full car data:", data.car);
        
        setViewingCar(data.car);
        setViewModalOpen(true);
      } else {
        alert("Failed to load car details");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error loading car details");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Open edit modal with full car data
  const handleEdit = async (car) => {
    const fullCarData = await fetchCarDetails(car.id);

    if (fullCarData) {
      setSelectedCar(fullCarData);
      setEditFormData({
        carBrand: fullCarData.car_brand,
        carModel: fullCarData.car_model,
        variant: fullCarData.variant || "",
        manufacturingYear: fullCarData.manufacturing_year || "",
        fuelType: fullCarData.fuel_type || "",
        transmissionType: fullCarData.transmission_type || "",
        ownershipCount: fullCarData.ownership_count || "",
        expectedPrice: fullCarData.expected_price,
        mileage: fullCarData.mileage || "",
        vehicleCondition: fullCarData.vehicle_condition || "",
        accidentHistory: fullCarData.accident_history || "",
        serviceHistoryAvailable: fullCarData.service_history_available || "",
        insuranceValidityDate: fullCarData.insurance_validity_date || "",
        locality: fullCarData.locality || "",
        carOwnerName: fullCarData.car_owner_name || "",
        category_id: fullCarData.category_id,
        city: fullCarData.city_id,
      });
      setFeatures(fullCarData.features || {});
      setIsEditModalOpen(true);
    } else {
      alert("Failed to load car details");
    }
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle feature changes in edit modal
  const handleFeatureChange = (e) => {
    const { name, checked } = e.target;
    setFeatures((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Submit edit
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    const token = localStorage.getItem("token");

    const submitData = new FormData();
    submitData.append(
      "carData",
      JSON.stringify({
        ...editFormData,
        features: features,
        existingImages: selectedCar?.car_images || [],
        existingDocuments: selectedCar?.documents || [],
      })
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/cars/${selectedCar.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submitData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Car listing updated successfully!");
        setIsEditModalOpen(false);
        fetchListings();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        alert(data.message || "Failed to update");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Open delete confirmation
  const handleDeleteClick = (car) => {
    setCarToDelete(car);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/cars/${carToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Car listing deleted successfully!");
        setIsDeleteModalOpen(false);
        fetchListings();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server error. Please try again.");
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="status-badge pending">⏳ Pending Approval</span>;
      case "approved":
        return <span className="status-badge approved">✅ Approved</span>;
      case "rejected":
        return <span className="status-badge rejected">❌ Rejected</span>;
      case "sold":
        return <span className="status-badge sold">💰 Sold</span>;
      default:
        return <span className="status-badge pending">{status}</span>;
    }
  };

  // Get verification status message
  const getVerificationMessage = (car) => {
    if (car.verification_date && car.status === "pending") {
      const verificationDate = new Date(car.verification_date);
      const today = new Date();
      
      if (verificationDate > today) {
        return (
          <div className="verification-info">
            <span className="verification-icon">📅</span>
            <div className="verification-text">
              <strong>Verification Scheduled!</strong>
              <p>Our team will visit on <strong>{verificationDate.toLocaleDateString()}</strong> for physical verification.</p>
              <small>Please keep all documents and ensure the car is clean and available for inspection.</small>
            </div>
          </div>
        );
      } else if (verificationDate <= today && car.status === "pending") {
        return (
          <div className="verification-warning">
            <span className="warning-icon">⚠️</span>
            <div className="verification-text">
              <strong>Verification Date Passed!</strong>
              <p>The scheduled verification date ({verificationDate.toLocaleDateString()}) has passed.</p>
              <small>Please contact admin for rescheduling.</small>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  // Get rejection message
  const getRejectionMessage = (car) => {
    if (car.status === "rejected" && car.rejection_reason) {
      return (
        <div className="rejection-info">
          <span className="rejection-icon">❌</span>
          <div className="rejection-text">
            <strong>Listing Rejected!</strong>
            <p>Reason: {car.rejection_reason}</p>
            <small>Please check the issues and resubmit your listing.</small>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get approval message
  const getApprovalMessage = (car) => {
    if (car.status === "approved") {
      return (
        <div className="approval-info">
          <span className="approval-icon">✅</span>
          <div className="approval-text">
            <strong>Congratulations! Your Car is Approved!</strong>
            <p>Your car listing is now live on CarMarket. Buyers can see your car.</p>
            <small>You can now track inquiries from potential buyers.</small>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="seller-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className=" mt-5">My Car Listings</h1>
          <p>Manage your car listings - View details, edit, or delete</p>
          <button
            className="add-car-btn"
            onClick={() => (window.location.href = "/seller/add-car")}
          >
            + Add New Car
          </button>
        </div>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {error && <div className="error-message">{error}</div>}

        {listings.length === 0 ? (
          <div className="no-listings">
            <div className="no-listings-icon">🚗</div>
            <h3>No cars listed yet</h3>
            <p>Click the "Add New Car" button to list your first car</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((car) => (
              <div key={car.id} className="listing-card">
                <div className="card-header">
                  <h3>
                    {car.car_brand} {car.car_model}
                  </h3>
                  {getStatusBadge(car.status)}
                </div>
                <div className="card-details">
                  <div className="detail-row">
                    <span className="detail-label">Variant:</span>
                    <span>{car.variant || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Year:</span>
                    <span>{car.manufacturing_year}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="price">
                      ₹{parseInt(car.expected_price).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Mileage:</span>
                    <span>
                      {car.mileage ? `${car.mileage.toLocaleString()} km` : "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">City:</span>
                    <span>{car.cityname || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Category:</span>
                    <span>{car.category_name || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Listed on:</span>
                    <span>{new Date(car.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Verification Message */}
                  {getVerificationMessage(car)}
                  
                  {/* Rejection Message */}
                  {getRejectionMessage(car)}
                  
                  {/* Approval Message */}
                  {getApprovalMessage(car)}
                </div>
                <div className="card-actions">
                  <button
                    className="view-btn"
                    onClick={() => handleViewDetails(car)}
                    disabled={loadingDetails}
                  >
                    {loadingDetails ? "Loading..." : "👁️ View Details"}
                  </button>
                  {car.status === "pending" && !car.verification_date && (
                    <button className="edit-btn" onClick={() => handleEdit(car)}>
                      ✏️ Edit
                    </button>
                  )}
                  {car.status === "pending" && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteClick(car)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {viewModalOpen && viewingCar && (
        <div className="modal-overlay" onClick={() => setViewModalOpen(false)}>
          <div
            className="modal-content view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {viewingCar.car_brand} {viewingCar.car_model} - Details
              </h2>
              <button
                className="close-btn"
                onClick={() => setViewModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="view-details-content">
              {/* Car Images Section */}
              <div className="detail-section">
                <h3>📸 Car Images ({viewingCar.car_images ? viewingCar.car_images.length : 0})</h3>
                {viewingCar.car_images && viewingCar.car_images.length > 0 ? (
                  <div className="images-grid">
                    {viewingCar.car_images.map((img, idx) => {
                      const imageUrl = `http://localhost:5000${img}`;
                      return (
                        <div key={idx} className="image-card">
                          <img 
                            src={imageUrl} 
                            alt={`Car ${idx + 1}`}
                            style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer', borderRadius: '8px' }}
                            onClick={() => window.open(imageUrl, '_blank')}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect width="150" height="150" fill="%23f0f0f0"/%3E%3Ctext x="75" y="75" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-data">No images uploaded</p>
                )}
              </div>

              {/* Documents Section */}
              <div className="detail-section">
                <h3>📄 Documents ({viewingCar.documents ? viewingCar.documents.length : 0})</h3>
                {viewingCar.documents && viewingCar.documents.length > 0 ? (
                  <div className="documents-list">
                    {viewingCar.documents.map((doc, idx) => {
                      const docUrl = `http://localhost:5000${doc}`;
                      const fileName = doc.split("/").pop();
                      return (
                        <div key={idx} className="document-card">
                          <span className="doc-icon">📄</span>
                          <span className="doc-name">{fileName}</span>
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-doc-btn"
                          >
                            View Document
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-data">No documents uploaded</p>
                )}
              </div>

              {/* Car Details Section - ALL FIELDS */}
              <div className="detail-section">
                <h3>🚗 Car Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Car Brand:</span>
                    <span>{viewingCar.car_brand || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Car Model:</span>
                    <span>{viewingCar.car_model || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Variant:</span>
                    <span>{viewingCar.variant || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Manufacturing Year:</span>
                    <span>{viewingCar.manufacturing_year || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fuel Type:</span>
                    <span>{viewingCar.fuel_type || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Transmission Type:</span>
                    <span>{viewingCar.transmission_type || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ownership Count:</span>
                    <span>{viewingCar.ownership_count || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expected Price:</span>
                    <span className="price">
                      ₹{viewingCar.expected_price ? parseInt(viewingCar.expected_price).toLocaleString() : "-"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mileage:</span>
                    <span>
                      {viewingCar.mileage ? `${parseInt(viewingCar.mileage).toLocaleString()} km` : "-"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Vehicle Condition:</span>
                    <span>{viewingCar.vehicle_condition || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Accident History:</span>
                    <span>{viewingCar.accident_history || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Service History Available:</span>
                    <span>{viewingCar.service_history_available || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Insurance Validity Date:</span>
                    <span>{viewingCar.insurance_validity_date || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">City:</span>
                    <span>{viewingCar.cityname || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Locality:</span>
                    <span>{viewingCar.locality || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Car Category:</span>
                    <span>{viewingCar.category_name || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Car Owner Name:</span>
                    <span>{viewingCar.car_owner_name || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Verification Date:</span>
                    <span>{viewingCar.verification_date ? new Date(viewingCar.verification_date).toLocaleDateString() : "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span>{getStatusBadge(viewingCar.status)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Listed On:</span>
                    <span>{viewingCar.created_at ? new Date(viewingCar.created_at).toLocaleDateString() : "-"}</span>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              {viewingCar.features && Object.values(viewingCar.features).some((v) => v === true) && (
                <div className="detail-section">
                  <h3>⭐ Features</h3>
                  <div className="features-list">
                    {Object.entries(viewingCar.features).map(
                      ([key, value]) =>
                        value && (
                          <span key={key} className="feature-tag">
                            {featureList.find((f) => f.key === key)?.label || key}
                          </span>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Reason if rejected */}
              {viewingCar.status === "rejected" && viewingCar.rejection_reason && (
                <div className="detail-section rejection-section">
                  <h3>❌ Rejection Reason</h3>
                  <div className="rejection-box">
                    <p>{viewingCar.rejection_reason}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="close-modal-btn"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCar && (
        <div
          className="modal-overlay"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="modal-content edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit Car Listing</h2>
              <button
                className="close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdate} className="edit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Car Brand *</label>
                  <input
                    type="text"
                    name="carBrand"
                    value={editFormData.carBrand || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Car Model *</label>
                  <input
                    type="text"
                    name="carModel"
                    value={editFormData.carModel || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Variant</label>
                  <input
                    type="text"
                    name="variant"
                    value={editFormData.variant || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <label>Manufacturing Year *</label>
                  <select
                    name="manufacturingYear"
                    value={editFormData.manufacturingYear || ""}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select Year</option>
                    {[...Array(25)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fuel Type</label>
                  <select
                    name="fuelType"
                    value={editFormData.fuelType || ""}
                    onChange={handleEditChange}
                  >
                    <option value="">Select</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Transmission Type</label>
                  <select
                    name="transmissionType"
                    value={editFormData.transmissionType || ""}
                    onChange={handleEditChange}
                  >
                    <option value="">Select</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="CVT">CVT</option>
                    <option value="DCT">DCT</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ownership Count</label>
                  <select
                    name="ownershipCount"
                    value={editFormData.ownershipCount || ""}
                    onChange={handleEditChange}
                  >
                    <option value="">Select</option>
                    <option value="1">1st Owner</option>
                    <option value="2">2nd Owner</option>
                    <option value="3">3rd Owner</option>
                    <option value="4+">4+ Owners</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Expected Price (₹) *</label>
                  <input
                    type="number"
                    name="expectedPrice"
                    value={editFormData.expectedPrice || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mileage (km)</label>
                  <input
                    type="number"
                    name="mileage"
                    value={editFormData.mileage || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle Condition</label>
                  <select
                    name="vehicleCondition"
                    value={editFormData.vehicleCondition || ""}
                    onChange={handleEditChange}
                  >
                    <option value="">Select</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Accident History</label>
                  <select
                    name="accidentHistory"
                    value={editFormData.accidentHistory || ""}
                    onChange={handleEditChange}
                  >
                    <option value="">Select</option>
                    <option value="None">No Accidents</option>
                    <option value="Minor">Minor Accidents</option>
                    <option value="Major">Major Accidents</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Service History Available</label>
                  <select
                    name="serviceHistoryAvailable"
                    value={editFormData.serviceHistoryAvailable || ""}
                    onChange={handleEditChange}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Insurance Validity Date</label>
                  <input
                    type="date"
                    name="insuranceValidityDate"
                    value={editFormData.insuranceValidityDate || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <label>Locality</label>
                  <input
                    type="text"
                    name="locality"
                    value={editFormData.locality || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <label>Car Owner Name</label>
                  <input
                    type="text"
                    name="carOwnerName"
                    value={editFormData.carOwnerName || ""}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Car Features</h3>
                <div className="features-grid">
                  {featureList.map((feature) => (
                    <label key={feature.key} className="feature-checkbox">
                      <input
                        type="checkbox"
                        name={feature.key}
                        checked={features[feature.key] || false}
                        onChange={handleFeatureChange}
                      />
                      {feature.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={uploading}>
                  {uploading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && carToDelete && (
        <div
          className="modal-overlay"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Delete Car Listing</h2>
              <button
                className="close-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="delete-confirm">
              <div className="delete-icon">⚠️</div>
              <p>Are you sure you want to delete this car listing?</p>
              <p className="delete-car-name">
                {carToDelete.car_brand} {carToDelete.car_model}
              </p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="delete-confirm-btn"
                onClick={handleDeleteConfirm}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;