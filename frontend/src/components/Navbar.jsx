// components/Navbar.jsx
import React, { useState, useEffect } from "react";
import "../assets/css/Navbar.css";
import { Link } from "react-router-dom";

const Navbar = ({ role }) => {
  console.log(role);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-container">
          {/* ── Logo · Left ── */}
          <div className="navbar-logo">
            <div className="logo-wrapper">
              <div className="logo-icon-wrapper">
                <span className="logo-icon">🚗</span>
              </div>
              <span className="logo-text">
                Car<span className="logo-highlight">Market</span>
              </span>
            </div>
          </div>

          {/* ── Nav Links · Right ── */}
          <div className="navbar-right">
            <ul className="navbar-links">
              {!role ? (
                <>
                  <li>
                    <Link to="/" className="nav-link active">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/BuyerCarListings" className="nav-link">
                      Cars
                    </Link>
                  </li>
                  <li>
                    <Link to="/sellerregsiter" className="nav-link">
                      Sell Regsiter
                    </Link>
                  </li>
                  <li>
                    <Link to="/BuyerRegister" className="nav-link">
                      Buyer Regsiter
                    </Link>
                  </li>
                  <li>
                    <Link to="/BuyerLogin" className="nav-link">
                      Buyer login
                    </Link>
                  </li>
                  <li>
                    <Link to="/SellerLogin" className="nav-link">
                      Seller login
                    </Link>
                  </li>
                  <li>
                    <Link to="/AdminLogin" className="nav-link">
                      Admin login
                    </Link>
                  </li>
                </>
              ) : role === "buyer" ? (
                <>
                  <li>
                    <Link to="/" className="nav-link active">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/BuyerCarListings" className="nav-link">
                      Cars
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-test-drives" className="nav-link">
                      request
                    </Link>
                    </li>
                    <li><Link to="/my-negotiations" className="nav-link">My Offers</Link></li>  

                    <li><Link to="/my-bookings" className="nav-link">My Booking</Link></li>
                  <li>
                    <Link to="/logout" className=" text-decoration-none">
                      <button className="logout-btn">
                        <span className="logout-icon">🚪</span>
                        Logout
                      </button>
                    </Link>
                  </li>
                </>
              ) : role === "seller" ? (
                <>
                  <li>
                    <Link to="/" className="nav-link active">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/SellerAddCar" className="nav-link">
                    Add Vehicle
                    </Link>
                  </li>
                  <li>
                    <Link to="/SellerDashboard" className="nav-link">
                      Approval Dashboard
                    </Link>
                      </li>
                      
                      <li>
                    <Link to="/seller/test-drives" className="nav-link">
                    Test Drive Requests
                    </Link>
                      </li>
                      <li>
                        <li><Link to="/seller/negotiations" className="nav-link">Negotiation Requests</Link></li>
                        
                        <li><Link to="/seller/bookings" className="nav-link">Booking Requests</Link></li>

                    <Link to="/logout" className=" text-decoration-none">
                      <button className="logout-btn">
                        <span className="logout-icon">🚪</span>
                        Logout
                      </button>
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/" className="nav-link active">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/AdminCarVerification" className="nav-link">
                      {" "}
                      Admin Car Verification
                    </Link>
                        </li>
                        <li>
                    <Link to="/admin/test-drives" className="nav-link">
                 
                      test drive requests
                          </Link>
                           
                        </li>
                        <li>
                    <Link to="/admin/negotiations" className="nav-link">
                 
                      Price negotiations
                          </Link>
                          
                        </li>
                        <li>
                    <Link to="/admin/bookings" className="nav-link">
                 
                     bookings
                          </Link>
                          
                        </li>
                        
                  <li>
                    <Link to="/logout" className=" text-decoration-none">
                      <button className="logout-btn">
                        <span className="logout-icon">🚪</span>
                        Logout
                      </button>
                    </Link>
                  </li>
                </>
              )}

              {/* <li><Link to="/Categoriescar" className="nav-link">Categoriescar</Link></li> */}
            </ul>
          </div>

          {/* ── Hamburger · Mobile ── */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className={`hamburger ${mobileMenuOpen ? "open" : ""}`}>
              <span />
              <span />
              <span />
            </div>
          </button>
        </div>

        {/* ── Mobile Overlay ── */}
        <div
          className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`}
        >
          <div className="mobile-menu-container">
            <div className="mobile-menu-header">
              <div className="mobile-logo">
                <span className="logo-icon">🚗</span>
                <span>
                  Car<span className="logo-highlight">Market</span>
                </span>
              </div>
              <button
                className="mobile-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <ul className="mobile-nav-links">
              <li>
                <a href="/" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </a>
              </li>
              <li>
                <a href="/buy" onClick={() => setMobileMenuOpen(false)}>
                  Buy Car
                </a>
              </li>
              <li>
                <a href="/sell" onClick={() => setMobileMenuOpen(false)}>
                  Sell Car
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-login-btn"
                >
                  Sign In
                </a>
              </li>
            </ul>

            <div className="mobile-menu-footer">
              <p>© 2024 CarMarket. All rights reserved.</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
