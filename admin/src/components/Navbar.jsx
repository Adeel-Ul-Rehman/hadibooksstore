import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { backendURL } from "../App";

const Navbar = () => {
  const { admin, updateAdmin } = useContext(AppContext);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await fetch(`${backendURL}/api/adminCtrl/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${admin.token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          updateAdmin({
            token: "",
            id: null,
            name: "",
            email: "",
            profilePicture: "",
          });
          navigate("/admin");
        } else {
          throw new Error(data.message || 'Logout failed');
        }
      } else {
        throw new Error(`HTTP error: ${response.status}`);
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear client state even if server logout fails
      updateAdmin({
        token: "",
        id: null,
        name: "",
        email: "",
        profilePicture: "",
      });
      navigate("/admin");
    } finally {
      setLogoutLoading(false);
      setShowLogoutMenu(false);
    }
  };

  return (
    <nav className="w-full bg-gradient-to-r from-black via-red-900 to-orange-800 shadow-lg px-4 md:px-6 py-3 flex items-center justify-between relative h-16">
      {/* Left side - Logo */}
      <div className="flex items-center space-x-3">
        <div
          className="bg-sky-100 p-1 md:p-2 rounded-lg shadow-md border border-sky-300 cursor-pointer"
          onClick={() => navigate("/admin/dashboard")}
        >
          <img src={assets.logo} alt="Logo" className="h-6 md:h-8 w-auto" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sky-100 text-lg md:text-xl font-bold">
            Hadi Books Store
          </h1>
          <p className="text-orange-300 text-xs font-semibold">
            Admin Dashboard
          </p>
        </div>
      </div>

      {/* Center - Title for mobile */}
      <div className="sm:hidden">
        <h1 className="text-sky-100 text-md font-bold">Admin Panel</h1>
      </div>

      {/* Right side - User info and logout */}
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sky-100 text-sm font-medium">
            {admin.name || "Admin User"}
          </span>
          <span className="text-orange-300 text-xs">{admin.email}</span>
        </div>
        <div
          className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-red-600 border-2 border-orange-400 flex items-center justify-center text-white font-bold shadow-md text-sm md:text-base cursor-pointer"
          onClick={() => navigate("/admin/profile")}
        >
          {admin.profilePicture ? (
            <img
              src={admin.profilePicture}
              alt="Profile"
              className="h-full w-full rounded-full object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iMjAiIHk9IjIwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIj5BPC90ZXh0Pjwvc3ZnPg==';
                e.target.style.display = 'block';
              }}
            />
          ) : (
            admin.name?.charAt(0).toUpperCase() || "A"
          )}
        </div>
        <button
          onClick={() => setShowLogoutMenu(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1 md:px-4 md:py-2 rounded-lg transition-all duration-300 border border-orange-400 shadow-md flex items-center space-x-1 md:space-x-2 text-sm md:text-base cursor-pointer"
          disabled={logoutLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 md:h-5 md:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden xs:inline">Logout</span>
        </button>

        {/* Logout Confirmation Mini Menu */}
        {showLogoutMenu && (
          <div className="absolute top-full right-4 mt-2 w-48 bg-gradient-to-b from-black to-gray-900 rounded-lg shadow-xl border border-orange-600 z-50">
            <div className="p-4">
              <p className="text-sky-100 text-sm font-medium mb-3">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowLogoutMenu(false)}
                  className="px-3 py-1 bg-gray-700 text-sky-100 text-sm rounded-lg hover:bg-gray-600 transition-all duration-300 border border-orange-400"
                  disabled={logoutLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all duration-300 border border-orange-400 flex items-center"
                  disabled={logoutLoading}
                >
                  {logoutLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging out...
                    </>
                  ) : (
                    'Logout'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;