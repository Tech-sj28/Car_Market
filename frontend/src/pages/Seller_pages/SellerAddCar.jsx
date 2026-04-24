// pages/SellerAddCar.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import "../../assets/css/SellerAddCar.css";
import Citys from "../../components/Citys";
import Categoriescar from "../../components/Categoriescar";

const SellerAddCar = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Car Details State
  const [formData, setFormData] = useState({
    carBrand: "",
    carModel: "",
    variant: "",
    manufacturingYear: "",
    fuelType: "",
    transmissionType: "",
    ownershipCount: "",
    expectedPrice: "",
    mileage: "",
    vehicleCondition: "",
    accidentHistory: "",
    serviceHistoryAvailable: "",
    insuranceValidityDate: "",
    city: "",
    locality: "",
    category_id: "",
    carOwnerName: ""
  });

  // Features State (Checkboxes)
  const [features, setFeatures] = useState({
    ac: false,
    powerSteering: false,
    powerWindows: false,
    airbags: false,
    abs: false,
    centralLocking: false,
    alloyWheels: false,
    bluetooth: false,
    androidAuto: false,
    appleCarPlay: false,
    reverseCamera: false,
    parkingSensors: false,
    sunroof: false,
    cruiseControl: false,
    navigationSystem: false,
    musicSystem: false
  });

  // File Upload States
  const [carImages, setCarImages] = useState([]);
  const [carDocuments, setCarDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('sellerToken');
  };
  console.log(getToken)
  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle category selection from Categoriescar component
  const carcategoriesdata = (category_id) => {
    setFormData((prev) => ({
      ...prev,
      category_id: category_id
    }));
  };

  // Handle city selection from Citys component
  const citydata = (cityid) => {
    setFormData((prev) => ({
      ...prev,
      city: cityid
    }));
  };

  // Handle feature checkbox changes
  const handleFeatureChange = (e) => {
    const { name, checked } = e.target;
    setFeatures(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Car Images Dropzone
  const onDropImages = useCallback((acceptedFiles) => {
    setCarImages(prev => [...prev, ...acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    )]);
  }, []);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: onDropImages,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5242880, // 5MB
    multiple: true
  });

  // Documents Dropzone
  const onDropDocuments = useCallback((acceptedFiles) => {
    setCarDocuments(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps: getDocRootProps, getInputProps: getDocInputProps, isDragActive: isDocDragActive } = useDropzone({
    onDrop: onDropDocuments,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxSize: 10485760, // 10MB
    multiple: true
  });

  // Remove image
  const removeImage = (index) => {
    setCarImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove document
  const removeDocument = (index) => {
    setCarDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.category_id) {
      setError("Please select a car category");
      return;
    }
    if (!formData.city) {
      setError("Please select a city");
      return;
    }
    if (carImages.length === 0) {
      setError("Please upload at least one car image");
      return;
    }
    
    setLoading(true);
    setError("");
    setUploadProgress(0);

    // Prepare FormData for backend
    const submitData = new FormData();
    
    // Add all form data as JSON string
    const submissionData = {
      ...formData,
      features: features,
      manufacturingYear: parseInt(formData.manufacturingYear),
      expectedPrice: parseFloat(formData.expectedPrice),
      mileage: parseInt(formData.mileage),
      ownershipCount: formData.ownershipCount === "4+" ? 4 : parseInt(formData.ownershipCount)
    };
    
    submitData.append("carData", JSON.stringify(submissionData));

    // Add car images
    carImages.forEach((image) => {
      submitData.append(`carImages`, image);
    });

    // Add documents
    carDocuments.forEach((doc) => {
      submitData.append(`documents`, doc);
    });

    // Get token from localStorage
    const token = getToken();
    console.log("Token:", token);
    console.log("Submitting data:", submissionData);

    try {
      // Actual API call to backend
      const response = await fetch('http://localhost:5000/api/cars/add', {
        method: 'POST',
        body: submitData,
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      // Simulate upload progress for better UX
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add car");
      }

      const data = await response.json();
      console.log("Success:", data);
      
      clearInterval(interval);
      setUploadProgress(100);
      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        resetForm();
        setUploadProgress(0);
      }, 3000);
      
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to add car. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      carBrand: "",
      carModel: "",
      variant: "",
      manufacturingYear: "",
      fuelType: "",
      transmissionType: "",
      ownershipCount: "",
      expectedPrice: "",
      mileage: "",
      vehicleCondition: "",
      accidentHistory: "",
      serviceHistoryAvailable: "",
      insuranceValidityDate: "",
      city: "",
      locality: "",
      category_id: "",
      carOwnerName: ""
    });
    setFeatures({
      ac: false, powerSteering: false, powerWindows: false, airbags: false,
      abs: false, centralLocking: false, alloyWheels: false, bluetooth: false,
      androidAuto: false, appleCarPlay: false, reverseCamera: false,
      parkingSensors: false, sunroof: false, cruiseControl: false,
      navigationSystem: false, musicSystem: false
    });
    setCarImages([]);
    setCarDocuments([]);
  };

  // Feature list for rendering
  const featureList = [
    { key: 'ac', label: 'AC' },
    { key: 'powerSteering', label: 'Power Steering' },
    { key: 'powerWindows', label: 'Power Windows' },
    { key: 'airbags', label: 'Airbags' },
    { key: 'abs', label: 'ABS' },
    { key: 'centralLocking', label: 'Central Locking' },
    { key: 'alloyWheels', label: 'Alloy Wheels' },
    { key: 'bluetooth', label: 'Bluetooth' },
    { key: 'androidAuto', label: 'Android Auto' },
    { key: 'appleCarPlay', label: 'Apple CarPlay' },
    { key: 'reverseCamera', label: 'Reverse Camera' },
    { key: 'parkingSensors', label: 'Parking Sensors' },
    { key: 'sunroof', label: 'Sunroof' },
    { key: 'cruiseControl', label: 'Cruise Control' },
    { key: 'navigationSystem', label: 'Navigation System' },
    { key: 'musicSystem', label: 'Music System' }
  ];

  return (
    <div className="seller-add-car-page">
      <div className="container">
        <div className="page-header">
          <h1 className=" mt-5">List Your Car for Sale</h1>
          <p>Fill in the details below to list your car on CarMarket</p>
        </div>

        {success && (
          <div className="success-message">
            ✅ Car listed successfully! Your listing will be reviewed by admin.
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-car-form">
          {/* Basic Information Section */}
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Car Brand *</label>
                <input 
                  type="text" 
                  name="carBrand" 
                  value={formData.carBrand} 
                  onChange={handleChange} 
                  placeholder="e.g., Toyota, Honda, BMW" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Car Model *</label>
                <input 
                  type="text" 
                  name="carModel" 
                  value={formData.carModel} 
                  onChange={handleChange} 
                  placeholder="e.g., Camry, Civic, X5" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Variant *</label>
                <input 
                  type="text" 
                  name="variant" 
                  value={formData.variant} 
                  onChange={handleChange} 
                  placeholder="e.g., ZX, VXi, Sport" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Manufacturing Year *</label>
                <select name="manufacturingYear" value={formData.manufacturingYear} onChange={handleChange} required>
                  <option value="">Select Year</option>
                  {[...Array(25)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              <div className="form-group">
                <label>Fuel Type *</label>
                <select name="fuelType" value={formData.fuelType} onChange={handleChange} required>
                  <option value="">Select Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
              <div className="form-group">
                <label>Transmission Type *</label>
                <select name="transmissionType" value={formData.transmissionType} onChange={handleChange} required>
                  <option value="">Select Transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="CVT">CVT</option>
                  <option value="DCT">DCT</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ownership Count *</label>
                <select name="ownershipCount" value={formData.ownershipCount} onChange={handleChange} required>
                  <option value="">Select Ownership</option>
                  <option value="1">1st Owner</option>
                  <option value="2">2nd Owner</option>
                  <option value="3">3rd Owner</option>
                  <option value="4+">4+ Owners</option>
                </select>
              </div>
              <div className="form-group">
                <label>Expected Selling Price (₹) *</label>
                <input 
                  type="number" 
                  name="expectedPrice" 
                  value={formData.expectedPrice} 
                  onChange={handleChange} 
                  placeholder="e.g., 500000" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Mileage Driven (km) *</label>
                <input 
                  type="number" 
                  name="mileage" 
                  value={formData.mileage} 
                  onChange={handleChange} 
                  placeholder="e.g., 25000" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Vehicle Condition *</label>
                <select name="vehicleCondition" value={formData.vehicleCondition} onChange={handleChange} required>
                  <option value="">Select Condition</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
              <div className="form-group">
                <label>Accident History *</label>
                <select name="accidentHistory" value={formData.accidentHistory} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="None">No Accidents</option>
                  <option value="Minor">Minor Accidents</option>
                  <option value="Major">Major Accidents</option>
                </select>
              </div>
              <div className="form-group">
                <label>Service History Available *</label>
                <select name="serviceHistoryAvailable" value={formData.serviceHistoryAvailable} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
              <div className="form-group">
                <label>Insurance Validity Date *</label>
                <input 
                  type="date" 
                  name="insuranceValidityDate" 
                  value={formData.insuranceValidityDate} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="form-section">
            <h2 className="section-title">Location Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>City *</label>
                <Citys citydata={citydata} />
                {formData.city && (
                  <small className="selected-value">Selected City ID: {formData.city}</small>
                )}
              </div>
              <div className="form-group">
                <label>Area/Locality *</label>
                <input 
                  type="text" 
                  name="locality" 
                  value={formData.locality} 
                  onChange={handleChange} 
                  placeholder="e.g., Andheri East, Koramangala" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Car Category *</label>
                <Categoriescar carcategoriesdata={carcategoriesdata} />
                {formData.category_id && (
                  <small className="selected-value">Selected Category ID: {formData.category_id}</small>
                )}
              </div>
              <div className="form-group">
                <label>Car Owner Name *</label>
                <input 
                  type="text" 
                  name="carOwnerName" 
                  value={formData.carOwnerName} 
                  onChange={handleChange} 
                  placeholder="Full name as per RC" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="form-section">
            <h2 className="section-title">Car Features</h2>
            <p className="section-subtitle">Select all features available in your car</p>
            <div className="features-grid">
              {featureList.map(feature => (
                <label key={feature.key} className="feature-checkbox">
                  <input
                    type="checkbox"
                    name={feature.key}
                    checked={features[feature.key]}
                    onChange={handleFeatureChange}
                  />
                  <span className="checkmark-custom"></span>
                  {feature.label}
                </label>
              ))}
            </div>
          </div>

          {/* Car Images Upload Section */}
          <div className="form-section">
            <h2 className="section-title">Car Images</h2>
            <p className="section-subtitle">Upload clear photos of your car (Max 5MB each) *Minimum 1 image required</p>
            <div {...getImageRootProps()} className={`dropzone ${isImageDragActive ? 'active' : ''}`}>
              <input {...getImageInputProps()} />
              <div className="dropzone-content">
                <span className="dropzone-icon">📸</span>
                <p>Drag & drop car images here, or click to select</p>
                <small>Supports: JPEG, PNG, WEBP (Max 5MB)</small>
              </div>
            </div>
            {carImages.length > 0 && (
              <>
                <div className="image-preview-grid">
                  {carImages.map((file, index) => (
                    <div key={index} className="image-preview">
                      <img src={file.preview} alt={`Car ${index + 1}`} />
                      <button type="button" className="remove-btn" onClick={() => removeImage(index)}>✕</button>
                    </div>
                  ))}
                </div>
                <p className="upload-count">{carImages.length} image(s) selected</p>
              </>
            )}
          </div>

          {/* Documents Upload Section */}
          <div className="form-section">
            <h2 className="section-title">Car Documents</h2>
            <p className="section-subtitle">Upload RC book, Insurance copy, PUC certificate, Service records</p>
            <div {...getDocRootProps()} className={`dropzone ${isDocDragActive ? 'active' : ''}`}>
              <input {...getDocInputProps()} />
              <div className="dropzone-content">
                <span className="dropzone-icon">📄</span>
                <p>Drag & drop documents here, or click to select</p>
                <small>Supports: PDF, JPEG, PNG (Max 10MB)</small>
              </div>
            </div>
            {carDocuments.length > 0 && (
              <>
                <div className="documents-list">
                  {carDocuments.map((file, index) => (
                    <div key={index} className="document-item">
                      <span className="doc-icon">📄</span>
                      <span className="doc-name">{file.name}</span>
                      <span className="doc-size">{(file.size / 1024).toFixed(1)} KB</span>
                      <button type="button" className="remove-doc-btn" onClick={() => removeDocument(index)}>Remove</button>
                    </div>
                  ))}
                </div>
                <p className="upload-count">{carDocuments.length} document(s) selected</p>
              </>
            )}
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            {loading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p>Uploading... {uploadProgress}%</p>
              </div>
            )}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Listing Car..." : "List Car for Sale →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerAddCar;