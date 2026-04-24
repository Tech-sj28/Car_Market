// pages/SellerBookings.jsx
import React, { useState, useEffect } from "react";
import "../../assets/css/SellerBookings.css";

const SellerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/seller/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log("API Response:", data);
      
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

  // Mark as delivered (seller confirms delivery)
  const markAsDelivered = async (bookingId) => {
    if (window.confirm("Have you delivered the car to the buyer and received the remaining payment?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/booking/seller-delivered/${bookingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          alert("Delivery marked! Waiting for buyer to confirm receipt.");
          fetchBookings();
        } else {
          alert(data.message || "Failed to mark delivery");
        }
      } catch (err) {
        console.error(err);
        alert("Server error. Please try again.");
      }
    }
  };

  const getStatusBadge = (status, paymentStatus, buyerConfirmed, sellerConfirmed) => {
    if (status === "completed") {
      return <span className="status-badge completed">✅ Completed - Car Sold</span>;
    }
    if (status === "confirmed" && paymentStatus === "booking_paid") {
      if (buyerConfirmed === 1 && sellerConfirmed === 1) {
        return <span className="status-badge completed">✅ Both Confirmed - Complete</span>;
      }
      if (sellerConfirmed === 1) {
        return <span className="status-badge partial">👍 You Delivered - Waiting for Buyer</span>;
      }
      if (buyerConfirmed === 1) {
        return <span className="status-badge partial">📦 Buyer Confirmed - Waiting for You</span>;
      }
      return <span className="status-badge confirmed">📦 Ready for Delivery</span>;
    }
    return <span className="status-badge pending">⏳ Pending Payment</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="seller-bookings-container">
        <div className="loading-spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  const totalEarnings = bookings.reduce((sum, b) => sum + parseFloat(b.remaining_amount || 0), 0);
  const pendingDelivery = bookings.filter(b => b.status === "confirmed" && b.payment_status === "booking_paid" && (b.seller_confirmed === 0 || b.seller_confirmed === null)).length;
  const completedSales = bookings.filter(b => b.status === "completed").length;

  return (
    <div className="seller-bookings-container">
      <div className="seller-bookings-header">
        <h1 className=" mt-5">My Car Sales</h1>
        <p>Track bookings and payments for your cars</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Cars Sold</h3>
            <p className="stat-number">{completedSales}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Pending Amount (To Receive)</h3>
            <p className="stat-number">₹{totalEarnings.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-info">
            <h3>Ready for Delivery</h3>
            <p className="stat-number">{pendingDelivery}</p>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <div className="no-bookings-icon">🚗</div>
          <h3>No bookings yet</h3>
          <p>When buyers book your cars, they will appear here</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            // Check if button should show
            const showDeliverButton = booking.status === "confirmed" && 
                                     booking.payment_status === "booking_paid" && 
                                     (booking.seller_confirmed === 0 || booking.seller_confirmed === null);
            
            console.log(`Booking ${booking.id}: showDeliverButton = ${showDeliverButton}`, {
              status: booking.status,
              payment_status: booking.payment_status,
              seller_confirmed: booking.seller_confirmed
            });
            
            return (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="car-info">
                    <img 
                      src={booking.car_images && booking.car_images[0] ? `http://localhost:5000${booking.car_images[0]}` : "https://via.placeholder.com/80"}
                      alt={booking.car_model}
                    />
                    <div>
                      <h3>{booking.car_brand} {booking.car_model}</h3>
                      <p>Buyer: {booking.buyer_name}</p>
                      <p>Contact: {booking.buyer_phone || booking.buyer_email}</p>
                    </div>
                  </div>
                  {getStatusBadge(booking.status, booking.payment_status, booking.buyer_confirmed, booking.seller_confirmed)}
                </div>

                <div className="booking-details">
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="label">Booking ID:</span>
                      <span>#{booking.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Booking Date:</span>
                      <span>{formatDate(booking.created_at)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Final Price:</span>
                      <span className="price">₹{parseInt(booking.final_price).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Platform Commission (10%):</span>
                      <span>₹{parseInt(booking.platform_commission).toLocaleString()}</span>
                    </div>
                    <div className="detail-item highlight">
                      <span className="label">You Will Receive at Delivery:</span>
                      <span className="amount">₹{parseInt(booking.remaining_amount).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Buyer's Booking Amount Paid:</span>
                      <span>₹{parseInt(booking.booking_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="booking-actions">
                  {showDeliverButton && (
                    <button 
                      className="deliver-btn"
                      onClick={() => markAsDelivered(booking.id)}
                    >
                      🚚 Mark as Delivered & Received Payment
                    </button>
                  )}
                  
                  {booking.status === "confirmed" && 
                   booking.seller_confirmed === 1 && 
                   booking.buyer_confirmed === 0 && (
                    <div className="waiting-message">
                      ⏳ Waiting for buyer to confirm receipt...
                    </div>
                  )}
                  
                  {booking.status === "completed" && (
                    <div className="completed-message">
                      🎉 Sale completed! Thank you for using CarMarket.
                    </div>
                  )}
                  
                  <button 
                    className="view-details-btn"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowModal(true);
                    }}
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            );
          })}
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
                <h3>Payment Summary</h3>
                <div className="detail-row">
                  <span>Car Price:</span>
                  <span>₹{parseInt(selectedBooking.final_price).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Platform Commission (10%):</span>
                  <span>₹{parseInt(selectedBooking.platform_commission).toLocaleString()}</span>
                </div>
                <div className="detail-row highlight">
                  <span>Your Payout at Delivery:</span>
                  <span className="payout">₹{parseInt(selectedBooking.remaining_amount).toLocaleString()}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Delivery Status</h3>
                <div className="detail-row">
                  <span>Your Confirmation (Seller):</span>
                  <span>{selectedBooking.seller_confirmed === 1 ? "✅ Confirmed" : "⏳ Not yet"}</span>
                </div>
                <div className="detail-row">
                  <span>Buyer Confirmation:</span>
                  <span>{selectedBooking.buyer_confirmed === 1 ? "✅ Confirmed" : "⏳ Not yet"}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Delivery Instructions</h3>
                <ul className="instructions">
                  <li>Contact the buyer using the contact details above</li>
                  <li>Schedule a convenient time for delivery</li>
                  <li>Collect the remaining payment of ₹{parseInt(selectedBooking.remaining_amount).toLocaleString()} at delivery</li>
                  <li>After delivery, click "Mark as Delivered" button</li>
                  <li>The buyer will confirm receipt of the vehicle</li>
                  <li>Once both confirm, the sale is complete</li>
                </ul>
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

export default SellerBookings;