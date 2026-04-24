import React, { useState } from "react";
import "../../assets/css/Sellerregister.css";
import Citys from "../../components/Citys";
import { useNavigate } from "react-router-dom"
const Sellerregister = () => {
  const navigate = useNavigate()
  const [userType, setUserType] = useState("buyer"); // 'buyer' or 'seller'

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

  // FIXED CITY HANDLER (removed wrong setdata)
  const citydata = (cityid) => {
    setFormData((prev) => ({
      ...prev,
      city: cityid
    }));
  };

  // ✅ BACKEND SUBMIT (same style as your Register page)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptTerms) {
      alert("Please accept the terms and conditions");
      return;
    }

    const payload = {
      ...formData,
      userType
    };

    try {
      const response = await fetch("http://localhost:5000/sellerinsert", {
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
        alert(result.msg || "Registration successful");
        navigate('/')
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
console.log(formData)
  return (
    <div className="register-page">
      <div className="register-container mt-5">
        <div className="register-left">
          <div className="register-brand">
            <div className="brand-icon">🚗</div>
            <h1 className="brand-name">
              Car<span className="brand-highlight">Market</span>
            </h1>
            <p className="brand-tagline">
              Join India's fastest growing<br />
              automotive marketplace
            </p>
          </div>

          <div className="register-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Trusted by 10,000+ users</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Secure & verified listings</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>24/7 customer support</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>100% free registration</span>
            </div>
          </div>
        </div>

        <div className="register-right">
          <div className="register-form-wrapper">
            <div className="form-header">
              <h2>Create an account</h2>
              <p>Join CarMarket to buy or sell your dream car</p>
            </div>

            {/* User Type Toggle */}
            {/* <div className="user-type-toggle">
              <button
                type="button"
                className={`type-btn ${userType === "buyer" ? "active" : ""}`}
                onClick={() => setUserType("buyer")}
              >
                <span>👥</span> Register as Buyer
              </button>

              <button
                type="button"
                className={`type-btn ${userType === "seller" ? "active" : ""}`}
                onClick={() => setUserType("seller")}
              >
                <span>🚗</span> Register as Seller
              </button>
            </div> */}

            <form onSubmit={handleSubmit} className="register-form">
              {/* Name */}
              <div className="form-group">
                <label>
                  Full Name <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label>
                  Email Address <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
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
                <label>
                  Password <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon  "></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label>
                  Phone Number <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your mobile number"
                    required
                  />
                </div>
              </div>

              {/* City (UNCHANGED UI) */}
              <div className="form-group">
                <label>
                  City <span className="required">*</span>
                </label>
                <Citys citydata={citydata} />
              </div>

              {/* Terms */}
              <div className="terms-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="terms-text">
                    I agree to the <a href="#">Terms of Service</a> and{" "}
                    <a href="#">Privacy Policy</a>
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button type="submit" className="submit-btn">
                {userType === "buyer"
                  ? "Create Buyer Account"
                  : "Create Seller Account"}
                <span className="btn-arrow">→</span>
              </button>

              <div className="login-link">
                Already have an account? <a href="/sellerlogin">Sign In</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sellerregister;