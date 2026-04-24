// pages/SellerLogin.jsx
import React, { useState } from "react";
import "../../assets/css/SellerLogin.css";
import { Link, useNavigate } from "react-router-dom";

const SellerLogin = ({updaterole}) => {
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
      let response = await fetch("http://localhost:5000/sellerlogin", {
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
        // Store seller data (adjust according to backend response)
        localStorage.setItem("token", result.token);
        localStorage.setItem("id", result.id);
        localStorage.setItem("role", result.role);
        updaterole(result.role)
        alert("Login Successful! Welcome Seller " + (result.sellerName || ""));

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
    <div className="seller-login-page">
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
            <h2>Seller Login</h2>
            <p>Access your seller dashboard to manage listings</p>
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
                  placeholder="Enter your registered email"
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
                  Sign In as Seller
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
              Don't have a seller account?{" "}
              <Link to="/sellerregsiter">Register as Seller</Link>
            </div>
          </form>
        </div>

        {/* Seller Tips Section */}
        <div className="seller-tips">
          <div className="tips-header">
            <span className="tips-icon">📈</span>
            <h3>Tips for Successful Sellers</h3>
            <p>Sell your car faster at the best price</p>
          </div>

          <div className="tips-list">
            <div className="tip-item">
              <div className="tip-number">01</div>
              <div className="tip-content">
                <h4>High-Quality Photos</h4>
                <p>
                  Upload 10+ clear photos from different angles to attract more buyers
                </p>
              </div>
            </div>

            <div className="tip-item">
              <div className="tip-number">02</div>
              <div className="tip-content">
                <h4>Competitive Pricing</h4>
                <p>
                  Research market rates and price your car 5-10% below average for quick sale
                </p>
              </div>
            </div>

            <div className="tip-item">
              <div className="tip-number">03</div>
              <div className="tip-content">
                <h4>Detailed Description</h4>
                <p>
                  Include service history, accidents, upgrades, and reason for selling
                </p>
              </div>
            </div>

            <div className="tip-item">
              <div className="tip-number">04</div>
              <div className="tip-content">
                <h4>Respond Quickly</h4>
                <p>
                  Reply to buyer inquiries within 2 hours to increase sale chances by 40%
                </p>
              </div>
            </div>

            <div className="tip-item">
              <div className="tip-number">05</div>
              <div className="tip-content">
                <h4>Be Transparent</h4>
                <p>
                  Honest about car condition builds trust and leads to faster deals
                </p>
              </div>
            </div>
          </div>

          <div className="tips-footer">
            <div className="tip-stat">
              <span className="tip-stat-number">3 Days</span>
              <span className="tip-stat-label">Avg. selling time</span>
            </div>
            <div className="tip-stat">
              <span className="tip-stat-number">15%</span>
              <span className="tip-stat-label">Higher price with tips</span>
            </div>
            <div className="tip-stat">
              <span className="tip-stat-number">5,000+</span>
              <span className="tip-stat-label">Cars sold monthly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;