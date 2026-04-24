import React, { useState } from "react";
import "../../assets/css/BuyerRegister.css";
import Citys from "../../components/Citys";

const BuyerRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    city: ""
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ FIXED CITY FUNCTION (important)
  const citydata = (cityid) => {
    setFormData((prev) => ({
      ...prev,
      city: cityid
    }));
  };

  // ✅ BACKEND SUBMIT (same style as seller)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptTerms) {
      alert("Please accept the terms and conditions");
      return;
    }

    const payload = {
      ...formData,
      userType: "buyer"
    };

    try {
      const response = await fetch("http://localhost:5000/buyerinsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.status === 400) {
        alert(result.msg);
      } else {
        alert(result.msg || "Buyer registration successful!");

        // reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          phoneNumber: "",
          city: ""
        });

        setAcceptTerms(false);
      }
    } catch (error) {
      console.log(error);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="buyer-register-page">
      <div className="buyer-register-container mt-5">
        <div className="buyer-register-left">
          <div className="buyer-brand">
            <div className="brand-icon">🚗</div>
            <h1 className="brand-name">
              Car<span className="brand-highlight">Market</span>
            </h1>
            <p className="brand-tagline">
              Find your dream car<br />
              at the best prices
            </p>
          </div>

          <div className="buyer-benefits">
            <h3>Why register as a Buyer?</h3>

            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <div>
                <strong>Access to 5000+ cars</strong>
                <p>Browse through verified listings</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <div>
                <strong>Save favorite cars</strong>
                <p>Create your wishlist</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <div>
                <strong>Get price alerts</strong>
                <p>Never miss a good deal</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <div>
                <strong>Direct contact with sellers</strong>
                <p>Negotiate the best price</p>
              </div>
            </div>
          </div>
        </div>

        <div className="buyer-register-right">
          <div className="buyer-form-wrapper">
            <div className="form-header">
              <h2>Buyer Registration</h2>
              <p>Create your account to start browsing cars</p>
            </div>

            <form onSubmit={handleSubmit} className="buyer-form">

              {/* Name */}
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              {/* City (CSS KEPT + COMPONENT SAME) */}
              <div className="form-group">
                <label>City</label>
                <Citys citydata={citydata} />
              </div>

              <div className="terms-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="terms-text">
                    I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button type="submit" className="submit-btn">
                Register as Buyer →
              </button>

              {/* Login */}
              <div className="login-link">
                Already have an account? <a href="/login">Sign In</a>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerRegister;