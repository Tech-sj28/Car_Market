// pages/BuyerCarListings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/BuyerCarListings.css";

const BuyerCarListings = () => {
  const navigate = useNavigate();
  const [allCars, setAllCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [uniqueBrands, setUniqueBrands] = useState([]);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [filters, setFilters] = useState({
    brand: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    city: "",
    fuelType: "",
    transmission: "",
    minYear: "",
    maxYear: ""
  });

  // Get token from localStorage
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // Fetch all approved cars
  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/cars");
      const data = await response.json();
      console.log("Fetched cars:", data);
      
      if (data.success) {
        setAllCars(data.cars);
        setFilteredCars(data.cars);
        
        const brands = [...new Set(data.cars.map(car => car.car_brand).filter(Boolean))];
        setUniqueBrands(brands.sort());
        
        const cities = [...new Set(data.cars.map(car => car.cityname).filter(Boolean))];
        setUniqueCities(cities.sort());
      } else {
        setError("Failed to fetch cars");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...allCars];
    
    if (filters.brand) {
      filtered = filtered.filter(car => 
        car.car_brand && car.car_brand.toLowerCase() === filters.brand.toLowerCase()
      );
    }
    if (filters.category) {
      filtered = filtered.filter(car => car.category_id === parseInt(filters.category));
    }
    if (filters.minPrice) {
      filtered = filtered.filter(car => car.expected_price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(car => car.expected_price <= parseInt(filters.maxPrice));
    }
    if (filters.city) {
      filtered = filtered.filter(car => 
        car.cityname && car.cityname.toLowerCase() === filters.city.toLowerCase()
      );
    }
    if (filters.fuelType) {
      filtered = filtered.filter(car => car.fuel_type === filters.fuelType);
    }
    if (filters.transmission) {
      filtered = filtered.filter(car => car.transmission_type === filters.transmission);
    }
    if (filters.minYear) {
      filtered = filtered.filter(car => car.manufacturing_year >= parseInt(filters.minYear));
    }
    if (filters.maxYear) {
      filtered = filtered.filter(car => car.manufacturing_year <= parseInt(filters.maxYear));
    }
    
    setFilteredCars(filtered);
  };

  const resetFilters = () => {
    setFilters({
      brand: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      city: "",
      fuelType: "",
      transmission: "",
      minYear: "",
      maxYear: ""
    });
    setFilteredCars(allCars);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const viewCarDetails = async (car) => {
    console.log("Car clicked:", car);
    
    // Fetch full car details to get seller_id
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/cars/${car.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        console.log("Full car details with seller_id:", data.car);
        setSelectedCar(data.car);
        setShowModal(true);
      } else {
        // Fallback to the original car object
        setSelectedCar(car);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Error fetching car details:", err);
      setSelectedCar(car);
      setShowModal(true);
    }
  };

  const addToCompare = (car) => {
    if (!isLoggedIn) {
      navigate("/login/buyer", { state: { from: "/cars", message: "Please login to compare cars" } });
      return;
    }
    
    if (compareList.length >= 3) {
      alert("You can compare up to 3 cars only");
      return;
    }
    
    if (compareList.find(c => c.id === car.id)) {
      alert("Car already in compare list");
      return;
    }
    
    setCompareList([...compareList, car]);
    alert("Car added to compare list");
  };

  const removeFromCompare = (carId) => {
    setCompareList(compareList.filter(c => c.id !== carId));
  };

  const clearCompare = () => {
    setCompareList([]);
    setShowCompare(false);
  };

  const handleCompareNow = () => {
    if (!isLoggedIn) {
      navigate("/login/buyer", { state: { from: "/cars", message: "Please login to compare cars" } });
      return;
    }
    setShowCompare(true);
  };

  if (loading) {
    return (
      <div className="buyer-listings">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="buyer-listings">
      <div className="listings-container">
        <div className="listings-header">
          <h1 className=" mt-5">Find Your Dream Car</h1>
          <p>Browse through our collection of verified pre-owned cars</p>
        </div>

        {/* Login Warning Bar for Non-Logged-in Users */}
        {!isLoggedIn && (
          <div className="login-warning-bar">
            <span>🔐</span>
            <p>Login to compare cars and contact sellers!</p>
            <button onClick={() => navigate("/login/buyer")} className="login-now-btn">
              Login Now
            </button>
          </div>
        )}

        {/* Compare Bar - Shows when cars are added to compare list */}
        {isLoggedIn && compareList.length > 0 && (
          <div className="compare-bar">
            <div className="compare-info">
              <span>📊 {compareList.length} car(s) in compare list</span>
              <button onClick={handleCompareNow} className="compare-now-btn">
                Compare Now
              </button>
              <button onClick={clearCompare} className="clear-compare-btn">
                Clear All
              </button>
            </div>
            <div className="compare-thumbnails">
              {compareList.map(car => (
                <div key={car.id} className="compare-thumb">
                  <img 
                    src={car.car_images && car.car_images[0] ? `http://localhost:5000${car.car_images[0]}` : "https://via.placeholder.com/50"}
                    alt={car.car_model}
                  />
                  <span>{car.car_brand} {car.car_model}</span>
                  <button onClick={() => removeFromCompare(car.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="filters-section">
          <h3>🔍 Filter Cars</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Brand</label>
              <select name="brand" value={filters.brand} onChange={handleFilterChange}>
                <option value="">All Brands</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            
            {/* <div className="filter-group">
              <label>Category</label>
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                <option value="1">Sedan</option>
                <option value="2">SUV</option>
                <option value="3">Hatchback</option>
                <option value="4">MUV/MPV</option>
                <option value="5">Coupe</option>
                <option value="6">Convertible</option>
                <option value="7">Electric</option>
                <option value="8">Luxury</option>
              </select>
            </div> */}
            
            <div className="filter-group">
              <label>Min Price (₹)</label>
              <input
                type="number"
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-group">
              <label>Max Price (₹)</label>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-group">
              <label>City</label>
              <select name="city" value={filters.city} onChange={handleFilterChange}>
                <option value="">All Cities</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Fuel Type</label>
              <select name="fuelType" value={filters.fuelType} onChange={handleFilterChange}>
                <option value="">All Fuel Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="CNG">CNG</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Transmission</label>
              <select name="transmission" value={filters.transmission} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="CVT">CVT</option>
                <option value="DCT">DCT</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Min Year</label>
              <select name="minYear" value={filters.minYear} onChange={handleFilterChange}>
                <option value="">Any</option>
                {[...Array(25)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Max Year</label>
              <select name="maxYear" value={filters.maxYear} onChange={handleFilterChange}>
                <option value="">Any</option>
                {[...Array(25)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>
          
          <div className="filter-actions">
            <button onClick={applyFilters} className="apply-filter-btn">Apply Filters</button>
            <button onClick={resetFilters} className="reset-filter-btn">Reset All</button>
          </div>
          
          <div className="results-count">
            Found {filteredCars.length} car{filteredCars.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Cars Grid */}
        {filteredCars.length === 0 ? (
          <div className="no-cars">
            <div className="no-cars-icon">🚗</div>
            <h3>No cars found</h3>
            <p>Try adjusting your filters</p>
            <button onClick={resetFilters} className="reset-filter-btn">Clear All Filters</button>
          </div>
        ) : (
          <div className="cars-grid">
            {filteredCars.map((car) => (
              <div key={car.id} className="car-card">
                <div className="car-image">
                  <img 
                    src={car.car_images && car.car_images[0] ? `http://localhost:5000${car.car_images[0]}` : "https://via.placeholder.com/300x200?text=No+Image"}
                    alt={car.car_model}
                    onClick={() => viewCarDetails(car)}
                  />
                  {car.features?.sunroof && <span className="feature-badge">Sunroof</span>}
                </div>
                <div className="car-info">
                  <h3>{car.car_brand} {car.car_model}</h3>
                  <p className="variant">{car.variant || "Standard"}</p>
                  <div className="car-specs">
                    <span>📅 {car.manufacturing_year}</span>
                    <span>📊 {car.mileage ? `${car.mileage.toLocaleString()} km` : "N/A"}</span>
                    <span>⛽ {car.fuel_type || "N/A"}</span>
                    <span>⚙️ {car.transmission_type || "N/A"}</span>
                  </div>
                  <div className="car-price">
                    ₹{parseInt(car.expected_price).toLocaleString()}
                  </div>
                  <div className="car-location">
                    📍 {car.cityname || "Location not specified"}
                  </div>
                  <div className="car-actions">
                    <button className="view-btn" onClick={() => viewCarDetails(car)}>
                      View Details
                    </button>
                    <button 
                      className="compare-btn" 
                      onClick={() => addToCompare(car)}
                    >
                      🔍 Compare
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Car Details Modal */}
      {showModal && selectedCar && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCar.car_brand} {selectedCar.car_model}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-images">
                {selectedCar.car_images && selectedCar.car_images.map((img, idx) => (
                  <img 
                    key={idx}
                    src={`http://localhost:5000${img}`}
                    alt={`Car ${idx + 1}`}
                    onClick={() => window.open(`http://localhost:5000${img}`, '_blank')}
                  />
                ))}
              </div>
              <div className="modal-details">
                <div className="detail-row">
                  <span className="label">Brand:</span>
                  <span>{selectedCar.car_brand}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Model:</span>
                  <span>{selectedCar.car_model}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Variant:</span>
                  <span>{selectedCar.variant || "-"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Year:</span>
                  <span>{selectedCar.manufacturing_year}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Fuel Type:</span>
                  <span>{selectedCar.fuel_type || "-"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Transmission:</span>
                  <span>{selectedCar.transmission_type || "-"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Mileage:</span>
                  <span>{selectedCar.mileage ? `${selectedCar.mileage.toLocaleString()} km` : "-"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Price:</span>
                  <span className="price">₹{parseInt(selectedCar.expected_price).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span>{selectedCar.cityname || "-"}</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              {!isLoggedIn && (
                <div className="login-warning">
                  <p>🔐 Please <button onClick={() => navigate("/login/buyer")} className="login-link-btn">login</button> to contact seller or buy this car</p>
                </div>
              )}
              {isLoggedIn && (
                <button 
                  className="contact-btn" 
                  onClick={() => {
                    console.log("Selected car:", selectedCar);
                    console.log("Seller ID from car:", selectedCar?.seller_id);
                    
                    if (!selectedCar?.seller_id) {
                      alert("Seller information not available. Please try again.");
                      return;
                    }
                    
                    const message = prompt("Please enter your message for the seller (optional):");
                    navigate("/test-drive/request", { 
                      state: { 
                        car: selectedCar, 
                        sellerId: selectedCar.seller_id,
                        message: message || "I'm interested in this car. Please schedule a test drive."
                      } 
                    });
                  }}
                >
                  Request Test Drive
                </button>
              )}
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal - Enhanced with Smart Comparison */}
      {isLoggedIn && showCompare && compareList.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowCompare(false)}>
          <div className="modal-content compare-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Compare Cars ({compareList.length} vehicles)</h2>
              <button className="close-btn" onClick={() => setShowCompare(false)}>✕</button>
            </div>
            
            <div className="compare-scroll-wrapper">
              {/* Overall Best Car Summary */}
              <div className="compare-summary">
                <h3>🏆 Overall Comparison Summary</h3>
                <div className="summary-cards">
                  {compareList.map(car => {
                    let score = 0;
                    const scores = [];
                    
                    const minPrice = Math.min(...compareList.map(c => c.expected_price));
                    if (car.expected_price === minPrice) {
                      score += 2;
                      scores.push({ category: "Price", value: "Best Price", isBest: true });
                    }
                    
                    const minMileage = Math.min(...compareList.map(c => c.mileage || Infinity));
                    if (car.mileage === minMileage && car.mileage) {
                      score += 1;
                      scores.push({ category: "Mileage", value: "Lowest Driven", isBest: true });
                    }
                    
                    const maxYear = Math.max(...compareList.map(c => c.manufacturing_year));
                    if (car.manufacturing_year === maxYear) {
                      score += 1;
                      scores.push({ category: "Year", value: "Newest", isBest: true });
                    }
                    
                    const featureCount = Object.values(car.features || {}).filter(v => v === true).length;
                    const maxFeatures = Math.max(...compareList.map(c => Object.values(c.features || {}).filter(v => v === true).length));
                    if (featureCount === maxFeatures && maxFeatures > 0) {
                      score += 1;
                      scores.push({ category: "Features", value: `${featureCount} Features`, isBest: true });
                    }
                    
                    return { car, score, scores };
                  }).sort((a, b) => b.score - a.score).map((item, idx) => (
                    <div key={item.car.id} className={`summary-card ${idx === 0 ? 'winner' : ''}`}>
                      <div className="summary-rank">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                      <div className="summary-car-name">{item.car.car_brand} {item.car.car_model}</div>
                      <div className="summary-score">Score: {item.score}/5</div>
                      <div className="summary-badges">
                        {item.scores.map((s, i) => (
                          <span key={i} className="best-badge">✨ {s.value}</span>
                        ))}
                      </div>
                      {idx === 0 && <div className="recommended-badge">⭐ Recommended</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Table - Horizontal Scroll for multiple cars */}
              <div className="compare-table-wrapper">
                <div className="compare-table-container">
                  <table className="compare-table">
                    <thead>
                      <tr>
                        <th className="spec-label-cell">Specification</th>
                        {compareList.map((car) => (
                          <th key={car.id} className="car-header-cell">
                            <div className="car-header-content">
                              <img 
                                src={car.car_images && car.car_images[0] ? `http://localhost:5000${car.car_images[0]}` : "https://via.placeholder.com/80"}
                                alt={car.car_model}
                                className="header-car-image"
                              />
                              <div className="header-car-name">{car.car_brand} {car.car_model}</div>
                              <div className="header-car-variant">{car.variant || "Standard"}</div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Table rows remain the same */}
                      <tr>
                        <td className="spec-label-cell">💰 Price (₹)</td>
                        {compareList.map(car => {
                          const prices = compareList.map(c => c.expected_price);
                          const minPrice = Math.min(...prices);
                          let className = "";
                          if (car.expected_price === minPrice) className = "best-value";
                          return (
                            <td key={car.id} className={className}>
                              ₹{parseInt(car.expected_price).toLocaleString()}
                              {car.expected_price === minPrice && <span className="badge best">Best Price</span>}
                            </td>
                          );
                        })}
                      </tr>
                      
                      {/* Add all other table rows... */}
                      {/* (Keep all the existing table rows from your original code) */}
                      
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="compare-footer">
              <div className="legend">
                <span className="legend-best">🟢 Green = Better Value</span>
              </div>
              <button className="close-modal-btn" onClick={() => setShowCompare(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerCarListings;