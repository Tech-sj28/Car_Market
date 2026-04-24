const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const bcrypt = require("bcrypt");
const path = require("path");
const db = require("./util/dbconfig"); 
var jwt = require("jsonwebtoken");
const { decode } = require("punycode");
const saltRounds = 10;
const secretkey = "carsellProject001";

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ! universal ware
app.get("/cities", (req, res) => {
  db.query("select * from cities", (er, result) => {
    if (er) {
      console.log(er);
      return res.status(500).json({ msg: "database issue" });
    } else {
      return res.status(200).json(result);
    }
  });
});

app.get("/car_categories", (req, res) => {
  db.query("select * from car_categories", (er, result) => {
    if (er) {
      console.log(er);
      return res.status(500).json({ msg: "database issue" });
    } else {
      return res.status(200).json(result);
    }
  });
});


let generatetoken = (id, role) => {
  console.log("id", id, "role", role);
  return jwt.sign({ id, role }, secretkey, { expiresIn: "1h" });
};

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log("Auth Header:", authHeader); // Debug log

    // 1. Check if header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token or wrong format");
      return res.status(401).json({ msg: "Access denied. No token provided." });
    }

    // 2. Extract token safely
    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("Token missing after split");
      return res.status(401).json({ msg: "Token missing" });
    }

    console.log("Token received:", token.substring(0, 50) + "..."); // Debug log

    // 3. Verify token
    jwt.verify(token, secretkey, (err, decoded) => {
      if (err) {
        console.log("JWT Verification Error:", err.message);
        return res.status(403).json({ msg: "Invalid or expired token" });
      }

      console.log("Decoded token:", decoded); // Debug log

      // 4. Attach user data to request
      req.user = decoded;

      next();
    });
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};


// !  seller ware
let searchExistingseller = (email, callback) => {
  let sql = "SELECT * FROM sellers WHERE email = ?";
  db.query(sql, [email], callback);
};

app.post("/sellerinsert", async (req, res) => {
  try {
    console.log(req.body);

    const { name, email, password, phoneNumber, city } = req.body;

    if (!name || !email || !password || !phoneNumber || !city) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 1. Check if seller already exists
    searchExistingseller(email, async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ msg: "Database error" });
      }

      // 2. If email already exists → stop registration
      if (result.length > 0) {
        return res.status(409).json({ msg: "Seller already exists with this email" });
      }

      // 3. hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. insert into sellers table
      const sql =
        "INSERT INTO sellers (name, email, password, number, cityid) VALUES (?, ?, ?, ?, ?)";

      db.query(
        sql,
        [name, email, hashedPassword, phoneNumber, city],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ msg: "Database error" });
          }

          return res.status(200).json({
            msg: "Seller registered successfully",
            id: result.insertId
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

app.post("/sellerlogin", (req, res) => {
  console.log(req.body);
  let { email, password } = req.body;
  searchExistingseller(email, async (err, result) => {
    if (err) return res.status(500).json({ msg: "Database issue" });
    else {
      if (result.length > 0) {
        let pwd = await bcrypt.compare(password, result[0].password);

        if (pwd == true) {
          console.log("welcome back ", result[0].email);
          let id = result[0].id;
          let role = result[0].role;
          let token = generatetoken(id, role);

          res.status(200).json({ token: token, id: id ,role:role});
        } else {
          return res.status(401).json({ msg: "your password is wrong" });
        }
      } else {
        return res.status(404).json({ msg: "please login first" });
      }
    }
  });
});


// ! buyer ware

let searchExistingBuyer = (email, callback) => {
  let sql = "SELECT * FROM buyers WHERE email = ?";
  db.query(sql, [email], callback);
};

app.post("/buyerinsert", async (req, res) => {

  try {
    console.log(req.body);

    const { name, email, password, phoneNumber, city } = req.body;

    if (!name || !email || !password || !phoneNumber || !city) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 1. Check if seller already exists
    searchExistingBuyer(email, async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ msg: "Database error" });
      }

      // 2. If email already exists → stop registration
      if (result.length > 0) {
        return res.status(409).json({ msg: "Buyer already exists with this email" });
      }

      // 3. hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. insert into sellers table
      const sql =
        "INSERT INTO buyers (name, email, password, number, cityid) VALUES (?, ?, ?, ?, ?)";

      db.query(
        sql,
        [name, email, hashedPassword, phoneNumber, city],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ msg: "Database error" });
          }

          return res.status(200).json({
            msg: "Buyer registered successfully",
            id: result.insertId
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

 
app.post("/buyerlogin", (req, res) => {
  console.log(req.body);
  let { email, password } = req.body;
  searchExistingBuyer(email, async (err, result) => {
    if (err) return res.status(500).json({ msg: "Database issue" });
    else {
      if (result.length > 0) {
        let pwd = await bcrypt.compare(password, result[0].password);

        if (pwd == true) {
          console.log("welcome back ", result[0].email);
          let id = result[0].id;
          let role = result[0].role;
          let token = generatetoken(id, role);

          res.status(200).json({ token: token, id: id ,role:role});
        } else {
          return res.status(401).json({ msg: "your password is wrong" });
        }
      } else {
        return res.status(404).json({ msg: "please login first" });
      }
    }
  });
});

// GET endpoint to fetch all approved cars for buyers
app.get('/api/cars', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  
  const sql = `
    SELECT 
      cl.id, 
      cl.car_brand, 
      cl.car_model, 
      cl.variant, 
      cl.manufacturing_year,
      cl.expected_price, 
      cl.mileage, 
      cl.fuel_type,
      cl.transmission_type,
      cl.ownership_count,
      cl.vehicle_condition,
      cl.car_images,
      cl.features,
      cat.category_name,
      c.cityname
    FROM car_listings cl
    LEFT JOIN car_categories cat ON cl.category_id = cat.category_id
    LEFT JOIN cities c ON cl.city_id = c.cityid
    WHERE cl.status = 'approved'
    ORDER BY cl.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  db.query(sql, [parseInt(limit), parseInt(offset)], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    // Parse JSON fields
    results.forEach(car => {
      try {
        car.car_images = typeof car.car_images === 'string' ? JSON.parse(car.car_images) : (car.car_images || []);
        car.features = typeof car.features === 'string' ? JSON.parse(car.features) : (car.features || {});
      } catch(e) {
        car.car_images = [];
        car.features = {};
      }
    });
    
    res.json({ success: true, cars: results });
  });
});


// ! Admin ware
let searchExistingadmin = (email, callback) => {
  let sql = "SELECT * FROM admin WHERE email = ?";
  db.query(sql, [email], callback);
};
// ==================== ADMIN VERIFICATION MIDDLEWARE ====================
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: "Token missing" });
  }

  jwt.verify(token, secretkey, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
    
    console.log("Decoded token for admin:", decoded);
    
    // Check if user has admin role
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin privileges required." });
    }
    
    req.adminId = decoded.id;
    req.adminRole = decoded.role;
    next();
  });
};

app.post("/adminlogin", (req, res) => {
  console.log(req.body);

  let { email, password } = req.body;

  searchExistingadmin(email, (err, result) => {
    if (err) return res.status(500).json({ msg: "Database issue" });

    if (result.length > 0) {
      let admin = result[0];

      // ❌ removed bcrypt.compare
      if (password === admin.password) {
        console.log("welcome back ", admin.email);

        let id = admin.id;
        let role = admin.role;

        let token = generatetoken(id, role);

        res.status(200).json({
          token: token,
          id: id,
          role: role
        });
      } else {
        return res.status(401).json({ msg: "your password is wrong" });
      }
    } else {
      return res.status(404).json({ msg: "please login first" });
    }
  });
});
// ==================== ADMIN CAR APIs ====================

// Get all cars for admin
app.get('/api/admin/cars', verifyAdmin, (req, res) => {
  const sql = `
    SELECT 
      cl.*,
      cat.category_name,
      c.cityname,
      s.name as seller_name,
      s.email as seller_email,
      s.number as seller_phone
    FROM car_listings cl
    LEFT JOIN car_categories cat ON cl.category_id = cat.category_id
    LEFT JOIN cities c ON cl.city_id = c.cityid
    LEFT JOIN sellers s ON cl.seller_id = s.id
    ORDER BY cl.created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    // Parse JSON fields
    results.forEach(car => {
      try {
        car.features = typeof car.features === 'string' ? JSON.parse(car.features) : (car.features || {});
        car.car_images = typeof car.car_images === 'string' ? JSON.parse(car.car_images) : (car.car_images || []);
        car.documents = typeof car.documents === 'string' ? JSON.parse(car.documents) : (car.documents || []);
      } catch(e) {
        car.features = {};
        car.car_images = [];
        car.documents = [];
      }
    });
    
    res.json({ success: true, cars: results });
  });
});

