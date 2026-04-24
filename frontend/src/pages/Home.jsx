// pages/Home.jsx
import React from 'react';
import '../assets/css/Home.css';
import BuyerCarListings from './user_pages/BuyerCarListings';
import Footer from '../components/Footer'

const Home = () => {
  const featuredCars = [
    { id: 1, name: 'Tesla Model 3', year: '2022', price: '$42,990', mileage: '15,234 mi', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500&h=350&fit=crop', tag: 'Electric', color: '#3B82F6' },
    { id: 2, name: 'BMW 3 Series', year: '2021', price: '$38,500', mileage: '28,421 mi', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=350&fit=crop', tag: 'Luxury', color: '#10B981' },
    { id: 3, name: 'Honda CR-V', year: '2023', price: '$31,200', mileage: '8,742 mi', image: 'https://images.unsplash.com/photo-1568844291810-a72f4a2d519c?w=500&h=350&fit=crop', tag: 'SUV', color: '#F59E0B' },
    { id: 4, name: 'Mercedes-Benz C-Class', year: '2022', price: '$45,800', mileage: '12,103 mi', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=500&h=350&fit=crop', tag: 'Luxury', color: '#8B5CF6' },
  ];

  const steps = [
    { icon: '📝', title: 'List Your Car', description: 'Fill in your car details, upload photos, and set your price', color: '#3B82F6' },
    { icon: '✅', title: 'Admin Approval', description: 'Our team reviews your listing for quality and authenticity', color: '#10B981' },
    { icon: '👀', title: 'Get Noticed', description: 'Your car appears in search results for potential buyers', color: '#F59E0B' },
    { icon: '🤝', title: 'Connect & Sell', description: 'Interested buyers contact you directly to close the deal', color: '#8B5CF6' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-pattern"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">⭐</span>
              Trusted by 10,000+ customers
            </div>
            <h1 className="hero-title">
              Buy & Sell <span className="hero-highlight">Pre-Owned Cars</span><br />
              With <span className="hero-accent">100% Confidence</span>
            </h1>
            <p className="hero-description">
              Connect with thousands of trusted sellers and buyers in our verified marketplace. 
              Every listing goes through admin approval to ensure quality and authenticity.
            </p>
            <div className="hero-buttons">
              <a href="/buy" className="btn-primary">Browse Cars →</a>
              <a href="/sell" className="btn-secondary">Sell Your Car →</a>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">5,000+</span>
              <span className="stat-label">Cars Listed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">2,500+</span>
              <span className="stat-label">Happy Buyers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Approval Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">🔥 Hot Listings</span>
            <h2 className="section-title">Popular Cars <span className="title-gradient">This Week</span></h2>
            <p className="section-subtitle">Hand-picked premium vehicles with verified history</p>
          </div>
         <BuyerCarListings></BuyerCarListings>
          <div className="view-all-wrapper">
            <a href="/buy" className="view-all-link">Explore All Cars →</a>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2 className="section-title">How <span className="title-gradient">CarMarket</span> Works</h2>
            <p className="section-subtitle">Four easy steps to sell or buy your next car</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number" style={{ background: step.color }}>{index + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose">
        <div className="container">
          <div className="why-choose-grid">
            <div className="why-content">
              <span className="section-badge">Why Choose Us</span>
              <h2 className="section-title">Trust & <span className="title-gradient">Transparency</span><br />In Every Transaction</h2>
              <ul className="features-list">
                <li><span className="check-icon">✓</span> Admin-approved listings for quality assurance</li>
                <li><span className="check-icon">✓</span> No hidden fees — transparent pricing</li>
                <li><span className="check-icon">✓</span> Secure messaging between buyers and sellers</li>
                <li><span className="check-icon">✓</span> Vehicle history reports available</li>
                <li><span className="check-icon">✓</span> Dedicated customer support team 24/7</li>
              </ul>
              <a href="/sell" className="btn-primary">Start Selling →</a>
            </div>
            <div className="why-image">
              <img src="https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&h=500&fit=crop" alt="Happy customer with car" />
              <div className="floating-card">
                <span className="floating-icon">🚗</span>
                <span className="floating-text">1,000+ Cars Sold</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-pattern"></div>
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to find your <span className="cta-highlight">perfect car?</span></h2>
            <p className="cta-description">Join thousands of satisfied customers who bought and sold their cars with CarMarket</p>
            <div className="cta-buttons">
              <a href="/buy" className="cta-btn-primary">Browse Cars</a>
              <a href="/sell" className="cta-btn-secondary">List Your Car</a>
            </div>
          </div>
        </div>
      </section>

      <Footer></Footer>
    </div>
  );
};

export default Home;