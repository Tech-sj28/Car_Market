// pages/AdminBookings.jsx
import React, { useState, useEffect } from "react";
import "../../assets/css/AdminBookings.css";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log("Admin bookings data:", data);
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getFilteredBookings = () => {
    if (filter === "all") return bookings;
    if (filter === "booking_paid") return bookings.filter(b => b.payment_status === "booking_paid");
    if (filter === "confirmed") return bookings.filter(b => b.status === "confirmed");
    if (filter === "completed") return bookings.filter(b => b.status === "completed");
    if (filter === "delivered") return bookings.filter(b => b.status === "delivered");
    return bookings;
  };

  const getStatusBadge = (status, paymentStatus) => {
    // First check for completed status
    if (status === "completed" || paymentStatus === "full_paid") {
      return <span className="status-badge completed">✅ Completed - Car Sold</span>;
    }
    if (status === "delivered") {
      return <span className="status-badge delivered">✅ Delivered</span>;
    }
    if (status === "confirmed" && paymentStatus === "booking_paid") {
      return <span className="status-badge confirmed">📦 Booking Confirmed - Awaiting Delivery</span>;
    }
    if (paymentStatus === "booking_paid") {
      return <span className="status-badge paid">💰 Booking Amount Paid</span>;
    }
    return <span className="status-badge pending">⏳ Pending Payment</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="admin-bookings-container">
        <div className="loading-spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();
  const totalCommission = bookings.reduce((sum, b) => sum + parseFloat(b.platform_commission), 0);
  const totalBookingAmount = bookings.reduce((sum, b) => sum + parseFloat(b.booking_amount), 0);
  const completedCount = bookings.filter(b => b.status === "completed").length;

  return (
    <div className="admin-bookings-container">
      <div className="admin-bookings-header">
        <h1 className=" mt-5">Booking Management</h1>
        <p>Track all car bookings and payments</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <p className="stat-number">{bookings.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Commission Earned</h3>
            <p className="stat-number">₹{totalCommission.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-info">
            <h3>Total Booking Amount</h3>
            <p className="stat-number">₹{totalBookingAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Completed Sales</h3>
            <p className="stat-number">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button className={`filter-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All ({bookings.length})
        </button>
        <button className={`filter-tab ${filter === "booking_paid" ? "active" : ""}`} onClick={() => setFilter("booking_paid")}>
          Booking Paid ({bookings.filter(b => b.payment_status === "booking_paid").length})
        </button>
        <button className={`filter-tab ${filter === "confirmed" ? "active" : ""}`} onClick={() => setFilter("confirmed")}>
          Confirmed ({bookings.filter(b => b.status === "confirmed").length})
        </button>
        <button className={`filter-tab ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>
          Completed ({completedCount})
        </button>
        <button className={`filter-tab ${filter === "delivered" ? "active" : ""}`} onClick={() => setFilter("delivered")}>
          Delivered ({bookings.filter(b => b.status === "delivered").length})
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <div className="no-bookings-icon">📋</div>
          <h3>No bookings found</h3>
        </div>
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Car Details</th>
                <th>Buyer</th>
                <th>Seller</th>
                <th>Final Price</th>
                <th>Commission (10%)</th>
                <th>Seller Gets</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>
                    <div className="car-cell">
                      <img 
                        src={booking.car_images && booking.car_images[0] ? `http://localhost:5000${booking.car_images[0]}` : "https://via.placeholder.com/40"}
                        alt={booking.car_model}
                      />
                      <div>
                        <strong>{booking.car_brand} {booking.car_model}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{booking.buyer_name}</div>
                      <small>{booking.buyer_email}</small>
                      <div><small>{booking.buyer_phone}</small></div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{booking.seller_name}</div>
                      <small>{booking.seller_email}</small>
                      <div><small>{booking.seller_phone}</small></div>
                    </div>
                  </td>
                  <td>₹{parseInt(booking.final_price).toLocaleString()}</td>
                  <td className="commission">₹{parseInt(booking.platform_commission).toLocaleString()}</td>
                  <td className="seller-amount">₹{parseInt(booking.final_price - booking.platform_commission).toLocaleString()}</td>
                  <td>{getStatusBadge(booking.status, booking.payment_status)}</td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowModal(true);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details #{selectedBooking.id}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Car Information</h3>
                <div className="detail-row">
                  <span>Car:</span>
                  <span>{selectedBooking.car_brand} {selectedBooking.car_model}</span>
                </div>
                <div className="detail-row">
                  <span>Final Price:</span>
                  <span>₹{parseInt(selectedBooking.final_price).toLocaleString()}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Buyer Information</h3>
                <div className="detail-row">
                  <span>Name:</span>
                  <span>{selectedBooking.buyer_name}</span>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <span>{selectedBooking.buyer_email}</span>
                </div>
                <div className="detail-row">
                  <span>Phone:</span>
                  <span>{selectedBooking.buyer_phone}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Seller Information</h3>
                <div className="detail-row">
                  <span>Name:</span>
                  <span>{selectedBooking.seller_name}</span>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <span>{selectedBooking.seller_email}</span>
                </div>
                <div className="detail-row">
                  <span>Phone:</span>
                  <span>{selectedBooking.seller_phone}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Payment Summary</h3>
                <div className="detail-row">
                  <span>Booking Amount Paid:</span>
                  <span>₹{parseInt(selectedBooking.booking_amount).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Platform Commission (10%):</span>
                  <span>₹{parseInt(selectedBooking.platform_commission).toLocaleString()}</span>
                </div>
                <div className="detail-row highlight">
                  <span>Amount paid to Seller at Delivery:</span>
                  <span>₹{parseInt(selectedBooking.remaining_amount).toLocaleString()}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Booking Status</h3>
                <div className="detail-row">
                  <span>Status:</span>
                  <span>{getStatusBadge(selectedBooking.status, selectedBooking.payment_status)}</span>
                </div>
                <div className="detail-row">
                  <span>Booking Date:</span>
                  <span>{formatDate(selectedBooking.created_at)}</span>
                </div>
                {selectedBooking.completed_at && (
                  <div className="detail-row">
                    <span>Completed Date:</span>
                    <span>{formatDate(selectedBooking.completed_at)}</span>
                  </div>
                )}
                {selectedBooking.booking_payment_id && (
                  <div className="detail-row">
                    <span>Payment ID:</span>
                    <span>{selectedBooking.booking_payment_id}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;