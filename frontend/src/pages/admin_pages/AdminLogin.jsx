// pages/AdminLogin.jsx
import React, { useState } from "react";
import "../../assets/css/AdminLogin.css";
import { useNavigate } from "react-router-dom";

const AdminLogin = ({updaterole}) => {
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

  // =========================
  // UPDATED: BACKEND LOGIN
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // validation
    if (!formData.email || !formData.password) {
      alert("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      let response = await fetch("http://localhost:5000/adminlogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      let result = await response.json();

      if (!response.ok) {
        alert(result.msg || "Invalid admin credentials");
      } else {
        // store admin session
        localStorage.setItem("token", result.token);
        localStorage.setItem("id", result.id);
        localStorage.setItem("role", result.role);
        updaterole(result.role)

        alert("Welcome Admin! You have successfully logged in to the admin panel.");

        // redirect to dashboard
        navigate("/");
      }
    } catch (error) {
      console.error("Admin Login Error:", error);
      alert("Network error. Please check backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
        <div className="bg-shape shape-4"></div>
      </div>

      <div className="login-container mt-5">
        <div className="login-card">
          <div className="security-badge">
            <span className="shield-icon">🛡️</span>
            <span>Secure Admin Access</span>
          </div>

          <div className="login-header">
            <div className="logo-wrapper">
              <span className="logo-icon">🚗</span>
              <h1 className="logo-text">
                Car<span className="logo-highlight">Market</span>
              </h1>
            </div>
            <div className="admin-badge">Administrator Portal</div>
            <h2>Admin Login</h2>
            <p>Secure access to management dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">
                Admin Email Address <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@carmarket.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">
                Password <span className="required">*</span>
              </label>
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

            {/* Remember Me */}
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">Remember this device</span>
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
                  Verifying credentials...
                </>
              ) : (
                <>
                  Access Admin Panel
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="security-notice">
              <span className="notice-icon">⚠️</span>
              <span>This area is restricted to authorized personnel only</span>
            </div>
          </form>
        </div>

        {/* Admin Tips & Stats Section (UNCHANGED) */}
        <div className="admin-info">
          <div className="info-header">
            <span className="info-icon">📊</span>
            <h3>Admin Dashboard Features</h3>
            <p>Complete control over the platform</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h4>User Management</h4>
              <p>Manage buyers, sellers, and their listings</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h4>Listing Approval</h4>
              <p>Review and approve car listings</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h4>Transaction Monitoring</h4>
              <p>Track all platform transactions</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h4>Analytics Dashboard</h4>
              <p>View platform performance metrics</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h4>System Settings</h4>
              <p>Configure platform parameters</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h4>Support Tickets</h4>
              <p>Manage customer support requests</p>
            </div>
          </div>

          <div className="admin-stats">
            <div className="stat-item">
              <span className="stat-value">1,234</span>
              <span className="stat-label">Active Listings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">567</span>
              <span className="stat-label">Pending Approvals</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">8,901</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">₹12.5Cr</span>
              <span className="stat-label">Total Sales</span>
            </div>
          </div>

          <div className="security-tips">
            <div className="security-tip-header">
              <span className="lock-icon">🔐</span>
              <h4>Security Best Practices</h4>
            </div>
            <ul>
              <li>✓ Never share your admin credentials</li>
              <li>✓ Use a strong, unique password</li>
              <li>✓ Log out after each session</li>
              <li>✓ Monitor login activity regularly</li>
              <li>✓ Report suspicious activities immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;