// Schedule verification date

app.put('/api/admin/cars/:id/schedule-verification', verifyAdmin, (req, res) => {
  const carId = req.params.id;
  const { verificationDate } = req.body;
  
  if (!verificationDate) {
    return res.status(400).json({ success: false, message: 'Verification date is required' });
  }
  
  const sql = 'UPDATE car_listings SET verification_date = ? WHERE id = ?';
  
  db.query(sql, [verificationDate, carId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    res.json({ success: true, message: 'Verification scheduled successfully' });
  });
});

// Approve car
app.put('/api/admin/cars/:id/approve', verifyAdmin, (req, res) => {
  const carId = req.params.id;
  
  // Check if verification date is passed or not set
  const checkSql = 'SELECT verification_date FROM car_listings WHERE id = ?';
  
  db.query(checkSql, [carId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    const verificationDate = results[0]?.verification_date;
    
    // If verification date exists and is in the future, cannot approve
    if (verificationDate && new Date(verificationDate) > new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot approve before verification date: ${new Date(verificationDate).toLocaleDateString()}` 
      });
    }
    
    const sql = 'UPDATE car_listings SET status = "approved" WHERE id = ?';
    
    db.query(sql, [carId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Car not found' });
      }
      
      res.json({ success: true, message: 'Car approved successfully' });
    });
  });
});

// Reject car
app.put('/api/admin/cars/:id/reject', verifyAdmin, (req, res) => {
  const carId = req.params.id;
  const { reason } = req.body;
  
  // Check if verification date is passed or not set
  const checkSql = 'SELECT verification_date FROM car_listings WHERE id = ?';
  
  db.query(checkSql, [carId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    const verificationDate = results[0]?.verification_date;
    
    // If verification date exists and is in the future, cannot reject
    if (verificationDate && new Date(verificationDate) > new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot reject before verification date: ${new Date(verificationDate).toLocaleDateString()}` 
      });
    }
    
    const sql = 'UPDATE car_listings SET status = "rejected", rejection_reason = ? WHERE id = ?';
    
    db.query(sql, [reason || null, carId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Car not found' });
      }
      
      res.json({ success: true, message: 'Car rejected successfully' });
    });
  });
});


 


// ! bulder 

// Configure multer for car images and documents
const carStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    
    if (file.fieldname === 'carImages') {
      uploadPath = 'uploads/car-images/';
    } else if (file.fieldname === 'documents') {
      uploadPath = 'uploads/documents/';
    }
    
    // Create directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for car images and documents
const carFileFilter = (req, file, cb) => {
  if (file.fieldname === 'carImages') {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WEBP images are allowed'), false);
    }
  } else if (file.fieldname === 'documents') {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPEG, and PNG files are allowed'), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

// Multer configuration for multiple files
const carUpload = multer({
  storage: carStorage,
  fileFilter: carFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
}).fields([
  { name: 'carImages', maxCount: 10 },
  { name: 'documents', maxCount: 10 }
]);

// ==================== 1. CREATE - Add Car Listing ====================
app.post('/api/cars/add', verifyToken, carUpload, async (req, res) => {
  try {
    // Get seller ID from token (req.user.id from your verifyToken)
    const sellerId = req.user.id;
    
    console.log("Seller ID from token:", sellerId);
    
    if (!sellerId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication failed: No seller ID in token' 
      });
    }
    
    let carData;
    try {
      carData = JSON.parse(req.body.carData);
    } catch (e) {
      carData = req.body;
    }
    
    const {
      carBrand, carModel, variant, manufacturingYear, fuelType,
      transmissionType, ownershipCount, expectedPrice, mileage,
      vehicleCondition, accidentHistory, serviceHistoryAvailable,
      insuranceValidityDate, city, locality, category_id, carOwnerName, features
    } = carData;

    // Validate required fields
    if (!carBrand || !carModel || !expectedPrice || !category_id || !city) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: carBrand, carModel, expectedPrice, category_id, city' 
      });
    }

    // Process uploaded files
    const carImagePaths = [];
    const documentPaths = [];

    if (req.files && req.files.carImages) {
      req.files.carImages.forEach(file => {
        carImagePaths.push(`/uploads/car-images/${file.filename}`);
      });
    }

    if (req.files && req.files.documents) {
      req.files.documents.forEach(file => {
        documentPaths.push(`/uploads/documents/${file.filename}`);
      });
    }
    
    // Check if at least one image is uploaded
    if (carImagePaths.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one car image is required' 
      });
    }

    const featuresJSON = JSON.stringify(features || {});

    const sql = `
      INSERT INTO car_listings (
        seller_id, car_brand, car_model, variant, manufacturing_year,
        fuel_type, transmission_type, ownership_count, expected_price,
        mileage, vehicle_condition, accident_history, service_history_available,
        insurance_validity_date, city_id, locality, category_id,
        car_owner_name, features, car_images, documents, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      sellerId, carBrand, carModel, variant || null, manufacturingYear || null,
      fuelType || null, transmissionType || null, ownershipCount || null, expectedPrice,
      mileage || null, vehicleCondition || null, accidentHistory || null,
      serviceHistoryAvailable || null, insuranceValidityDate || null, city,
      locality || null, category_id, carOwnerName || null, featuresJSON,
      JSON.stringify(carImagePaths), JSON.stringify(documentPaths), 'pending'
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error occurred',
          error: err.message 
        });
      }

      res.status(201).json({
        success: true,
        message: 'Car listing created successfully',
        carId: result.insertId,
        carImages: carImagePaths,
        documents: documentPaths
      });
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred',
      error: error.message 
    });
  }
});

// ==================== 2. READ - Get Seller's All Cars ====================
app.get('/api/cars/my-listings', verifyToken, (req, res) => {
  const sellerId = req.user.id;
  
  const sql = `
    SELECT 
      cl.id, cl.car_brand, cl.car_model, cl.variant, cl.manufacturing_year,
      cl.expected_price, cl.mileage, cl.status, cl.created_at,
      cl.verification_date,
      cl.rejection_reason,
      c.cityname, cat.category_name
    FROM car_listings cl
    LEFT JOIN cities c ON cl.city_id = c.cityid
    LEFT JOIN car_categories cat ON cl.category_id = cat.category_id
    WHERE cl.seller_id = ?
    ORDER BY cl.created_at DESC
  `;
  
  db.query(sql, [sellerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, listings: results });
  });
});
 
// ==================== GET Single Car Details ====================
app.get('/api/cars/:id', verifyToken, (req, res) => {
  const carId = req.params.id;
  const userId = req.user.id;
  
  console.log("=== GET CAR DETAILS ===");
  console.log("Car ID:", carId);
  console.log("User ID:", userId);
  
  const sql = `
    SELECT 
      cl.id,
      cl.seller_id,
      cl.car_brand,
      cl.car_model,
      cl.variant,
      cl.manufacturing_year,
      cl.fuel_type,
      cl.transmission_type,
      cl.ownership_count,
      cl.expected_price,
      cl.mileage,
      cl.vehicle_condition,
      cl.accident_history,
      cl.service_history_available,
      cl.insurance_validity_date,
      cl.city_id,
      cl.locality,
      cl.category_id,
      cl.car_owner_name,
      cl.features,
      cl.car_images,
      cl.documents,
      cl.status,
      cl.views,
      cl.created_at,
      cl.updated_at,
      cl.verification_date,
      cl.rejection_reason,
      cat.category_name,
      c.cityname,
      c.statename
    FROM car_listings cl
    LEFT JOIN car_categories cat ON cl.category_id = cat.category_id
    LEFT JOIN cities c ON cl.city_id = c.cityid
    WHERE cl.id = ?
  `;
  
  db.query(sql, [carId], (err, results) => {
    if (err) {
      console.error("Error fetching car:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    const carData = results[0];
    console.log("Raw car data from DB:", carData);
    
    // Check authorization
    if (carData.status !== 'approved' && carData.seller_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Handle features - it might already be an object or a JSON string
    let parsedFeatures = {};
    if (carData.features) {
      if (typeof carData.features === 'string') {
        try {
          parsedFeatures = JSON.parse(carData.features);
        } catch (e) {
          console.error("Error parsing features string:", e);
          parsedFeatures = {};
        }
      } else if (typeof carData.features === 'object') {
        parsedFeatures = carData.features;
      }
    }
    
    // Handle car_images - it might already be an array or a JSON string
    let parsedImages = [];
    if (carData.car_images) {
      if (typeof carData.car_images === 'string') {
        try {
          parsedImages = JSON.parse(carData.car_images);
        } catch (e) {
          console.error("Error parsing car_images string:", e);
          // If it's not JSON, it might be a single path
          parsedImages = [carData.car_images];
        }
      } else if (Array.isArray(carData.car_images)) {
        parsedImages = carData.car_images;
      }
    }
    
    // Handle documents - it might already be an array or a JSON string
    let parsedDocuments = [];
    if (carData.documents) {
      if (typeof carData.documents === 'string') {
        try {
          parsedDocuments = JSON.parse(carData.documents);
        } catch (e) {
          console.error("Error parsing documents string:", e);
          // If it's not JSON, it might be a single path
          parsedDocuments = [carData.documents];
        }
      } else if (Array.isArray(carData.documents)) {
        parsedDocuments = carData.documents;
      }
    }
    
    // Create complete response object with ALL fields
    const responseCar = {
      id: carData.id,
      seller_id: carData.seller_id,
      car_brand: carData.car_brand,
      car_model: carData.car_model,
      variant: carData.variant,
      manufacturing_year: carData.manufacturing_year,
      fuel_type: carData.fuel_type,
      transmission_type: carData.transmission_type,
      ownership_count: carData.ownership_count,
      expected_price: carData.expected_price,
      mileage: carData.mileage,
      vehicle_condition: carData.vehicle_condition,
      accident_history: carData.accident_history,
      service_history_available: carData.service_history_available,
      insurance_validity_date: carData.insurance_validity_date,
      city_id: carData.city_id,
      locality: carData.locality,
      category_id: carData.category_id,
      car_owner_name: carData.car_owner_name,
      features: parsedFeatures,
      car_images: parsedImages,
      documents: parsedDocuments,
      status: carData.status,
      verification_date: carData.verification_date,
      rejection_reason: carData.rejection_reason,
      views: carData.views,
      created_at: carData.created_at,
      updated_at: carData.updated_at,
      category_name: carData.category_name,
      cityname: carData.cityname,
      state: carData.statename
    };
    
    console.log("Final response - verification_date:", responseCar.verification_date);
    console.log("Final response - rejection_reason:", responseCar.rejection_reason);
    
    res.json({ success: true, car: responseCar });
  });
});




// ==================== 4. READ - Get All Approved Cars (For Buyers) ====================
app.get('/api/cars', (req, res) => {
  const { page = 1, limit = 10, category, city, minPrice, maxPrice } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = `
    SELECT 
      cl.id, 
      cl.seller_id,
      cl.car_brand, 
      cl.car_model, 
      cl.variant, 
      cl.manufacturing_year,
      cl.expected_price, 
      cl.mileage, 
      cl.fuel_type, 
      cl.transmission_type,
      cl.car_images, 
      cat.category_name, 
      c.cityname
    FROM car_listings cl
    LEFT JOIN car_categories cat ON cl.category_id = cat.category_id
    LEFT JOIN cities c ON cl.city_id = c.cityid
    WHERE cl.status = 'approved'
  `;
  
  const queryParams = [];
  
  if (category) {
    sql += ' AND cl.category_id = ?';
    queryParams.push(category);
  }
  if (city) {
    sql += ' AND cl.city_id = ?';
    queryParams.push(city);
  }
  if (minPrice) {
    sql += ' AND cl.expected_price >= ?';
    queryParams.push(minPrice);
  }
  if (maxPrice) {
    sql += ' AND cl.expected_price <= ?';
    queryParams.push(maxPrice);
  }
  
  sql += ' ORDER BY cl.created_at DESC LIMIT ? OFFSET ?';
  queryParams.push(parseInt(limit), parseInt(offset));
  
  db.query(sql, queryParams, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    results.forEach(car => {
      try {
        car.car_images = typeof car.car_images === 'string' ? JSON.parse(car.car_images) : (car.car_images || []);
      } catch(e) {
        car.car_images = [];
      }
    });
    
    res.json({ success: true, cars: results, page: parseInt(page), limit: parseInt(limit) });
  });
});
// ==================== 5. UPDATE - Edit Car Listing ====================
app.put('/api/cars/:id', verifyToken, carUpload, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const carId = req.params.id;
    
    console.log("Update - Car ID:", carId);
    console.log("Update - Seller ID:", sellerId);
    
    let carData;
    try {
      carData = JSON.parse(req.body.carData);
    } catch (e) {
      carData = req.body;
    }
    
    console.log("Update - Car Data:", carData);
    
    // Check if car belongs to seller
    const checkSql = 'SELECT id FROM car_listings WHERE id = ? AND seller_id = ?';
    db.query(checkSql, [carId, sellerId], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      
      // Get existing images and documents
      let existingImages = [];
      let existingDocuments = [];
      
      try {
        existingImages = carData.existingImages ? (typeof carData.existingImages === 'string' ? JSON.parse(carData.existingImages) : carData.existingImages) : [];
      } catch (e) {
        existingImages = [];
      }
      
      try {
        existingDocuments = carData.existingDocuments ? (typeof carData.existingDocuments === 'string' ? JSON.parse(carData.existingDocuments) : carData.existingDocuments) : [];
      } catch (e) {
        existingDocuments = [];
      }
      
      // Process new images
      let carImagePaths = [...existingImages];
      let documentPaths = [...existingDocuments];
      
      if (req.files && req.files.carImages) {
        req.files.carImages.forEach(file => {
          carImagePaths.push(`/uploads/car-images/${file.filename}`);
        });
      }
      if (req.files && req.files.documents) {
        req.files.documents.forEach(file => {
          documentPaths.push(`/uploads/documents/${file.filename}`);
        });
      }
      
      // Format date properly for MySQL
      let formattedDate = null;
      if (carData.insuranceValidityDate) {
        // Check if it's already in YYYY-MM-DD format
        if (carData.insuranceValidityDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          formattedDate = carData.insuranceValidityDate;
        } else {
          // Convert ISO string to YYYY-MM-DD
          const date = new Date(carData.insuranceValidityDate);
          formattedDate = date.toISOString().split('T')[0];
        }
      }
      
      console.log("Formatted date:", formattedDate);
      
      const updateSql = `
        UPDATE car_listings SET
          car_brand = ?, car_model = ?, variant = ?, manufacturing_year = ?,
          fuel_type = ?, transmission_type = ?, ownership_count = ?,
          expected_price = ?, mileage = ?, vehicle_condition = ?,
          accident_history = ?, service_history_available = ?,
          insurance_validity_date = ?, city_id = ?, locality = ?,
          category_id = ?, car_owner_name = ?, features = ?,
          car_images = ?, documents = ?, status = 'pending', updated_at = NOW()
        WHERE id = ? AND seller_id = ?
      `;
      
      const values = [
        carData.carBrand,
        carData.carModel,
        carData.variant || null,
        carData.manufacturingYear || null,
        carData.fuelType || null,
        carData.transmissionType || null,
        carData.ownershipCount || null,
        carData.expectedPrice,
        carData.mileage || null,
        carData.vehicleCondition || null,
        carData.accidentHistory || null,
        carData.serviceHistoryAvailable || null,
        formattedDate,  // ✅ Use formatted date
        carData.city,
        carData.locality || null,
        carData.category_id,
        carData.carOwnerName || null,
        JSON.stringify(carData.features || {}),
        JSON.stringify(carImagePaths),
        JSON.stringify(documentPaths),
        carId,
        sellerId
      ];
      
      console.log("Update values:", values);
      
      db.query(updateSql, values, (err) => {
        if (err) {
          console.error("Update error:", err);
          return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }
        res.json({ success: true, message: 'Car listing updated successfully' });
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== 6. DELETE - Remove Car Listing ====================
app.delete('/api/cars/:id', verifyToken, (req, res) => {
  const sellerId = req.user.id;
  const carId = req.params.id;
  
  const deleteSql = 'DELETE FROM car_listings WHERE id = ? AND seller_id = ?';
  db.query(deleteSql, [carId, sellerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Car not found or unauthorized' });
    }
    
    res.json({ success: true, message: 'Car listing deleted successfully' });
  });
});


// !lunder 2

// ==================== TEST DRIVE REQUEST APIs ====================
// user verify middleware
const userverifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "Token missing" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretkey, (err, decoded) => {
    if (err) {
      console.log("JWT ERROR:", err);
      return res.status(401).json({ msg: "Invalid token" });
    }

    console.log("DECODED:", decoded);
    
    // Set both userId and user object for compatibility
    req.userId = decoded.id;
    req.user = decoded;
    next();
  });
};

// Buyer creates test drive request
app.post('/api/test-drive/request', userverifyToken, (req, res) => {
  const { carId, sellerId, preferredDate, message } = req.body;
  
  // Get buyer_id from token - req.userId is set by userverifyToken
  const buyerId = req.userId;
  
  console.log("=== TEST DRIVE REQUEST ===");
  console.log("Buyer ID from token:", buyerId);
  console.log("Car ID:", carId);
  console.log("Seller ID:", sellerId);
  console.log("Preferred Date:", preferredDate);
  console.log("Message:", message);
  
  if (!buyerId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }
  
  if (!sellerId) {
    return res.status(400).json({ success: false, message: 'Seller ID is required' });
  }

  const sql = `
    INSERT INTO test_drive_requests 
    (car_id, buyer_id, seller_id, preferred_date, buyer_message, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'pending', NOW())
  `;

  db.query(sql, [carId, buyerId, sellerId, preferredDate, message], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
    res.json({ success: true, message: 'Test drive request sent to admin', requestId: result.insertId });
  });
});

// Admin gets all test drive requests
app.get('/api/test-drive/admin-requests', verifyAdmin, (req, res) => {
  const sql = `
    SELECT 
      tdr.*,
      c.car_brand, 
      c.car_model, 
      c.expected_price,
      buyer.name as buyer_name, 
      buyer.email as buyer_email, 
      buyer.number as buyer_phone,
      seller.name as seller_name, 
      seller.email as seller_email, 
      seller.number as seller_phone
    FROM test_drive_requests tdr
    JOIN car_listings c ON tdr.car_id = c.id
    JOIN buyers buyer ON tdr.buyer_id = buyer.id
    JOIN sellers seller ON tdr.seller_id = seller.id
    ORDER BY tdr.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, requests: results });
  });
});

