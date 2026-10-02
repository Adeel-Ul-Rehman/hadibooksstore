import React, { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiLock,
  FiEdit,
  FiCopy,
  FiShoppingBag,
  FiLogOut,
  FiHome,
  FiMapPin,
  FiX,
  FiCamera,
  FiTrash2,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiCheckSquare,
  FiBox,
  FiShoppingCart,
  FiDollarSign,
  FiShield,
} from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { toast } from "react-toastify";
import { Dialog, Transition } from "@headlessui/react";

// Base64 placeholder image
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23A1A1AA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";

const Account = () => {
  const {
    user,
    updateUser,
    deleteAccount,
    logout,
    apiRequest,
    removeProfilePicture,
    isAuthenticated,
    isGoogleAuthInProgress,
    setIsGoogleAuthInProgress
  } = useContext(AppContext);
  const { fetchCart, fetchWishlist, products, currency } =
    useContext(ShopContext);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [addressEditMode, setAddressEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: "",
    lastName: "",
    email: "",
    mobileNumber: "",
  });

  const [addressData, setAddressData] = useState({
    address: "",
    city: "",
    postCode: "",
    country: "Pakistan",
    shippingAddress: "",
  });

  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Check if user is logged in via Google
  const isGoogleUser = user?.authProvider === 'google';

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        lastName: user.lastName || "",
        email: user.email || "",
        mobileNumber: user.mobileNumber || "",
      });

      setAddressData({
        address: user.address || "",
        city: user.city || "",
        postCode: user.postCode || "",
        country: user.country || "Pakistan",
        shippingAddress: user.shippingAddress || "",
      });
    }
  }, [user]);

    useEffect(() => {
    const handleGoogleAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const loginSuccess = urlParams.get('login');
      const source = urlParams.get('source');
      
      if (loginSuccess === 'success' && source === 'google') {
        console.log('🔄 Account: Google OAuth detected, refreshing user data...');
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, '/account');
        
        // Force authentication check
        // Restore any saved local cart/wishlist from session/local backups before auth check
        try {
          const sCart = JSON.parse(sessionStorage.getItem('googleAuthLocalCart') || 'null');
          const sWishlist = JSON.parse(sessionStorage.getItem('googleAuthLocalWishlist') || 'null');
          if (!sCart) {
            const bCart = JSON.parse(localStorage.getItem('googleAuthLocalCartBackup') || '[]');
            if (Array.isArray(bCart) && bCart.length > 0) {
              localStorage.setItem('localCart', JSON.stringify(bCart));
            }
          }
          if (!sWishlist) {
            const bWishlist = JSON.parse(localStorage.getItem('googleAuthLocalWishlistBackup') || '[]');
            if (Array.isArray(bWishlist) && bWishlist.length > 0) {
              localStorage.setItem('localWishlist', JSON.stringify(bWishlist));
            }
          }
        } catch (err) {
          console.warn('Account: error restoring google auth backups', err);
        }
        
        await isAuthenticated();
      }
    };

    handleGoogleAuthRedirect();
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === "orders" && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await apiRequest("get", "/api/orders/get");
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      setOrders([]);
      toast.error("Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="text-yellow-600 text-lg sm:text-xl" />;
      case "confirmed":
        return <FiCheckSquare className="text-blue-600 text-lg sm:text-xl" />;
      case "processing":
        return <FiBox className="text-indigo-600 text-lg sm:text-xl" />;
      case "ready_for_shipment":
        return <FiPackage className="text-purple-600 text-lg sm:text-xl" />;
      case "shipped":
        return <FiTruck className="text-teal-600 text-lg sm:text-xl" />;
      case "out_for_delivery":
        return (
          <FiShoppingCart className="text-orange-600 text-lg sm:text-xl" />
        );
      case "delivered":
        return <FiCheckCircle className="text-green-600 text-lg sm:text-xl" />;
      case "cancelled":
        return <FiXCircle className="text-red-600 text-lg sm:text-xl" />;
      case "refunded":
        return <FiDollarSign className="text-pink-600 text-lg sm:text-xl" />;
      case "partially_refunded":
        return <FiDollarSign className="text-pink-400 text-lg sm:text-xl" />;
      default:
        return <FiPackage className="text-gray-600 text-lg sm:text-xl" />;
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "pending":
        return "Your order is pending confirmation.";
      case "confirmed":
        return "Your order has been confirmed.";
      case "processing":
        return "Your order is being processed.";
      case "ready_for_shipment":
        return "Your order is ready for shipment.";
      case "shipped":
        return "Your order has been shipped.";
      case "out_for_delivery":
        return "Your order is out for delivery.";
      case "delivered":
        return "Your order has been delivered.";
      case "cancelled":
        return "Your order has been cancelled.";
      case "refunded":
        return "Your order has been refunded.";
      case "partially_refunded":
        return "Your order has been partially refunded.";
      default:
        return "Your order status is unknown.";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-indigo-100 text-indigo-800";
      case "ready_for_shipment":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-teal-100 text-teal-800";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-pink-100 text-pink-800";
      case "partially_refunded":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShipmentInfo = (method) => {
    switch (method) {
      case "tcs":
        return {
          name: "TCS",
          link: "https://www.tcsexpress.com/track/",
          guidance:
            "Visit the TCS website and enter your tracking ID to monitor your shipment.",
        };
      case "leopard":
        return {
          name: "Leopard",
          link: "https://www.leopardscourier.com/tracking",
          guidance:
            "Visit the Leopard website and enter your tracking ID to monitor your shipment.",
        };
      case "trax":
        return {
          name: "Trax",
          link: "https://trax.pk/tracking/",
          guidance:
            "Visit the Trax website and enter your tracking ID to monitor your shipment.",
        };
      case "postex":
        return {
          name: "PostEx",
          link: "https://postex.pk/tracking",
          guidance:
            "Visit the PostEx website and enter your tracking ID to monitor your shipment.",
        };
      case "pakistan_post":
        return {
          name: "Pakistan Post",
          link: "https://ep.gov.pk/track.asp",
          guidance:
            "Visit the Pakistan Post website and enter your tracking ID to monitor your shipment.",
        };
      case "other":
        return {
          name: "Other",
          link: "",
          guidance:
            "Contact support for tracking details as this shipment uses a custom method.",
        };
      default:
        return {
          name: "Unknown",
          link: "",
          guidance:
            "No tracking information available. Please contact support.",
        };
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Tracking ID copied to clipboard!"))
      .catch(() => toast.error("Failed to copy tracking ID."));
  };

  const handleTrackOrderClick = (order) => {
    if (order.trackingId && order.shippingMethod) {
      setSelectedTrackingOrder(order);
    } else {
      toast.info("Tracking ID has not been added yet.", {
        position: "top-center",
      });
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name !== "email") {
      setProfileData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 250 * 1024) {
        toast.error("Profile picture must be less than 250KB");
        return;
      }
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and WebP images are allowed");
        return;
      }
      setProfilePicture(file);
    }
  };

  const handleProfileSave = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("lastName", profileData.lastName);
      formData.append("mobileNumber", profileData.mobileNumber);
      if (profilePicture) {
        formData.append("file", profilePicture);
      }
      const data = await updateUser(formData);
      if (data.success) {
        toast.success("Profile updated successfully!");
        setEditMode(false);
        setProfilePicture(null);
      }
    } catch (error) {
      toast.error(
        "Error updating profile: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      setIsLoading(true);
      const data = await removeProfilePicture();
      if (data.success) {
        toast.success("Profile picture removed successfully!");
        setProfilePicture(null);
      }
    } catch (error) {
      toast.error(
        "Error removing profile picture: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSave = async () => {
    try {
      setIsLoading(true);
      const data = await updateUser(addressData);
      if (data.success) {
        toast.success("Address updated successfully!");
        setAddressEditMode(false);
      }
    } catch (error) {
      toast.error(
        "Error updating address: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Google users cannot change password via this method
    if (isGoogleUser) {
      toast.info("Google account users cannot change password here. Please use Google account settings.");
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    if (securityData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    try {
      setIsLoading(true);
      const data = await updateUser({
        oldPassword: securityData.oldPassword,
        newPassword: securityData.newPassword,
      });
      if (data.success) {
        toast.success("Password changed successfully!");
        setSecurityData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error(
        "Error changing password: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDelete = async () => {
    if (isGoogleUser) {
      // For Google users, we don't require password
      if (deleteConfirm !== "DELETE") {
        toast.error('Please type "DELETE" to confirm account deletion');
        return;
      }
    } else {
      // For email users, require password
      if (!deletePassword) {
        toast.error("Please enter your password");
        return;
      }
      if (deleteConfirm !== "DELETE") {
        toast.error('Please type "DELETE" to confirm account deletion');
        return;
      }
    }

    try {
      setIsLoading(true);
      const data = await deleteAccount(user.email, deletePassword || "google-oauth-user");
      if (data.success) {
        toast.success("Account deleted successfully");
        setShowDeleteModal(false);
        navigate("/");
      }
    } catch (error) {
      toast.error(
        "Error deleting account: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      toast.error(
        "Error logging out: " + (error.response?.data?.message || error.message)
      );
    }
  };

  // Show loading screen during Google OAuth authentication
  if (isGoogleAuthInProgress) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 flex items-center justify-center py-12 px-4"
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00308F] mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Completing Google Sign In...
          </h2>
          <p className="text-gray-600">Please wait while we set up your account</p>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 py-12 px-4 sm:px-6 lg:px-8 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <Title text1="ACCOUNT" text2="ACCESS" />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white rounded-xl shadow-md p-6 max-w-md mx-auto"
          >
            <svg
              className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">
              Please{" "}
              <a
                href="/login"
                className="text-red-500 hover:text-red-600 font-semibold transition-colors"
              >
                log in
              </a>{" "}
              to access your account.
            </p>
            <motion.div
              className="mt-6 flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2 px-4 sm:px-6 sm:py-3 bg-[#00308F] text-white font-semibold rounded-lg shadow-sm hover:bg-[#002266] transition-all duration-300 cursor-pointer text-sm sm:text-base"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="w-full py-2 px-4 sm:px-6 sm:py-3 bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-lg shadow-sm hover:from-red-500 hover:to-orange-600 transition-all duration-300 cursor-pointer text-sm sm:text-base"
              >
                Create Account
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      {/* Delete Account Modal */}
      <Transition.Root show={showDeleteModal} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowDeleteModal(false)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
                  <Dialog.Title className="text-lg font-bold text-[#00308F] mb-4">
                    Delete Account
                  </Dialog.Title>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to delete your account? This action
                    cannot be undone.
                  </p>
                  <div className="space-y-4">
                    {!isGoogleUser && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                          placeholder="Enter your password"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Type "DELETE" to confirm
                      </label>
                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                        placeholder="Type DELETE to confirm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-all duration-300 text-sm"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAccountDelete}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-lg shadow-sm hover:from-red-500 hover:to-orange-600 transition-all duration-300 text-sm disabled:opacity-50"
                    >
                      {isLoading ? "Deleting..." : "Delete Account"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="max-w-4xl mx-auto text-center">
        <Title text1="MY" text2="ACCOUNT" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8"
        >
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 h-fit"
          >
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-medium">
                        {user.name && user.name.length > 0 ? (
                          user.name[0].toUpperCase()
                        ) : (
                          <FiUser className="h-6 w-6" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-base font-bold text-[#00308F] tracking-tight truncate">
                    {user.name} {user.lastName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  {isGoogleUser && (
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-xs text-green-600 font-medium">Google Account</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center px-3 py-2 text-sm font-semibold rounded-lg w-full transition-all duration-300 text-left ${
                  activeTab === "profile"
                    ? "bg-gray-100 text-[#00308F]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#00308F]"
                }`}
              >
                <FiUser className="mr-3 h-5 w-5 text-[#00308F] flex-shrink-0" />
                <span className="truncate">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("address")}
                className={`flex items-center px-3 py-2 text-sm font-semibold rounded-lg w-full transition-all duration-300 text-left ${
                  activeTab === "address"
                    ? "bg-gray-100 text-[#00308F]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#00308F]"
                }`}
              >
                <FiHome className="mr-3 h-5 w-5 text-[#00308F] flex-shrink-0" />
                <span className="truncate">Address</span>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center px-3 py-2 text-sm font-semibold rounded-lg w-full transition-all duration-300 text-left ${
                  activeTab === "orders"
                    ? "bg-gray-100 text-[#00308F]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#00308F]"
                }`}
              >
                <FiShoppingBag className="mr-3 h-5 w-5 text-[#00308F] flex-shrink-0" />
                <span className="truncate">My Orders</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center px-3 py-2 text-sm font-semibold rounded-lg w-full transition-all duration-300 text-left ${
                  activeTab === "security"
                    ? "bg-gray-100 text-[#00308F]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#00308F]"
                }`}
              >
                {isGoogleUser ? (
                  <FiShield className="mr-3 h-5 w-5 text-[#00308F] flex-shrink-0" />
                ) : (
                  <FiLock className="mr-3 h-5 w-5 text-[#00308F] flex-shrink-0" />
                )}
                <span className="truncate">Security</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-semibold bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-lg w-full hover:from-red-500 hover:to-orange-600 transition-all duration-300 text-left"
              >
                <FiLogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">Sign Out</span>
              </button>
            </nav>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-bold text-[#00308F] tracking-tight">
                    Profile Information
                  </h2>
                  {editMode ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setProfilePicture(null);
                          setProfileData({
                            name: user.name || "",
                            lastName: user.lastName || "",
                            email: user.email || "",
                            mobileNumber: user.mobileNumber || "",
                          });
                        }}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-all duration-300 text-xs sm:text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProfileSave}
                        disabled={isLoading}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#00308F] text-white rounded-lg shadow-sm hover:bg-[#002266] transition-all duration-300 text-xs sm:text-sm disabled:opacity-50"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-lg shadow-sm hover:from-red-500 hover:to-orange-600 transition-all duration-300 text-xs sm:text-sm"
                    >
                      <FiEdit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Profile Picture Section */}
                    <div className="flex-shrink-0 relative">
                      <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl sm:text-4xl font-medium">
                            {user.name && user.name.length > 0 ? (
                              user.name[0].toUpperCase()
                            ) : (
                              <FiUser className="h-10 w-10 sm:h-12 sm:w-12" />
                            )}
                          </span>
                        )}
                      </div>
                      {editMode && (
                        <>
                          <label
                            htmlFor="profilePicture"
                            className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-sm hover:bg-gray-100 transition-all duration-300 cursor-pointer"
                            title="Change profile picture"
                          >
                            <FiCamera className="h-4 w-4 text-[#00308F]" />
                            <input
                              type="file"
                              id="profilePicture"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handleProfilePictureChange}
                              className="hidden"
                            />
                          </label>
                          {user.profilePicture && (
                            <button
                              onClick={handleRemoveProfilePicture}
                              className="absolute top-0 right-0 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-full p-2 shadow-sm hover:from-red-500 hover:to-orange-600 transition-all duration-300"
                              title="Remove profile picture"
                              disabled={isLoading}
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Profile Details Section */}
                    <div className="flex-1 space-y-6">
                      {isGoogleUser && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <p className="text-sm text-blue-600 font-medium">
                              Google Account - Some profile information is managed by Google
                            </p>
                          </div>
                        </div>
                      )}

                      {editMode && profilePicture && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">
                            New image selected: {profilePicture.name}
                          </p>
                          <p className="text-xs text-green-500 mt-1">
                            Click save to update your profile picture
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-left">
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-600 mb-1"
                          >
                            First Name
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={profileData.name}
                              onChange={handleProfileChange}
                              maxLength={20}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                            />
                          ) : (
                            <p className="text-sm text-gray-800">
                              {profileData.name}
                            </p>
                          )}
                        </div>
                        <div className="text-left">
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-gray-600 mb-1"
                          >
                            Last Name
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={profileData.lastName}
                              onChange={handleProfileChange}
                              maxLength={20}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                            />
                          ) : (
                            <p className="text-sm text-gray-800">
                              {profileData.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-left">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-600 mb-1"
                        >
                          Email Address
                        </label>
                        {editMode ? (
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-800">
                              {profileData.email}
                            </p>
                            {isGoogleUser && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Verified
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-left">
                        <label
                          htmlFor="mobileNumber"
                          className="block text-sm font-medium text-gray-600 mb-1"
                        >
                          Phone Number
                        </label>
                        {editMode ? (
                          <input
                            type="tel"
                            id="mobileNumber"
                            name="mobileNumber"
                            value={profileData.mobileNumber}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                            placeholder="+92 300 1234567"
                          />
                        ) : (
                          <p className="text-sm text-gray-800">
                            {profileData.mobileNumber || "Not provided"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "address" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-bold text-[#00308F] tracking-tight">
                    Address Information
                  </h2>
                  {addressEditMode ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setAddressEditMode(false);
                          setAddressData({
                            address: user.address || "",
                            city: user.city || "",
                            postCode: user.postCode || "",
                            country: user.country || "Pakistan",
                            shippingAddress: user.shippingAddress || "",
                          });
                        }}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-all duration-300 text-xs sm:text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddressSave}
                        disabled={isLoading}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#00308F] text-white rounded-lg shadow-sm hover:bg-[#002266] transition-all duration-300 text-xs sm:text-sm disabled:opacity-50"
                      >
                        {isLoading ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddressEditMode(true)}
                      className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-lg shadow-sm hover:from-red-500 hover:to-orange-600 transition-all duration-300 text-xs sm:text-sm"
                    >
                      <FiMapPin className="mr-2 h-4 w-4" />
                      Edit Address
                    </button>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-6 text-left">
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-600 mb-1"
                      >
                        Street Address
                      </label>
                      {addressEditMode ? (
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={addressData.address}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                        />
                      ) : (
                        <p className="text-sm text-gray-800">
                          {addressData.address || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-600 mb-1"
                        >
                          City
                        </label>
                        {addressEditMode ? (
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={addressData.city}
                            onChange={handleAddressChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                          />
                        ) : (
                          <p className="text-sm text-gray-800">
                            {addressData.city || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="postCode"
                          className="block text-sm font-medium text-gray-600 mb-1"
                        >
                          Postal Code
                        </label>
                        {addressEditMode ? (
                          <input
                            type="text"
                            id="postCode"
                            name="postCode"
                            value={addressData.postCode}
                            onChange={handleAddressChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                          />
                        ) : (
                          <p className="text-sm text-gray-800">
                            {addressData.postCode || "Not provided"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-600 mb-1"
                      >
                        Country
                      </label>
                      {addressEditMode ? (
                        <select
                          id="country"
                          name="country"
                          value={addressData.country}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                        >
                          <option value="Pakistan">Pakistan</option>
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                        </select>
                      ) : (
                        <p className="text-sm text-gray-800">
                          {addressData.country || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="shippingAddress"
                        className="block text-sm font-medium text-gray-600 mb-1"
                      >
                        Shipping Address
                      </label>
                      {addressEditMode ? (
                        <textarea
                          id="shippingAddress"
                          name="shippingAddress"
                          value={addressData.shippingAddress}
                          onChange={handleAddressChange}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                        />
                      ) : (
                        <p className="text-sm text-gray-800 whitespace-pre-line">
                          {addressData.shippingAddress || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-bold text-[#00308F] tracking-tight">
                    My Orders
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  {ordersLoading ? (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-center"
                    >
                      <div className="inline-flex items-center justify-center">
                        <svg
                          className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-[#00308F]"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="ml-3 text-gray-700 text-base sm:text-lg font-medium">
                          Loading orders...
                        </span>
                      </div>
                    </motion.div>
                  ) : orders.length === 0 ? (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-center py-12"
                    >
                      <svg
                        className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="mt-4 text-lg sm:text-xl font-semibold text-gray-900">
                        No Orders Yet
                      </h3>
                      <p className="mt-2 text-gray-600 text-sm sm:text-base">
                        You haven't placed any orders yet. Start exploring our
                        collections!
                      </p>
                      <button
                        onClick={() => navigate("/collections")}
                        className="mt-4 inline-block px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-lg shadow-sm hover:from-red-500 hover:to-orange-600 transition-all duration-300 cursor-pointer text-sm sm:text-base"
                      >
                        Start Shopping
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ staggerChildren: 0.1 }}
                      className="space-y-4"
                    >
                      <AnimatePresence>
                        {orders.map((order, index) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border border-gray-100"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(order.status)}
                                <h3 className="text-base font-bold text-[#00308F] tracking-tight">
                                  Order #{order.id}
                                </h3>
                              </div>
                              <span
                                className={`mt-2 sm:mt-0 text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status.replace(/_/g, " ").toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              Placed on:{" "}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p
                              className={`text-sm ${
                                getStatusColor(order.status).split(" ")[1]
                              }`}
                            >
                              {getStatusDescription(order.status)}
                            </p>
                            {order.estimatedDelivery && (
                              <p className="text-sm text-gray-600 mt-2">
                                Estimated Delivery:{" "}
                                {new Date(
                                  order.estimatedDelivery
                                ).toLocaleDateString()}
                              </p>
                            )}
                            {order.trackingId && (
                              <p className="text-sm text-gray-600 mt-2">
                                Tracking ID: {order.trackingId}
                              </p>
                            )}
                            <div className="space-y-3 mt-4">
                              {order.items.slice(0, 2).map((item, i) => {
                                const product =
                                  products.find(
                                    (p) => p.id === item.productId
                                  ) || item.product;
                                if (!product) return null;
                                const imageSrc = Array.isArray(product.image)
                                  ? product.image[0]
                                  : product.image || PLACEHOLDER_IMAGE;
                                return (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={imageSrc}
                                        alt={product.name}
                                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg shadow-sm transition-transform duration-300 hover:scale-105"
                                        loading="lazy"
                                        onError={(e) => {
                                          e.target.src = PLACEHOLDER_IMAGE;
                                        }}
                                      />
                                      <div>
                                        <p className="text-sm font-medium text-gray-800 truncate max-w-[120px] sm:max-w-[200px]">
                                          {product.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Qty: {item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm font-semibold text-[#00308F]">
                                      {currency}
                                      {(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                );
                              })}
                              {order.items.length > 2 && (
                                <p className="text-xs text-gray-500 text-center">
                                  +{order.items.length - 2} more items
                                </p>
                              )}
                            </div>
                            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <p className="text-sm sm:text-base font-bold text-gray-900">
                                Total: {currency}
                                {order.totalPrice.toFixed(2)}
                              </p>
                              <div className="mt-4 flex flex-row gap-2 w-full flex-wrap justify-center sm:justify-end">
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/product/${
                                        order.items[0]?.productId || ""
                                      }`
                                    )
                                  }
                                  className="px-2 py-1 sm:px-4 sm:py-2 bg-[#00308F] text-white font-semibold rounded-lg shadow-sm hover:bg-[#002266] transition-all duration-300 cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap"
                                  aria-label={`Buy again for order ${order.id}`}
                                >
                                  Buy Again
                                </button>
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-lg shadow-sm hover:from-red-500 hover:to-orange-600 transition-all duration-300 cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap"
                                  aria-label={`View details for order ${order.id}`}
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => handleTrackOrderClick(order)}
                                  className="px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold rounded-lg shadow-sm hover:from-blue-500 hover:to-blue-700 transition-all duration-300 cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap"
                                  aria-label={`View tracking for order ${order.id}`}
                                >
                                  Order Track Id
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-bold text-[#00308F] tracking-tight">
                    Security Settings
                  </h2>
                </div>
                <div className="p-4 sm:p-6 space-y-6 text-left">
                  {isGoogleUser ? (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <FiShield className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-base font-semibold text-blue-900">
                            Google Account Security
                          </h3>
                          <p className="text-sm text-blue-700 mt-1">
                            Your account is secured through Google. To manage your security settings, 
                            please visit your Google Account settings.
                          </p>
                          <a
                            href="https://myaccount.google.com/security"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-300"
                          >
                            Manage Google Security
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-600 mb-1"
                          >
                            Current Password
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="oldPassword"
                            value={securityData.oldPassword}
                            onChange={handleSecurityChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-600 mb-1"
                          >
                            New Password
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={securityData.newPassword}
                            onChange={handleSecurityChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="confirmNewPassword"
                            className="block text-sm font-medium text-gray-600 mb-1"
                          >
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmNewPassword"
                            name="confirmPassword"
                            value={securityData.confirmPassword}
                            onChange={handleSecurityChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-[#00308F] transition-all"
                          />
                        </div>
                        <button
                          onClick={handlePasswordChange}
                          disabled={isLoading}
                          className="px-4 py-2 bg-[#00308F] text-white rounded-lg shadow-sm hover:bg-[#002266] transition-all duration-300 text-sm disabled:opacity-50"
                        >
                          {isLoading ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                      Account Actions
                    </h3>
                    <div className="space-y-4">
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-lg shadow-sm hover:from-red-500 hover:to-orange-600 transition-all duration-300 text-sm"
                      >
                        <FiTrash2 className="mr-2 h-4 w-4" />
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Order Details Modal */}
      <Transition.Root show={!!selectedOrder} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSelectedOrder(null)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl">
                  {selectedOrder && (
                    <>
                      <Dialog.Title className="text-lg font-bold text-[#00308F] mb-4">
                        Order #{selectedOrder.id}
                      </Dialog.Title>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-600">
                            Status:
                          </p>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                              selectedOrder.status
                            )}`}
                          >
                            {selectedOrder.status
                              .replace(/_/g, " ")
                              .toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Order Date:{" "}
                          {new Date(
                            selectedOrder.createdAt
                          ).toLocaleDateString()}
                        </p>
                        <p
                          className={`text-sm ${
                            getStatusColor(selectedOrder.status).split(" ")[1]
                          }`}
                        >
                          {getStatusDescription(selectedOrder.status)}
                        </p>
                        {selectedOrder.estimatedDelivery && (
                          <p className="text-sm text-gray-600">
                            Estimated Delivery:{" "}
                            {new Date(
                              selectedOrder.estimatedDelivery
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {selectedOrder.trackingId && (
                          <p className="text-sm text-gray-600">
                            Tracking ID: {selectedOrder.trackingId}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Shipping Address: {selectedOrder.shippingAddress}
                        </p>
                        <p className="text-sm text-gray-600">
                          Payment Method:{" "}
                          {selectedOrder.paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : "Credit/Debit Card"}
                        </p>
                        <div className="mt-4">
                          <h4 className="font-semibold text-sm text-gray-900 mb-3">
                            Order Items
                          </h4>
                          <div className="space-y-3">
                            {selectedOrder.items.map((item, index) => {
                              const product =
                                products.find((p) => p.id === item.productId) ||
                                item.product;
                              if (!product) return null;
                              const imageSrc = Array.isArray(product.image)
                                ? product.image[0]
                                : product.image || PLACEHOLDER_IMAGE;
                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-3"
                                >
                                  <img
                                    src={imageSrc}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.src = PLACEHOLDER_IMAGE;
                                    }}
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Quantity: {item.quantity} | {currency}
                                      {item.price.toFixed(2)}
                                    </p>
                                  </div>
                                  <p className="text-sm font-semibold text-[#00308F]">
                                    {currency}
                                    {(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-gray-600">
                              Total:
                            </p>
                            <p className="text-lg font-bold text-[#00308F]">
                              {currency}
                              {selectedOrder.totalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <button
                            onClick={() => setSelectedOrder(null)}
                            className="w-full py-2 px-4 bg-[#00308F] text-white font-semibold rounded-lg shadow-sm hover:bg-[#002266] transition-all duration-300 cursor-pointer text-sm"
                            aria-label="Close order details"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <Transition.Root show={!!selectedTrackingOrder} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSelectedTrackingOrder(null)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl">
                  {selectedTrackingOrder && (
                    <>
                      <Dialog.Title className="text-lg font-bold text-[#00308F] mb-4">
                        Tracking Details for Order #{selectedTrackingOrder.id}
                      </Dialog.Title>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-600">
                            Tracking ID:
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#00308F] font-semibold">
                              {selectedTrackingOrder.trackingId}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  selectedTrackingOrder.trackingId
                                )
                              }
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-all duration-300"
                              aria-label="Copy tracking ID"
                            >
                              <FiCopy className="text-gray-600" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-600">
                            Shipment Method:
                          </p>
                          <span className="text-sm text-[#00308F] font-semibold">
                            {
                              getShipmentInfo(
                                selectedTrackingOrder.shippingMethod
                              ).name
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {
                            getShipmentInfo(
                              selectedTrackingOrder.shippingMethod
                            ).guidance
                          }
                        </p>
                        {getShipmentInfo(selectedTrackingOrder.shippingMethod)
                          .link && (
                          <a
                            href={
                              getShipmentInfo(
                                selectedTrackingOrder.shippingMethod
                              ).link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center text-sm text-blue-600 hover:underline"
                          >
                            Go to{" "}
                            {
                              getShipmentInfo(
                                selectedTrackingOrder.shippingMethod
                              ).name
                            }{" "}
                            Tracking Page
                          </a>
                        )}
                        <div className="mt-4 space-y-2">
                          <button
                            onClick={() => setSelectedTrackingOrder(null)}
                            className="w-full py-2 px-4 bg-[#00308F] text-white font-semibold rounded-lg shadow-sm hover:bg-[#002266] transition-all duration-300 cursor-pointer text-sm"
                            aria-label="Close tracking details"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </motion.div>
  );
};

export default Account;