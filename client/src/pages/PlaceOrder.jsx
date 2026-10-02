import React, { useContext, useState, useEffect, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import { AppContext } from "../context/AppContext";
import Title from "../components/Title";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FiCreditCard, FiTruck, FiMapPin } from "react-icons/fi";
import { BsCheckCircleFill } from "react-icons/bs";
import validator from "validator";

const PlaceOrder = () => {
  const {
    products,
    currency,
    cartItems,
    setCartItems,
    processCheckout,
    calculateCheckout,
    uploadPaymentProof,
    fetchCart,
    TAX_RATE,
    SHIPPING_FEE,
  } = useContext(ShopContext);
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const googleAuthHandled = useRef(false);

  const [formData, setFormData] = useState({
    firstName: user?.name || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    address: user?.address || "",
    city: user?.city || "",
    postCode: user?.postCode || "",
    country: user?.country || "Pakistan", // Default to Pakistan
    mobileNumber: user?.mobileNumber || "",
    paymentMethod: "cod",
    saveInfo: true,
    onlinePaymentOption: "",
  });
  const [totals, setTotals] = useState({
    subtotal: 0,
    taxes: 0,
    shippingFee: SHIPPING_FEE,
    total: 0,
    items: [],
  });
  const [paymentProof, setPaymentProof] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOnlinePaymentModal, setShowOnlinePaymentModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [initialCartLength, setInitialCartLength] = useState(cartItems.length);

  // Handle Google login redirect and refresh cart
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const loginSuccess = urlParams.get("login");
    const source = urlParams.get("source");

    if (loginSuccess === "success" && source === "google" && !googleAuthHandled.current) {
      googleAuthHandled.current = true;
        // Try to restore sessionStorage entries; fallback to localStorage backups if missing
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
          console.warn('PlaceOrder: error restoring google auth backups', err);
        }
        fetchCart(); // Refresh cart data after Google login
        try { sessionStorage.removeItem('googleAuthLocalCart'); } catch(e){}
        try { localStorage.removeItem('googleAuthLocalCartBackup'); } catch(e){}
    }
  }, [location, fetchCart]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (initialCartLength === 0 && !orderPlaced) {
      navigate("/cart");
      return;
    }

    const calculateTotals = async () => {
      if (cartItems.length === 0) {
        return; // Skip calculation if cart is empty (e.g., after order placement)
      }

      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      const result = await calculateCheckout(items);
      if (result.success) {
        setTotals({
          subtotal: result.subtotal,
          taxes: result.taxes,
          shippingFee: result.shippingFee,
          total: result.total,
          items: result.items,
        });
      }
    };
    calculateTotals();
  }, [
    user,
    initialCartLength,
    cartItems,
    calculateCheckout,
    navigate,
    orderPlaced,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "paymentMethod" && value === "online") {
      setShowOnlinePaymentModal(true);
    } else if (name === "paymentMethod" && value === "cod") {
      setShowOnlinePaymentModal(false);
      setFormData((prev) => ({ ...prev, onlinePaymentOption: "" }));
      setPaymentProof(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const filetypes = /jpeg|jpg|png|webp/;
      const extname = filetypes.test(file.name.toLowerCase());
      const mimetype = filetypes.test(file.type);
      if (!extname || !mimetype) {
        toast.error("Please upload an image (jpeg, jpg, png, or webp)", {
          position: "top-center",
          autoClose: 3000,
        });
        setPaymentProof(null);
        return;
      }
      if (file.size > 250 * 1024) {
        toast.error("File size must be less than 250KB", {
          position: "top-center",
          autoClose: 3000,
        });
        setPaymentProof(null);
        return;
      }
      setPaymentProof(file);
      setErrors((prev) => ({ ...prev, paymentProof: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.lastName) newErrors.lastName = "Last Name is required";
    if (!formData.email || !validator.isEmail(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.country) newErrors.country = "Country is required";
    // postCode is optional - not validated
    if (
      !formData.mobileNumber ||
      !validator.isMobilePhone(formData.mobileNumber, "any")
    ) {
      newErrors.mobileNumber = "Valid mobile number is required";
    }
    if (formData.paymentMethod === "online" && !formData.onlinePaymentOption) {
      newErrors.onlinePaymentOption = "Please select a payment option";
    }
    if (formData.paymentMethod === "online" && !paymentProof) {
      newErrors.paymentProof = "Payment proof is required for online payments";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user || !user.id) {
      toast.error("Please log in to place an order", {
        position: "top-center",
        autoClose: 3000,
      });
      navigate('/login?redirect=/place-order');
      return;
    }
    
    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items before checkout.", {
        position: "top-center",
        autoClose: 3000,
      });
      navigate('/collections');
      return;
    }
    
    if (!validateForm()) {
      // Show specific validation errors
      const errorMessages = Object.values(errors).filter(Boolean);
      if (errorMessages.length > 0) {
        errorMessages.forEach((msg, index) => {
          setTimeout(() => {
            toast.error(msg, {
              position: "top-center",
              autoClose: 4000,
            });
          }, index * 100); // Stagger toasts slightly
        });
      }
      return;
    }

    setIsSubmitting(true);
    const prevCartItems = [...cartItems]; // Store previous cart state for rollback
    try {
      // Auto-fill postal code with "N/A" if empty
      const cleanedFormData = {
        ...formData,
        postCode: formData.postCode?.trim() || "N/A", // Default to "N/A" if empty
      };
      
      const checkoutPayload = {
        ...cleanedFormData,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        taxes: totals.taxes,
        shippingFee: totals.shippingFee,
      };

      console.log('🛒 FULL Checkout Payload:', checkoutPayload);

      const checkoutResponse = await processCheckout(checkoutPayload);
      console.log('📦 Checkout Response:', checkoutResponse);
      
      if (checkoutResponse.success) {
        setOrderPlaced(true); // Set orderPlaced true immediately after success
        toast.success("Order placed successfully", {
          position: "top-center",
          autoClose: 3000,
        });
        // Clear cart after successful order
        setCartItems([]); // Clear the cart in ShopContext
        localStorage.removeItem("localCart"); // Clear local storage
        sessionStorage.removeItem("localCart"); // Clear session storage

        if (formData.paymentMethod === "online" && paymentProof) {
          const uploadResponse = await uploadPaymentProof(
            checkoutResponse.order.id,
            paymentProof
          );
          if (uploadResponse.success) {
            toast.success("Payment proof uploaded successfully", {
              position: "top-center",
              autoClose: 3000,
            });
          } else {
            toast.error(
              uploadResponse.message || "Failed to upload payment proof",
              { position: "top-center", autoClose: 3000 }
            );
            // Still show thank you even if proof upload fails, as order is placed
          }
        }
        setShowThankYou(true);
        setTimeout(() => {
          setShowThankYou(false);
          navigate("/orders", { replace: true });
        }, 7000); // Increased to 7 seconds for longer display
      } else {
        console.error('❌ Checkout failed:', checkoutResponse);
        // Show specific error message from backend
        const errorMsg = checkoutResponse.message || "Failed to place order";
        toast.error(errorMsg, {
          position: "top-center",
          autoClose: 4000,
        });
        setCartItems(prevCartItems); // Revert cart if checkout fails
      }
    } catch (error) {
      console.error("❌ Checkout Error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      // Show specific error message from backend or network error
      const errorMsg = error.response?.data?.message || "Network error. Please check your connection and try again.";
      toast.error(errorMsg, {
        position: "top-center",
        autoClose: 4000,
      });
      setCartItems(prevCartItems); // Revert cart on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (item) => {
    if (!item) return "https://placehold.co/300x300?text=Book+Image";
    if (Array.isArray(item.productImage))
      return (
        item.productImage[0] || "https://placehold.co/300x300?text=Book+Image"
      );
    if (typeof item.productImage === "string")
      return (
        item.productImage || "https://placehold.co/300x300?text=Book+Image"
      );
    return "https://placehold.co/300x300?text=Book+Image";
  };

  const handleOnlinePaymentModalClose = (confirm) => {
    if (!confirm) {
      setFormData((prev) => ({
        ...prev,
        paymentMethod: "cod",
        onlinePaymentOption: "",
      }));
      setPaymentProof(null);
    }
    setShowOnlinePaymentModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100"
      role="main"
      aria-label="Place Order Page"
    >
      <div className="max-w-7xl mx-auto">
        <Title text1="CHECK" text2="OUT" />

        {cartItems.length === 0 && !orderPlaced ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600 mb-4">Your cart is empty.</p>
            <button
              onClick={() => navigate("/collections")}
              className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300"
            >
              Continue Shopping
            </button>
          </motion.div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 flex-col md:flex-row">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg p-6 h-fit md:sticky md:top-6 order-1 md:order-2 md:col-span-1"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {totals.items.map((item, index) => (
                    <motion.div
                      key={`${item.productId}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      <img
                        src={getImageUrl(item)}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-xl"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-[#00308F]">
                        {currency}
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>
                      {currency}
                      {totals.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                    <span>
                      {currency}
                      {totals.taxes.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>
                      {currency}
                      {totals.shippingFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-lg mt-2">
                    <span>Total</span>
                    <span>
                      {currency}
                      {totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Shipping Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 space-y-6 order-2 md:order-1"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiMapPin className="text-red-500" />
                  Shipping Information
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                        aria-required="true"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                        aria-required="true"
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                      aria-required="true"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                      aria-required="true"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700"
                      >
                        City <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                        aria-required="true"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="postCode"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Postal Code <span className="text-gray-400 text-sm">(optional)</span>
                      </label>
                      <input
                        type="text"
                        id="postCode"
                        name="postCode"
                        value={formData.postCode}
                        onChange={handleChange}
                        className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      {errors.postCode && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.postCode}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Country <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                        aria-required="true"
                      >
                        <option value="">Select Country</option>
                        <option value="Pakistan">Pakistan</option>
                      </select>
                      {errors.country && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="mobileNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Mobile Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                      aria-required="true"
                    />
                    {errors.mobileNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.mobileNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="saveInfo"
                      name="saveInfo"
                      checked={formData.saveInfo}
                      onChange={handleChange}
                      className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="saveInfo"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Save this address for future orders
                    </label>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 mt-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FiCreditCard className="text-red-500" />
                      Payment Method
                    </h2>
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer whitespace-nowrap">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={formData.paymentMethod === "cod"}
                            onChange={handleChange}
                            className="form-radio text-red-500"
                          />
                          <span className="text-gray-700 text-sm sm:text-base">
                            Cash on Delivery
                          </span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer whitespace-nowrap">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="online"
                            checked={formData.paymentMethod === "online"}
                            onChange={handleChange}
                            className="form-radio text-red-500"
                          />
                          <span className="text-gray-700 text-sm sm:text-base">
                            Pay Online
                          </span>
                        </label>
                      </div>

                      {formData.paymentMethod === "online" && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <label
                              htmlFor="onlinePaymentOption"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Select Payment Option
                            </label>
                            <select
                              id="onlinePaymentOption"
                              name="onlinePaymentOption"
                              value={formData.onlinePaymentOption}
                              onChange={handleChange}
                              className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              <option value="">Select a payment option</option>
                              <option value="JazzCash">JazzCash</option>
                              <option value="EasyPaisa">EasyPaisa</option>
                              <option value="BankTransfer">
                                Bank Transfer
                              </option>
                            </select>
                            {errors.onlinePaymentOption && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.onlinePaymentOption}
                              </p>
                            )}
                          </div>

                          {formData.onlinePaymentOption && (
                            <div className="mt-4 space-y-4">
                              {formData.onlinePaymentOption === "JazzCash" && (
                                <div className="p-4 bg-gray-50 rounded-xl">
                                  <h3 className="text-lg font-semibold text-gray-800">
                                    JazzCash Payment
                                  </h3>
                                  <p className="text-sm text-gray-700">
                                    Pay to:{" "}
                                    <span className="font-bold">
                                      Adeel Rehman
                                    </span>
                                    <br />
                                    Mobile Number:{" "}
                                    <span className="font-bold">
                                      03090005634
                                    </span>
                                    <br />
                                    <span className="text-red-600 font-semibold">
                                      Ensure the payment is sent to the correct
                                      number. We are not responsible for
                                      incorrect payments.
                                    </span>
                                  </p>
                                </div>
                              )}
                              {formData.onlinePaymentOption === "EasyPaisa" && (
                                <div className="p-4 bg-gray-50 rounded-xl">
                                  <h3 className="text-lg font-semibold text-gray-800">
                                    EasyPaisa Payment
                                  </h3>
                                  <p className="text-sm text-gray-700">
                                    Pay to:{" "}
                                    <span className="font-bold">
                                      Adeel Rehman
                                    </span>
                                    <br />
                                    Mobile Number:{" "}
                                    <span className="font-bold">
                                      03090005634
                                    </span>
                                    <br />
                                    <span className="text-red-600 font-semibold">
                                      Ensure the payment is sent to the correct
                                      number. We are not responsible for
                                      incorrect payments.
                                    </span>
                                  </p>
                                </div>
                              )}
                              {formData.onlinePaymentOption ===
                                "BankTransfer" && (
                                <div className="p-4 bg-gray-50 rounded-xl">
                                  <h3 className="text-lg font-semibold text-gray-800">
                                    Bank Transfer
                                  </h3>
                                  <p className="text-sm text-gray-700">
                                    Pay to:{" "}
                                    <span className="font-bold">
                                      Adeel Rehman
                                    </span>
                                    <br />
                                    IBAN:{" "}
                                    <span className="font-bold">
                                      PK11JSBL9999903090005634
                                    </span>
                                    <br />
                                    Bank:{" "}
                                    <span className="font-bold">JS Bank</span>
                                    <br />
                                    <span className="text-red-600 font-semibold">
                                      Ensure the payment is sent to the correct
                                      IBAN. We are not responsible for incorrect
                                      payments.
                                    </span>
                                  </p>
                                </div>
                              )}
                              <div>
                                <label
                                  htmlFor="paymentProof"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Upload Payment Proof
                                </label>
                                <input
                                  type="file"
                                  id="paymentProof"
                                  accept="image/jpeg,image/jpg,image/png,image/webp"
                                  onChange={handleFileChange}
                                  className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                {errors.paymentProof && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors.paymentProof}
                                  </p>
                                )}
                                <p className="text-sm text-gray-600 mt-2">
                                  Upload a clear screenshot of your payment
                                  confirmation (jpeg, jpg, png, or webp, max
                                  250KB). Our admin will verify the payment
                                  within 24 hours. If the payment is valid, your
                                  order will be marked as paid and confirmed. If
                                  the payment is incorrect or underpaid, it will
                                  be refunded within 3 business days, and the
                                  order will be cancelled.
                                  <br />
                                  <span className="text-red-600 font-semibold">
                                    Warning: Submitting fake or manipulated
                                    screenshots will lead to legal consequences.
                                  </span>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-2xl hover:from-red-500 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                    aria-label="Place order"
                  >
                    <FiTruck />
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Online Payment Confirmation Modal */}
        {showOnlinePaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="absolute inset-0 backdrop-blur-sm bg-transparent" />
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg z-10"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Online Payment Notice
              </h3>
              <p className="text-sm text-gray-700 mb-6">
                We will bring a proper online payment system very soon! Until
                then, please use the manual payment methods provided below.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => handleOnlinePaymentModalClose(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-400 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleOnlinePaymentModalClose(true)}
                  className="px-4 py-2 bg-gradient-to-r from-red-400 to-orange-500 text-white font-medium rounded-xl hover:from-red-500 hover:to-orange-600 transition-all duration-300"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Thank You Modal */}
        {showThankYou && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="absolute inset-0 backdrop-blur-sm bg-transparent" />
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg z-10"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Thank You for Shopping!
              </h3>
              <p className="text-sm text-gray-700 mb-6">
                Your order has been placed successfully. You will receive a
                confirmation soon.
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PlaceOrder;