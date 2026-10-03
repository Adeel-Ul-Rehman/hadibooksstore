import React, { useState, useContext, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import SearchBar from "./SearchBar";
import { FiHeart, FiX, FiMenu, FiUser, FiLogOut, FiShoppingBag, FiHome, FiBook, FiInfo, FiMail } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, syncAfterGoogleLogin } = useContext(AppContext);
  const { getCartCount, getWishlistCount } = useContext(ShopContext);

  // Check for authentication when location changes (especially after Google OAuth)
  useEffect(() => {
    const checkAuthAfterNavigation = async () => {
      const urlParams = new URLSearchParams(location.search);
      const loginSuccess = urlParams.get('login');
      const source = urlParams.get('source');
      
      if (loginSuccess === 'success' && source === 'google' && !user) {
        console.log('\ud83d\udd04 Navbar: Google OAuth detected, checking auth...');
        // Ensure we have updated auth state first
        await isAuthenticated();

        // Parse sync info from URL params (added by backend)
        const cartSynced = urlParams.get('cartSynced');
        const wishlistSynced = urlParams.get('wishlistSynced');
        const syncErrorsParam = urlParams.get('syncErrors');
        const localCartParam = urlParams.get('localCart');
        const localWishlistParam = urlParams.get('localWishlist');

        let syncErrors = null;
        try {
          if (syncErrorsParam) syncErrors = JSON.parse(syncErrorsParam);
        } catch (e) {
          console.warn('Failed to parse syncErrors from URL:', e);
        }

        // If backend provided explicit sync status, use it to clear local storage
        if (cartSynced !== null || wishlistSynced !== null) {
          if (cartSynced === 'true') {
            localStorage.removeItem('localCart');
          } else if (urlParams.get('cartCount') && parseInt(urlParams.get('cartCount')) > 0) {
          }

          if (wishlistSynced === 'true') {
            localStorage.removeItem('localWishlist');
          } else if (urlParams.get('wishlistCount') && parseInt(urlParams.get('wishlistCount')) > 0) {
          }

          if (syncErrors && syncErrors.length > 0) {
            console.warn('Sync errors after Google login:', syncErrors);
            toast.warning('Some items could not be synced. They are still in local storage.');
          }
        } else {
          // No explicit sync status — fallback: if local data was sent we may trigger client-side sync endpoint
          if ((localCartParam || localWishlistParam) && typeof syncAfterGoogleLogin === 'function') {
            let localCart = [];
            let localWishlist = [];
            try {
              if (localCartParam) localCart = JSON.parse(localCartParam);
              if (localWishlistParam) localWishlist = JSON.parse(localWishlistParam);
            } catch (e) {
              console.warn('Failed to parse local data from URL params:', e);
            }

            if ((localCart.length > 0 || localWishlist.length > 0) && user) {
              try {
                const res = await syncAfterGoogleLogin(localCart, localWishlist);
                if (res.success) {
                  if (res.cartSynced) localStorage.removeItem('localCart');
                  if (res.wishlistSynced) localStorage.removeItem('localWishlist');
                }
              } catch (e) {
                console.warn('Fallback syncAfterGoogleLogin failed:', e);
              }
            }
          }
        }

        // Clean URL to remove sensitive/verbose params
        try {
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } catch (e) {
          console.warn('Failed to replace URL after Google login:', e);
        }
      }
    };

    checkAuthAfterNavigation();
  }, [location, user, isAuthenticated]);

  const handleProfileMouseLeave = () => {
    if (window.innerWidth > 768) {
      const timer = setTimeout(() => {
        if (!document.querySelector(".profile-menu:hover")) {
          setShowProfileMenu(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
      setMobileMenuOpen(false);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const getUserInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : "U";
  };

  const menuItems = [
    { path: "/", label: "HOME", icon: <FiHome className="w-5 h-5" /> },
    { path: "/collections", label: "COLLECTIONS", icon: <FiBook className="w-5 h-5" /> },
    { path: "/about", label: "ABOUT", icon: <FiInfo className="w-5 h-5" /> },
    { path: "/contact", label: "CONTACT", icon: <FiMail className="w-5 h-5" /> },
  ];

  // Fixed: Close profile menu when clicking anywhere on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && showProfileMenu) {
        if (!event.target.closest('.profile-menu') && !event.target.closest('.profile-button')) {
          setShowProfileMenu(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  return (
    <header className="sticky top-0 z-50 editorial-glass dark:editorial-glass-dark border-b border-stone-200/80 dark:border-stone-800 shadow-[0_4px_20px_-4px_rgba(28,25,23,0.05)] transition-colors duration-200">
      {/* Main Navbar */}
      <nav className="flex justify-between items-center py-2 px-4 sm:px-6 lg:px-8 h-16 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/logo.png"
            onClick={() => navigate("/")}
            alt="Hadi Books Store Logo"
            className="w-20 h-20 -my-2 cursor-pointer hover:opacity-90 transition-opacity duration-200"
          />
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-xs uppercase tracking-[0.2em] font-semibold py-1 transition-all duration-200 relative ${
                  isActive
                    ? "text-stone-900 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                }`
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <span className="relative">
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-amber-600 rounded-full"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search */}
          <SearchBar isNavbar={true} />

          {/* Wishlist */}
          <button
            className="relative p-2 rounded-full text-stone-700 dark:text-stone-300 hover:text-amber-700 hover:bg-stone-100/60 dark:hover:bg-stone-800/60 transition-colors duration-200 cursor-pointer"
            onClick={() => navigate("/wishlist")}
            aria-label="View wishlist"
          >
            <FiHeart className="w-5 h-5" />
            {getWishlistCount() > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                {getWishlistCount()}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            className="relative p-2 rounded-full text-stone-700 dark:text-stone-300 hover:text-amber-700 hover:bg-stone-100/60 dark:hover:bg-stone-800/60 transition-colors duration-200 cursor-pointer"
            onClick={() => navigate("/cart")}
            aria-label="View cart"
          >
            <img src={assets.cart_icon} alt="Cart" className="w-5 h-5 dark:invert" />
            {getCartCount() > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-stone-900 dark:bg-amber-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                {getCartCount()}
              </span>
            )}
          </button>

          {/* Profile */}
          <div
            className="relative group profile-button"
            onMouseEnter={() =>
              window.innerWidth > 768 && setShowProfileMenu(true)
            }
            onMouseLeave={handleProfileMouseLeave}
            onClick={() =>
              window.innerWidth <= 768 && setShowProfileMenu(!showProfileMenu)
            }
          >
            <button
              className="p-1 rounded-full cursor-pointer transition-transform duration-200 hover:scale-105"
              aria-label="Profile menu"
            >
              {user ? (
                user.profilePicture ? (
                  <img
                    src={`${user.profilePicture}?t=${Date.now()}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-stone-300 dark:border-stone-700 shadow-sm"
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/40?text=User")
                    }
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center text-xs font-semibold shadow-sm">
                    {getUserInitial()}
                  </div>
                )
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-amber-700">
                  <FiUser className="w-4 h-4" />
                </div>
              )}
            </button>
            <AnimatePresence>
              {(showProfileMenu || mobileMenuOpen) && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="profile-menu absolute right-0 mt-2 w-52 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl shadow-xl py-1.5 z-50 border border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200"
                  onMouseEnter={() => setShowProfileMenu(true)}
                  onMouseLeave={handleProfileMouseLeave}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2.5 text-xs text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800">
                        Signed in as <strong className="text-stone-800 dark:text-stone-200 block truncate">{user.name}</strong>
                        {user.authProvider === 'google' && (
                          <span className="inline-block mt-0.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium tracking-wide">Google Account</span>
                        )}
                      </div>
                      <NavLink
                        to="/account"
                        className="flex items-center px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100/80 dark:hover:bg-stone-800/80 transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        aria-label="My Account"
                      >
                        <FiUser className="w-4 h-4 mr-2.5 text-stone-400" />
                        My Account
                      </NavLink>
                      <NavLink
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100/80 dark:hover:bg-stone-800/80 transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        aria-label="My Orders"
                      >
                        <FiShoppingBag className="w-4 h-4 mr-2.5 text-stone-400" />
                        My Orders
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        aria-label="Logout"
                      >
                        <FiLogOut className="w-4 h-4 mr-2.5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/login"
                        className="flex items-center px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100/80 dark:hover:bg-stone-800/80 transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        aria-label="Login"
                      >
                        <FiUser className="w-4 h-4 mr-2.5 text-stone-400" />
                        Login
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="flex items-center px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100/80 dark:hover:bg-stone-800/80 transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        aria-label="Register"
                      >
                        <FiUser className="w-4 h-4 mr-2" />
                        Register
                      </NavLink>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center p-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Toggle mobile menu"
          >
            <FiMenu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay with blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "tween", 
                duration: 0.25,
                ease: "easeOut"
              }}
              className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-[#FAF7F2] dark:bg-[#151619] shadow-2xl z-50 flex flex-col border-l border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200"
            >
              {/* Header with Close Button */}
              <div className="flex justify-between items-center p-5 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center">
                  <img
                    src="/logo.png"
                    alt="Hadi Books Store"
                    className="w-10 h-10 mr-3"
                  />
                  <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">Menu</h3>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800 transition duration-150"
                  aria-label="Close menu"
                >
                  <FiX className="w-5 h-5 text-stone-600 dark:text-stone-300" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {/* Navigation Links */}
                <div className="space-y-1.5 mb-8">
                  <h4 className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3">
                    Explore
                  </h4>
                  {menuItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center w-full px-4 py-2.5 rounded-xl transition-all duration-150 ${
                          isActive
                            ? "bg-amber-600/10 text-amber-800 dark:text-amber-400 font-semibold border border-amber-600/20"
                            : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60"
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="mr-3 text-stone-500 dark:text-stone-400">{item.icon}</span>
                      <span className="text-sm font-medium tracking-wide">{item.label}</span>
                    </NavLink>
                  ))}
                </div>

                {/* User Section */}
                <div className="space-y-1.5 border-t border-stone-200 dark:border-stone-800 pt-5">
                  <h4 className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3">
                    Account
                  </h4>
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-xs text-stone-500 dark:text-stone-400 border-b border-stone-200/60 dark:border-stone-800 mb-2">
                        Signed in as <strong className="text-stone-900 dark:text-stone-100 block truncate">{user.name}</strong>
                        {user.authProvider === 'google' && (
                          <span className="inline-block mt-0.5 text-emerald-600 dark:text-emerald-400 text-[10px]">Google Account</span>
                        )}
                      </div>
                      <NavLink
                        to="/account"
                        className="flex items-center w-full px-4 py-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition duration-150"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiUser className="w-4 h-4 mr-3 text-stone-400" />
                        <span className="text-sm font-medium">My Account</span>
                      </NavLink>
                      <NavLink
                        to="/orders"
                        className="flex items-center w-full px-4 py-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition duration-150"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiShoppingBag className="w-4 h-4 mr-3 text-stone-400" />
                        <span className="text-sm font-medium">My Orders</span>
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition duration-150"
                      >
                        <FiLogOut className="w-4 h-4 mr-3" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/login"
                        className="flex items-center w-full px-4 py-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition duration-150"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiUser className="w-4 h-4 mr-3 text-stone-400" />
                        <span className="text-sm font-medium">Login</span>
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="flex items-center w-full px-4 py-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition duration-150"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiUser className="w-4 h-4 mr-3 text-stone-400" />
                        <span className="text-sm font-medium">Register</span>
                      </NavLink>
                    </>
                  )}
                </div>
              </div>

              {/* Footer with WhatsApp */}
              <div className="p-5 border-t border-stone-200 dark:border-stone-800">
                <a
                  href="https://wa.me/923090005634"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-emerald-600 text-white py-3 px-4 rounded-xl hover:bg-emerald-700 transition duration-150 font-medium text-sm shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <img src={assets.whatsapp_icon} alt="WhatsApp" className="w-5 h-5 mr-2" />
                  Contact via WhatsApp
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/923090005634"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40"
        aria-label="Contact via WhatsApp"
      >
        <motion.img
          src={assets.whatsapp_icon}
          alt="WhatsApp"
          className="w-14 h-14"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
      </a>
    </header>
  );
};

export default Navbar;