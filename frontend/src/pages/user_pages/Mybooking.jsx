// pages/Mybooking.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../assets/css/MyBookings.css";

const Mybooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });
  const token = localStorage.getItem("token");
  const carFromState = location.state?.car;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/my-bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
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
    if (token) {
      fetchBookings();
    } else {
      setLoading(false);
      setError("Please login to view your bookings");
    }
  }, [token]);

  // Handle car from state after bookings are loaded
  useEffect(() => {
    if (bookings.length > 0 && carFromState && !showBookingForm) {
      const isAlreadyBooked = bookings.some(
        booking => booking.car_id === carFromState.id
      );
      
      if (isAlreadyBooked) {
        alert("This car is already booked! You cannot book it again.");
        window.history.replaceState({}, document.title);
      } else {
        setSelectedCar(carFromState);
        setShowBookingForm(true);
      }
    }
  }, [bookings, carFromState]);

  const createBooking = async () => {
    setLoading(true);
    try {
      // Double-check if already booked
      const isAlreadyBooked = bookings.some(
        booking => booking.car_id === selectedCar.id
      );
      
      if (isAlreadyBooked) {
        alert("This car is already booked!");
        setShowBookingForm(false);
        setSelectedCar(null);
        setLoading(false);
        return;
      }
      
      // Create booking
      const response = await fetch("http://localhost:5000/api/create-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          carId: selectedCar.id,
          finalPrice: selectedCar.expected_price,
          useNegotiatedPrice: false
        })
      });
      const data = await response.json();
      
      if (data.success) {
        // Update payment status
        const paymentResponse = await fetch(`http://localhost:5000/api/booking/payment/${data.bookingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
            paymentId: "PAY_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
          })
        });
        
        const paymentData = await paymentResponse.json();
        
        if (paymentData.success) {
          alert(`Booking successful! Booking ID: ${data.bookingId}\n\nSeller Details:\nName: ${data.sellerDetails.name}\nEmail: ${data.sellerDetails.email}\nPhone: ${data.sellerDetails.phone}\n\nRemaining amount ₹${data.remainingAmount.toLocaleString()} to be paid to seller at delivery.`);
          
          // Clear everything FIRST
          setShowBookingForm(false);
          setSelectedCar(null);
          setBookingStep(1);
          window.history.replaceState({}, document.title);
          
          // Then refresh bookings
          await fetchBookings();
        } else {
          setError("Payment failed. Please try again.");
        }
      } else {
        setError(data.message || "Failed to create booking");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmReceipt = async (bookingId) => {
    if (window.confirm("Have you received the car and paid the remaining amount to the seller?")) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/booking/buyer-received/${bookingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          alert("Thank you for confirming! Transaction completed.");
          fetchBookings();
        } else {
          alert(data.message || "Failed to confirm receipt");
        }
      } catch (err) {
        console.error(err);
        alert("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCardChange = (e) => {
    setCardDetails({
      ...cardDetails,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    setBookingStep(bookingStep + 1);
  };

  const prevStep = () => {
    setBookingStep(bookingStep - 1);
  };

  const getStatusBadge = (status, paymentStatus, buyerConfirmed, sellerConfirmed) => {
    if (status === "completed") {
      return <span className="status-badge completed">✅ Completed - Car Delivered</span>;
    }
    if (status === "confirmed" && paymentStatus === "booking_paid") {
      if (buyerConfirmed === 1 && sellerConfirmed === 1) {
        return <span className="status-badge completed">✅ Both Confirmed - Complete</span>;
      }
      if (buyerConfirmed === 1) {
        return <span className="status-badge partial">👍 You Confirmed - Waiting for Seller</span>;
      }
      if (sellerConfirmed === 1) {
        return <span className="status-badge partial">🚚 Seller Delivered - Confirm Receipt</span>;
      }
      return <span className="status-badge confirmed">📦 Booking Confirmed - Awaiting Delivery</span>;
    }
    return <span className="status-badge pending">⏳ Pending Payment</span>;
  };

  if (loading && !showBookingForm) {
    return (
      <div className="bookings-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const bookingAmount = selectedCar ? selectedCar.expected_price * 0.10 : 0;
  const remainingAmount = selectedCar ? selectedCar.expected_price * 0.90 : 0;

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1 className=" mt-5">My Bookings</h1>
        <p>Track your car purchases</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Booking Form Modal */}
      {showBookingForm && selectedCar && (
        <div className="modal-overlay">
          <div className="booking-form-modal">
            <div className="modal-header">
              <h2>Book Your Car</h2>
              <button className="close-btn" onClick={() => {
                setShowBookingForm(false);
                setSelectedCar(null);
                window.history.replaceState({}, document.title);
              }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="progress-steps">
                <div className={`step ${bookingStep >= 1 ? 'active' : ''} ${bookingStep > 1 ? 'completed' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">Car Details</div>
                </div>
                <div className={`step ${bookingStep >= 2 ? 'active' : ''} ${bookingStep > 2 ? 'completed' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">Payment</div>
                </div>
                <div className={`step ${bookingStep >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-label">Confirm</div>
                </div>
              </div>

              {bookingStep === 1 && (
                <>
                  <div className="car-summary">
                    <h3>{selectedCar.car_brand} {selectedCar.car_model}</h3>
                    <p>Price: ₹{parseInt(selectedCar.expected_price).toLocaleString()}</p>
                  </div>
                  <div className="price-breakdown">
                    <div className="price-row">
                      <span>Car Price:</span>
                      <span>₹{parseInt(selectedCar.expected_price).toLocaleString()}</span>
                    </div>
                    <div className="price-row">
                      <span>Platform Commission (10%):</span>
                      <span>₹{parseInt(bookingAmount).toLocaleString()}</span>
                    </div>
                    <div className="price-row total">
                      <span>Booking Amount (Pay Now):</span>
                      <span>₹{parseInt(bookingAmount).toLocaleString()}</span>
                    </div>
                    <div className="price-row">
                      <span>Remaining (Pay at Delivery):</span>
                      <span>₹{parseInt(remainingAmount).toLocaleString()}</span>
                    </div>
                  </div>
                  <button className="next-btn" onClick={nextStep}>
                    Continue to Payment →
                  </button>
                </>
              )}

              {bookingStep === 2 && (
                <>
                  <div className="payment-methods">
                    <h4>Select Payment Method</h4>
                    <div className="payment-options">
                      <div className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`} onClick={() => setPaymentMethod('card')}>
                        <span className="payment-icon">💳</span>
                        <span className="payment-name">Credit/Debit Card</span>
                      </div>
                      <div className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`} onClick={() => setPaymentMethod('upi')}>
                        <span className="payment-icon">📱</span>
                        <span className="payment-name">UPI</span>
                      </div>
                      <div className={`payment-option ${paymentMethod === 'netbanking' ? 'selected' : ''}`} onClick={() => setPaymentMethod('netbanking')}>
                        <span className="payment-icon">🏦</span>
                        <span className="payment-name">Net Banking</span>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="card-details">
                      <div className="form-group">
                        <label>Card Number</label>
                        <input
                          type="text"
                          name="number"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.number}
                          onChange={handleCardChange}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiry Date</label>
                          <input
                            type="text"
                            name="expiry"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={handleCardChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>CVV</label>
                          <input
                            type="password"
                            name="cvv"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Cardholder Name</label>
                        <input
                          type="text"
                          name="name"
                          placeholder="John Doe"
                          value={cardDetails.name}
                          onChange={handleCardChange}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="form-group">
                      <label>UPI ID</label>
                      <input type="text" placeholder="username@okhdfcbank" />
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="form-group">
                      <label>Select Bank</label>
                      <select className="form-group select">
                        <option>State Bank of India</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                  <div className="button-group">
                    <button className="back-btn" onClick={prevStep}>← Back</button>
                    <button className="next-btn" onClick={nextStep}>Continue →</button>
                  </div>
                </>
              )}

              {bookingStep === 3 && (
                <>
                  <div className="booking-summary">
                    <p><strong>Booking Summary</strong></p>
                    <p>Car: {selectedCar.car_brand} {selectedCar.car_model}</p>
                    <p>Booking Amount: ₹{parseInt(bookingAmount).toLocaleString()}</p>
                    <p>Payment Method: {paymentMethod.toUpperCase()}</p>
                  </div>
                  <div className="button-group">
                    <button className="back-btn" onClick={prevStep}>← Back</button>
                    <button className="confirm-booking-btn" onClick={createBooking}>
                      Confirm & Pay ₹{parseInt(bookingAmount).toLocaleString()}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Existing Bookings List */}
      {bookings.length === 0 && !showBookingForm ? (
        <div className="no-bookings">
          <div className="no-bookings-icon">🚗</div>
          <h3>No bookings yet</h3>
          <p>Complete a test drive and book your dream car</p>
          <button onClick={() => navigate("/my-test-drives")} className="browse-btn">
            View Test Drives
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="car-info">
                  <img 
                    src={booking.car_images && booking.car_images[0] ? `http://localhost:5000${booking.car_images[0]}` : "https://via.placeholder.com/80"}
                    alt={booking.car_model}
                  />
                  <div>
                    <h3>{booking.car_brand} {booking.car_model}</h3>
                    <p>Seller: {booking.seller_name}</p>
                  </div>
                </div>
                {getStatusBadge(booking.status, booking.payment_status, booking.buyer_confirmed, booking.seller_confirmed)}
              </div>
              <div className="booking-details">
                <div className="detail-row">
                  <span>Final Price:</span>
                  <span>₹{parseInt(booking.final_price).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Booking Amount Paid:</span>
                  <span>₹{parseInt(booking.booking_amount).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Remaining to Pay:</span>
                  <span>₹{parseInt(booking.remaining_amount).toLocaleString()}</span>
                </div>
                {booking.seller_phone && (
                  <div className="detail-row">
                    <span>Seller Contact:</span>
                    <span>{booking.seller_phone}</span>
                  </div>
                )}
              </div>
              <div className="booking-actions">
                {booking.status === "confirmed" && booking.payment_status === "booking_paid" && booking.seller_confirmed === 1 && booking.buyer_confirmed === 0 && (
                  <button 
                    className="received-btn"
                    onClick={() => confirmReceipt(booking.id)}
                  >
                    🚗 I Have Received the Car
                  </button>
                )}
                {booking.status === "confirmed" && booking.payment_status === "booking_paid" && booking.seller_confirmed === 0 && (
                  <div className="waiting-message">
                    ⏳ Seller has not marked as delivered yet.
                  </div>
                )}
                {booking.status === "completed" && (
                  <div className="completed-message">
                    ✅ Transaction completed! Thank you for choosing CarMarket.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Mybooking;