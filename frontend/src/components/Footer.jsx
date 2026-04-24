// components/Footer.jsx
import React from 'react';
import '../assets/css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">🚗</span>
              <span className="logo-text">CarMarket</span>
            </div>
            <p className="footer-description">
              Your trusted marketplace for buying and selling pre-owned cars. 
              Quality verified listings with admin approval.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          
          <div className="footer-links-group">
            <h4 className="footer-heading">For Buyers</h4>
            <ul className="footer-links">
              <li><a href="/buy">Browse Cars</a></li>
              <li><a href="#">Financing Options</a></li>
              <li><a href="#">Car Reviews</a></li>
              <li><a href="#">Buying Guide</a></li>
            </ul>
          </div>
          
          <div className="footer-links-group">
            <h4 className="footer-heading">For Sellers</h4>
            <ul className="footer-links">
              <li><a href="/sell">List Your Car</a></li>
              <li><a href="#">Selling Tips</a></li>
              <li><a href="#">Pricing Guide</a></li>
              <li><a href="#">FAQ for Sellers</a></li>
            </ul>
          </div>
          
          <div className="footer-links-group">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 CarMarket. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;