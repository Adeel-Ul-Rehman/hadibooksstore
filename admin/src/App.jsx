import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Login from "./components/Login";
import ResetPassword from "./components/ResetPassword";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import EditProduct from "./pages/EditProduct";
import ProductDetails from "./pages/ProductDetails";
import HeroImages from "./pages/HeroImages";
import { AppProvider, AppContext } from "./context/AppContext";

// Define backendURL for API calls
export const backendURL =
  (import.meta.env.VITE_BACKEND_URL && !import.meta.env.VITE_BACKEND_URL.includes('onrender.com') ? import.meta.env.VITE_BACKEND_URL : '') ||
  (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('onrender.com') ? import.meta.env.VITE_API_URL : '') ||
  (typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) ? 'http://localhost:4000' : '');

const AppContent = () => {
  const { admin } = useContext(AppContext);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {!admin.token ? (
        <Routes>
          <Route path="/admin" element={<Login />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      ) : (
        <>
          <div className="fixed top-0 left-0 w-full z-50">
            <Navbar />
          </div>
          <div className="flex flex-1 pt-16">
            {" "}
            {/* Add padding-top to account for fixed navbar */}
            <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40">
              {" "}
              {/* Position sidebar below navbar */}
              <Sidebar />
            </div>
            <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 overflow-auto">
              {" "}
              {/* Add margin for sidebar and make content scrollable */}
              <Routes>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/add" element={<Add />} />
                <Route path="/admin/list" element={<List />} />
                <Route path="/admin/orders" element={<Orders />} />
                <Route path="/admin/hero-images" element={<HeroImages />} />
                <Route path="/admin/profile" element={<Profile />} />
                <Route path="/admin/edit/:id" element={<EditProduct />} />
                <Route path="/admin/product/:id" element={<ProductDetails />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
