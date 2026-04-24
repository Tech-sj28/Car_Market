import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Navbar from "../components/Navbar";
import Sellerregister from "../pages/Seller_pages/Sellerregister";
import Citys from "../components/Citys";
import BuyerRegister from "../pages/user_pages/BuyerRegister";
import BuyerLogin from "../pages/user_pages/BuyerLogin";
import SellerLogin from "../pages/Seller_pages/SellerLogin";
import AdminLogin from "../pages/admin_pages/AdminLogin";
import SellerAddCar from "../pages/Seller_pages/SellerAddCar";
import Categoriescar from "../components/Categoriescar";
import SellerDashboard from "../pages/Seller_pages/SellerDashboard";
import AdminCarVerification from "../pages/admin_pages/AdminCarVerification";
import BuyerCarListings from "../pages/user_pages/BuyerCarListings";
import Logout from "../components/Logout";
import BuyerTestDriveRequests from "../pages/user_pages/BuyerTestDriveRequests";
import SellerTestDriveRequests from "../pages/Seller_pages/SellerTestDriveRequests";
import AdminTestDriveRequests from "../pages/admin_pages/AdminTestDriveRequests";
import TestDriveRequestForm from "../pages/user_pages/TestDriveRequestForm";
import Mybooking from "../pages/user_pages/Mybooking";
import AdminNegotiations from "../pages/admin_pages/AdminNegotiations";
import SellerNegotiations from "../pages/Seller_pages/SellerNegotiations";
import BuyerNegotiations from "../pages/user_pages/BuyerNegotiations";
import AdminBookings from "../pages/admin_pages/AdminBookings";
import SellerBookings from "../pages/Seller_pages/SellerBookings";
function Approuter() {

  let [role,setrole]=useState(localStorage.getItem("role"))
  const updaterole = (role) => {
      setrole(role)
      if(role){
          localStorage.setItem("role",role)
      }
      else {
          localStorage.removeItem("role")
      }
  }
  console.log(role)
  return (
    <Router>
      <Navbar role={role}></Navbar>
      <Routes>
              <Route path="/" element={<Home></Home>} />
              <Route path="/sellerregsiter" element={<Sellerregister />} />
              <Route path="/BuyerRegister" element={<BuyerRegister/>} />
              <Route path="/cities" element={<Citys />} />
              <Route path="/Categoriescar" element={<Categoriescar/>} />
              <Route path="/BuyerLogin" element={<BuyerLogin updaterole={updaterole}/>} />
              <Route path="/SellerLogin" element={<SellerLogin updaterole={updaterole}/>} />
              <Route path="/AdminLogin" element={<AdminLogin updaterole={updaterole}/>} />
        <Route path="/SellerAddCar" element={<SellerAddCar />} />
        <Route path="/SellerDashboard" element={<SellerDashboard />} />
        <Route path="/AdminCarVerification" element={<AdminCarVerification />} />   
        <Route path="/BuyerCarListings" element={<BuyerCarListings />} />
        
<Route path="/test-drive/request" element={<TestDriveRequestForm />} />
<Route path="/my-test-drives" element={<BuyerTestDriveRequests />} />
<Route path="/seller/test-drives" element={<SellerTestDriveRequests />} />
        <Route path="/admin/test-drives" element={<AdminTestDriveRequests />} />
        <Route path="/admin/test-drives" element={<AdminTestDriveRequests />} />
        <Route path="/my-bookings" element={<Mybooking/>} />
            <Route path="/admin/negotiations" element={<AdminNegotiations />} />
        <Route path="/seller/negotiations" element={<SellerNegotiations />} />
        <Route path="/my-negotiations" element={<BuyerNegotiations/>} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
<Route path="/seller/bookings" element={<SellerBookings />} />

        <Route path="/Logout" element={<Logout updaterole={updaterole}/>} />
      </Routes>
    </Router>
  );
}

export default Approuter;