// Admin suggests a date
app.put('/api/test-drive/suggest-date/:id', verifyAdmin, (req, res) => {
  const { suggestedDate, adminMessage } = req.body;
  const requestId = req.params.id;

  const sql = `
    UPDATE test_drive_requests 
    SET suggested_date = ?, admin_message = ?, status = 'date_suggested', 
        suggested_by = 'admin', suggested_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [suggestedDate, adminMessage, requestId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, message: 'Date suggested successfully' });
  });
});

// Buyer/Seller confirms the date
app.put('/api/test-drive/confirm-date/:id', verifyToken, (req, res) => {
  const requestId = req.params.id;
  const userRole = req.user.role;
  const userId = req.user.id;

  let updateField = '';
  if (userRole === 'buyer') {
    updateField = 'buyer_confirmed = 1';
  } else if (userRole === 'seller') {
    updateField = 'seller_confirmed = 1';
  } else {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  // Check current status
  const checkSql = 'SELECT buyer_confirmed, seller_confirmed, status FROM test_drive_requests WHERE id = ?';
  
  db.query(checkSql, [requestId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    const current = results[0];
    
    // Update confirmation
    const updateSql = `UPDATE test_drive_requests SET ${updateField} WHERE id = ?`;
    
    db.query(updateSql, [requestId], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      // Check if both confirmed
      const newBuyerConfirmed = userRole === 'buyer' ? 1 : current.buyer_confirmed;
      const newSellerConfirmed = userRole === 'seller' ? 1 : current.seller_confirmed;
      
      if (newBuyerConfirmed === 1 && newSellerConfirmed === 1) {
        const finalSql = 'UPDATE test_drive_requests SET status = "confirmed", confirmed_at = NOW() WHERE id = ?';
        db.query(finalSql, [requestId], (err) => {
          if (err) console.error(err);
        });
      }
      
      res.json({ success: true, message: 'Date confirmed successfully' });
    });
  });
});

// Request date change
app.post('/api/test-drive/request-date-change/:id', verifyToken, (req, res) => {
  const requestId = req.params.id;
  const { newPreferredDate, reason } = req.body;
  const userRole = req.user.role;

  const sql = `
    UPDATE test_drive_requests 
    SET requested_new_date = ?, date_change_reason = ?, 
        date_change_requested_by = ?, date_change_requested_at = NOW(),
        status = 'date_change_requested'
    WHERE id = ?
  `;

  db.query(sql, [newPreferredDate, reason, userRole, requestId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, message: 'Date change request sent to admin' });
  });
});

// Get requests for buyer
app.get('/api/test-drive/buyer-requests', userverifyToken, (req, res) => {
  const buyerId = req.userId;
  
  console.log("=== FETCHING BUYER REQUESTS ===");
  console.log("Buyer ID:", buyerId);

  const sql = `
    SELECT 
      tdr.*,
      c.car_brand, c.car_model, c.expected_price, c.car_images,
      seller.name as seller_name, seller.number as seller_phone
    FROM test_drive_requests tdr
    JOIN car_listings c ON tdr.car_id = c.id
    JOIN sellers seller ON tdr.seller_id = seller.id
    WHERE tdr.buyer_id = ?
    ORDER BY tdr.created_at DESC
  `;

  db.query(sql, [buyerId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    console.log("Found requests:", results.length);
    console.log("Results:", results);
    
    res.json({ success: true, requests: results });
  });
});

// Get requests for seller
app.get('/api/test-drive/seller-requests', verifyToken, (req, res) => {
  const sellerId = req.user.id;

  const sql = `
    SELECT 
      tdr.*,
      c.car_brand, 
      c.car_model, 
      c.expected_price, 
      c.car_images,
      buyer.name as buyer_name, 
      buyer.email as buyer_email, 
      buyer.number as buyer_phone
    FROM test_drive_requests tdr
    JOIN car_listings c ON tdr.car_id = c.id
    JOIN buyers buyer ON tdr.buyer_id = buyer.id
    WHERE tdr.seller_id = ?
    ORDER BY tdr.created_at DESC
  `;

  db.query(sql, [sellerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, requests: results });
  });
});


// ! blunder 3

// ==================== PURCHASE & NEGOTIATION APIs ====================

// Check if user can book a car (after test drive)
app.get('/api/can-book/:carId', userverifyToken, (req, res) => {
  const carId = req.params.carId;
  const buyerId = req.userId;

  const sql = `
    SELECT * FROM test_drive_requests 
    WHERE car_id = ? AND buyer_id = ? AND status = 'confirmed'
  `;

  db.query(sql, [carId, buyerId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    const canBook = results.length > 0;
    res.json({ success: true, canBook });
  });
});

// Create negotiation request
app.post('/api/negotiate', userverifyToken, (req, res) => {
  const { carId, offeredPrice } = req.body;
  const buyerId = req.userId;

  // Get car details
  const carSql = 'SELECT seller_id, expected_price FROM car_listings WHERE id = ?';
  
  db.query(carSql, [carId], (err, carResults) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (carResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    const car = carResults[0];
    const originalPrice = parseFloat(car.expected_price);
    const sellerId = car.seller_id;
    
    // Check if negotiation already exists
    const checkSql = 'SELECT id FROM negotiations WHERE car_id = ? AND buyer_id = ? AND status IN ("pending", "admin_approved", "seller_approved")';
    
    db.query(checkSql, [carId, buyerId], (err, existing) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'You already have a pending negotiation for this car' });
      }
      
      const insertSql = `
        INSERT INTO negotiations (car_id, buyer_id, seller_id, offered_price, original_price, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `;
      
      db.query(insertSql, [carId, buyerId, sellerId, offeredPrice, originalPrice], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        res.json({ success: true, message: 'Negotiation request sent to admin', negotiationId: result.insertId });
      });
    });
  });
});

// Admin get all negotiations
app.get('/api/admin/negotiations', verifyAdmin, (req, res) => {
  const sql = `
    SELECT 
      n.*,
      c.car_brand, c.car_model,
      buyer.name as buyer_name, buyer.email as buyer_email,
      seller.name as seller_name, seller.email as seller_email
    FROM negotiations n
    JOIN car_listings c ON n.car_id = c.id
    JOIN buyers buyer ON n.buyer_id = buyer.id
    JOIN sellers seller ON n.seller_id = seller.id
    ORDER BY n.created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, negotiations: results });
  });
});

// Admin approve/reject negotiation
app.put('/api/admin/negotiate/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { action, adminMessage } = req.body;
  
  let status = action === 'approve' ? 'admin_approved' : 'admin_rejected';
  
  const sql = `
    UPDATE negotiations 
    SET status = ?, admin_approved = ?, admin_message = ?
    WHERE id = ?
  `;
  
  const adminApproved = action === 'approve' ? 1 : 0;
  
  db.query(sql, [status, adminApproved, adminMessage || null, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, message: `Negotiation ${action}d successfully` });
  });
});

// Seller get their negotiations
app.get('/api/seller/negotiations', verifyToken, (req, res) => {
  const sellerId = req.user.id;
  
  const sql = `
    SELECT 
      n.*,
      c.car_brand, c.car_model,
      buyer.name as buyer_name, buyer.email as buyer_email, buyer.number as buyer_phone
    FROM negotiations n
    JOIN car_listings c ON n.car_id = c.id
    JOIN buyers buyer ON n.buyer_id = buyer.id
    WHERE n.seller_id = ? AND n.status IN ('admin_approved', 'seller_approved', 'seller_rejected')
    ORDER BY n.created_at DESC
  `;
  
  db.query(sql, [sellerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, negotiations: results });
  });
});

// Seller approve/reject negotiation
app.put('/api/seller/negotiate/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const sellerId = req.user.id;
  
  // Verify negotiation belongs to seller
  const checkSql = 'SELECT id FROM negotiations WHERE id = ? AND seller_id = ? AND status = "admin_approved"';
  
  db.query(checkSql, [id, sellerId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized or negotiation not ready' });
    }
    
    let status = action === 'approve' ? 'seller_approved' : 'seller_rejected';
    let sellerApproved = action === 'approve' ? 1 : 0;
    
    const updateSql = `
      UPDATE negotiations 
      SET status = ?, seller_approved = ?
      WHERE id = ?
    `;
    
    db.query(updateSql, [status, sellerApproved, id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      // If approved, update the car price? Or just for booking reference
      res.json({ success: true, message: `Negotiation ${action}d successfully` });
    });
  });
});

// Create booking
app.post('/api/create-booking', userverifyToken, (req, res) => {
  const { carId, finalPrice, useNegotiatedPrice } = req.body;
  const buyerId = req.userId;
  
  // Get car and seller details
  const carSql = `
    SELECT c.*, s.name as seller_name, s.email as seller_email, s.number as seller_phone
    FROM car_listings c
    JOIN sellers s ON c.seller_id = s.id
    WHERE c.id = ?
  `;
  
  db.query(carSql, [carId], (err, carResults) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (carResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    const car = carResults[0];
    let finalPriceValue = parseFloat(car.expected_price);
    
    // Check if using negotiated price
    if (useNegotiatedPrice) {
      const negSql = 'SELECT offered_price FROM negotiations WHERE car_id = ? AND buyer_id = ? AND status = "seller_approved"';
      
      db.query(negSql, [carId, buyerId], (err, negResults) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (negResults.length > 0) {
          finalPriceValue = parseFloat(negResults[0].offered_price);
        }
        
        createBooking(car, finalPriceValue, buyerId);
      });
    } else {
      createBooking(car, finalPriceValue, buyerId);
    }
    
    function createBooking(car, finalPrice, buyerId) {
      const platformCommission = finalPrice * 0.10; // 10% commission
      const bookingAmount = platformCommission;
      const remainingAmount = finalPrice - bookingAmount;
      
      const insertSql = `
        INSERT INTO bookings (
          car_id, buyer_id, seller_id, final_price, booking_amount, 
          platform_commission, remaining_amount, payment_status, status, booking_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', CURDATE())
      `;
      
      db.query(insertSql, [car.id, buyerId, car.seller_id, finalPrice, bookingAmount, platformCommission, remainingAmount], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        res.json({
          success: true,
          message: 'Booking created successfully',
          bookingId: result.insertId,
          bookingAmount: bookingAmount,
          remainingAmount: remainingAmount,
          sellerDetails: {
            name: car.seller_name,
            email: car.seller_email,
            phone: car.seller_phone
          }
        });
      });
    }
  });
});

// Get buyer's bookings
app.get('/api/my-bookings', userverifyToken, (req, res) => {
  const buyerId = req.userId;
  
  const sql = `
    SELECT 
      b.*,
      c.car_brand, c.car_model, c.car_images,
      seller.name as seller_name, seller.email as seller_email, seller.number as seller_phone
    FROM bookings b
    JOIN car_listings c ON b.car_id = c.id
    JOIN sellers seller ON b.seller_id = seller.id
    WHERE b.buyer_id = ?
    ORDER BY b.created_at DESC
  `;
  
  db.query(sql, [buyerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    results.forEach(booking => {
      try {
        booking.car_images = typeof booking.car_images === 'string' ? JSON.parse(booking.car_images) : (booking.car_images || []);
      } catch(e) {
        booking.car_images = [];
      }
    });
    
    res.json({ success: true, bookings: results });
  });
});

// Update booking payment status
app.put('/api/booking/payment/:id', userverifyToken, (req, res) => {
  const { id } = req.params;
  const { paymentId } = req.body;
  
  const sql = `
    UPDATE bookings 
    SET payment_status = 'booking_paid', 
        booking_payment_id = ?, 
        status = 'confirmed'
    WHERE id = ? AND buyer_id = ?
  `;
  
  db.query(sql, [paymentId, id, req.userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    res.json({ success: true, message: 'Payment recorded successfully' });
  });
});

// Mark as delivered (buyer confirms delivery)
app.put('/api/booking/deliver/:id', userverifyToken, (req, res) => {
  const { id } = req.params;
  
  const sql = `
    UPDATE bookings 
    SET status = 'delivered', payment_status = 'full_paid'
    WHERE id = ? AND buyer_id = ?
  `;
  
  db.query(sql, [id, req.userId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, message: 'Delivery confirmed' });
  });
});



// Get negotiations for buyer
app.get('/api/buyer/negotiations', userverifyToken, (req, res) => {
  const buyerId = req.userId;

  const sql = `
    SELECT 
      n.*,
      c.car_brand, c.car_model, c.car_images,
      seller.name as seller_name, seller.email as seller_email
    FROM negotiations n
    JOIN car_listings c ON n.car_id = c.id
    JOIN sellers seller ON n.seller_id = seller.id
    WHERE n.buyer_id = ?
    ORDER BY n.created_at DESC
  `;

  db.query(sql, [buyerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    results.forEach(neg => {
      try {
        neg.car_images = typeof neg.car_images === 'string' ? JSON.parse(neg.car_images) : (neg.car_images || []);
      } catch(e) {
        neg.car_images = [];
      }
    });
    
    res.json({ success: true, negotiations: results });
  });
});




// Admin get all bookings
app.get('/api/admin/bookings', verifyAdmin, (req, res) => {
  const sql = `
    SELECT 
      b.*,
      c.car_brand, c.car_model, c.car_images,
      buyer.name as buyer_name, buyer.email as buyer_email, buyer.number as buyer_phone,
      seller.name as seller_name, seller.email as seller_email, seller.number as seller_phone
    FROM bookings b
    JOIN car_listings c ON b.car_id = c.id
    JOIN buyers buyer ON b.buyer_id = buyer.id
    JOIN sellers seller ON b.seller_id = seller.id
    ORDER BY b.created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    results.forEach(booking => {
      try {
        booking.car_images = typeof booking.car_images === 'string' ? JSON.parse(booking.car_images) : (booking.car_images || []);
      } catch(e) {
        booking.car_images = [];
      }
    });
    
    res.json({ success: true, bookings: results });
  });
});

// Seller get their bookings
app.get('/api/seller/bookings', verifyToken, (req, res) => {
  const sellerId = req.user.id;
  
  const sql = `
    SELECT 
      b.*,
      c.car_brand, c.car_model, c.car_images,
      buyer.name as buyer_name, buyer.email as buyer_email, buyer.number as buyer_phone
    FROM bookings b
    JOIN car_listings c ON b.car_id = c.id
    JOIN buyers buyer ON b.buyer_id = buyer.id
    WHERE b.seller_id = ?
    ORDER BY b.created_at DESC
  `;
  
  db.query(sql, [sellerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    results.forEach(booking => {
      try {
        booking.car_images = typeof booking.car_images === 'string' ? JSON.parse(booking.car_images) : (booking.car_images || []);
      } catch(e) {
        booking.car_images = [];
      }
      // Ensure these fields exist with default values
      booking.buyer_confirmed = booking.buyer_confirmed || 0;
      booking.seller_confirmed = booking.seller_confirmed || 0;
    });
    
    console.log("Seller bookings with confirm fields:", results.map(b => ({ 
      id: b.id, 
      status: b.status, 
      seller_confirmed: b.seller_confirmed,
      buyer_confirmed: b.buyer_confirmed 
    })));
    
    res.json({ success: true, bookings: results });
  });
});

// Seller marks as delivered (seller confirms delivery)
app.put('/api/booking/seller-delivered/:id', verifyToken, (req, res) => {
  const bookingId = req.params.id;
  const sellerId = req.user.id;
  
  console.log("=== SELLER DELIVERED ===");
  console.log("Booking ID:", bookingId);
  console.log("Seller ID:", sellerId);
  
  // Check current status
  const checkSql = 'SELECT status, buyer_confirmed FROM bookings WHERE id = ? AND seller_id = ?';
  
  db.query(checkSql, [bookingId, sellerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    const booking = results[0];
    
    // If buyer already confirmed, mark as completed
    if (booking.buyer_confirmed === 1) {
      const updateSql = `
        UPDATE bookings 
        SET status = 'completed', 
            seller_confirmed = 1, 
            payment_status = 'full_paid',
            completed_at = NOW()
        WHERE id = ?
      `;
      
      db.query(updateSql, [bookingId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        // Mark car as sold in car_listings
        const carSql = 'UPDATE car_listings SET status = "sold" WHERE id = (SELECT car_id FROM bookings WHERE id = ?)';
        db.query(carSql, [bookingId], (err) => {
          if (err) console.error(err);
        });
        
        res.json({ success: true, message: 'Delivery confirmed! Transaction completed.' });
      });
    } else {
      // Just mark seller as confirmed
      const updateSql = 'UPDATE bookings SET seller_confirmed = 1 WHERE id = ?';
      
      db.query(updateSql, [bookingId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, message: 'Delivery marked. Waiting for buyer confirmation.' });
      });
    }
  });
});

// Buyer confirms receipt of car
app.put('/api/booking/buyer-received/:id', userverifyToken, (req, res) => {
  const bookingId = req.params.id;
  const buyerId = req.userId;
  
  console.log("=== BUYER RECEIVED ===");
  console.log("Booking ID:", bookingId);
  console.log("Buyer ID:", buyerId);
  
  // Check current status
  const checkSql = 'SELECT status, seller_confirmed FROM bookings WHERE id = ? AND buyer_id = ?';
  
  db.query(checkSql, [bookingId, buyerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    const booking = results[0];
    
    // If seller already confirmed, mark as completed
    if (booking.seller_confirmed === 1) {
      const updateSql = `
        UPDATE bookings 
        SET status = 'completed', 
            buyer_confirmed = 1, 
            payment_status = 'full_paid',
            completed_at = NOW()
        WHERE id = ?
      `;
      
      db.query(updateSql, [bookingId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        // Mark car as sold in car_listings
        const carSql = 'UPDATE car_listings SET status = "sold" WHERE id = (SELECT car_id FROM bookings WHERE id = ?)';
        db.query(carSql, [bookingId], (err) => {
          if (err) console.error(err);
        });
        
        res.json({ success: true, message: 'Car receipt confirmed! Transaction completed.' });
      });
    } else {
      // Just mark buyer as confirmed
      const updateSql = 'UPDATE bookings SET buyer_confirmed = 1 WHERE id = ?';
      
      db.query(updateSql, [bookingId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, message: 'Receipt confirmed. Waiting for seller confirmation.' });
      });
    }
  });
});

app.listen(5000, (error) => {
    if (error) console.log(error);
    else console.log("Using port 5000 ");
  });