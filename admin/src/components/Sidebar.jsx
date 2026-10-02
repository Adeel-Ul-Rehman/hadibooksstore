import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import assets from "../assets/assets";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Define navigation items
  const navItems = [
    { path: "/admin/dashboard", icon: assets.dash_icon, label: "Dashboard" },
    { path: "/admin/hero-images", icon: assets.hero, label: "Hero Images" },
    { path: "/admin/add", icon: assets.add_icon, label: "Add Items" },
    { path: "/admin/list", icon: assets.list_icon, label: "List Items" },
    { path: "/admin/orders", icon: assets.order_icon, label: "Orders" },
  ];

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking on overlay or pressing Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
    };
  }, [isSidebarOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      const sidebar = document.querySelector(".sidebar-container");
      const menuButton = document.querySelector(".menu-button");

      if (
        isSidebarOpen &&
        sidebar &&
        !sidebar.contains(e.target) &&
        menuButton &&
        !menuButton.contains(e.target) &&
        window.innerWidth < 768
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  // Prevent body scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);

  return (
    <>
      {/* Mobile overlay with blur effect */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-transparent backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />  
      )}

      {/* Sidebar */}
      <div
        className={`
        sidebar-container fixed md:relative h-full transition-transform duration-300 ease-in-out z-50
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }
        w-64
      `}
      >
        <div className="h-full bg-gradient-to-b from-black to-gray-900 shadow-xl border-r border-orange-600 flex flex-col">
          {/* Header with close button for mobile */}
          <div className="p-4 border-b border-orange-600 flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">
              Admin Navigation
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-orange-400 hover:text-orange-300 p-1 rounded"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation items */}
          <nav className="p-4 space-y-3 mt-2 flex-1 overflow-y-auto">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 group border
                  ${
                    isActive
                      ? "bg-red-700 text-white border-orange-500 shadow-lg"
                      : "bg-gray-800 text-sky-100 border-gray-700 hover:bg-red-800 hover:text-white hover:border-orange-400"
                  }`
                }
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-2 rounded-lg transition-colors duration-300 ${
                        isActive
                          ? "bg-orange-500"
                          : "bg-gray-700 group-hover:bg-orange-600"
                      }`}
                    >
                      <img
                        src={item.icon}
                        alt={item.label}
                        className="h-5 w-5 filter invert"
                      />
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer section */}
          <div className="p-4 border-t border-orange-600">
            <div className="text-orange-300 text-xs text-center">
              <p className="font-semibold">Hadi Books Store</p>
              <p className="mt-1 text-sky-200">Admin Panel v1.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button that's always visible */}
      <button
        className="menu-button fixed bottom-4 right-4 md:hidden z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <img
          src={isSidebarOpen ? assets.cross_icon : assets.menu}
          alt="Menu"
          className="h-6 w-6 filter invert"
        />
      </button>
    </>
  );
};

export default Sidebar;