// pages/BuyerLogin.jsx
import React, { useState } from "react";
import "../../assets/css/BuyerLogin.css";
import { useNavigate } from "react-router-dom";

const BuyerLogin = ({updaterole}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password) {
      alert("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      let response = await fetch("http://localhost:5000/buyerlogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      let result = await response.json();

      if (!response.ok) {
        alert(result.msg || "Something went wrong. Please try again.");
      } else {
        // Store data (adjust based on your backend response)
        localStorage.setItem("token", result.token);
        localStorage.setItem("id", result.id);
        localStorage.setItem("role", result.role);
        updaterole(result.role)
        alert("Login Successful! Welcome " + (result.buyerName || "User"));

        navigate("/");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Network error. Please check if server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buyer-login-page">
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="login-container mt-5">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-wrapper">
              <span className="logo-icon">🚗</span>
              <h1 className="logo-text">
                Car<span className="logo-highlight">Market</span>
              </h1>
            </div>
            <h2>Welcome Back!</h2>
            <p>Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
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

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">Remember me</span>
              </label>
              {/* <a href="/forgot-password" className="forgot-link">
                Forgot Password?
              </a> */}
            </div>

            {/* Login Button */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="divider">
              <span>or continue with</span>
            </div>
 

            {/* Sign Up Link */}
            <div className="signup-link">
              Don't have an account?{" "}
              <a href="/BuyerRegister">Create Account</a>
            </div>
          </form>
        </div>

        {/* Buyer Tips Section - Replaced Testimonial */}
        <div className="buyer-tips">
          <div className="tips-header">
            <span className="tips-icon">💡</span>
            <h3>Tips for Smart Buyers</h3>
            <p>Get the best deal on your next car</p>
          </div>

          <div className="tips-list">
            <div className="tip-item">
              <div className="tip-number">01</div>
              <div className="tip-content">
                <h4>Verify Vehicle History</h4>
                <p>
                  Always check the complete service record and accident history
                  before purchasing
                </p>
              </div>
            </div>

            <div className="tip-item">
              <div className="tip-number">02</div>
              <div className="tip-content">
                <h4>Compare Prices</h4>
                <p>
                  Check similar models across multiple listings to ensure you're
                  getting fair value
                </p>
              </div>
            </div>

            <div className="tip-item">
              <div className="tip-number">03</div>
              <div className="tip-content">
                <h4>Inspect Before Buying</h4>
                <p>
                  Always schedule a physical inspection or get a trusted
                  mechanic to check the car
                </p>
              </div>
            </div>

            <div className="tip-item">
              <div className="tip-number">04</div>
              <div className="tip-content">
                <h4>Negotiate Smartly</h4>
                <p>
                  Use our price guide to negotiate confidently and save up to
                  15% on your purchase
                </p>
              </div>
            </div>

            <div className="tip-item">
              <div className="tip-number">05</div>
              <div className="tip-content">
                <h4>Check Paperwork</h4>
                <p>
                  Ensure all documents like RC, insurance, and pollution
                  certificate are in order
                </p>
              </div>
            </div>
          </div>

          <div className="tips-footer">
            <div className="tip-stat">
              <span className="tip-stat-number">₹50K+</span>
              <span className="tip-stat-label">Average savings</span>
            </div>
            <div className="tip-stat">
              <span className="tip-stat-number">100%</span>
              <span className="tip-stat-label">Verified listings</span>
            </div>
            <div className="tip-stat">
              <span className="tip-stat-number">24/7</span>
              <span className="tip-stat-label">Support available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerLogin;